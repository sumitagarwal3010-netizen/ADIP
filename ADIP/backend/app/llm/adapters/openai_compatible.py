"""OpenAI-compatible chat-completions adapter base (Role 4).

Mistral, DeepSeek and cloud OpenAI-shaped endpoints share the same HTTP
contract. Concrete adapters only supply ``name``, default base URL and optional
API-key resolution — no duplicate HTTP logic.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Iterable

from app.core.logging import get_logger
from app.llm.adapters.base import BaseAdapter, LLMProviderError
from app.llm.tokens import estimate_messages_tokens, estimate_tokens
from app.llm.types import CompletionRequest, CompletionResponse, StreamChunk, Usage

logger = get_logger(__name__)


class OpenAICompatibleAdapter(BaseAdapter):
    """Shared /v1/chat/completions client using stdlib urllib only."""

    api_path: str = "/v1/chat/completions"

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _body(self, request: CompletionRequest, stream: bool) -> bytes:
        body = {
            "model": request.model,
            "messages": [{"role": m.role.value, "content": m.content} for m in request.messages],
            "temperature": request.temperature,
            "stream": stream,
        }
        if request.max_tokens:
            body["max_tokens"] = request.max_tokens
        if request.stop:
            body["stop"] = request.stop
        return json.dumps(body).encode("utf-8")

    def is_available(self) -> bool:
        if not self.api_key and self.name not in ("lmstudio",):
            return False
        try:
            req = urllib.request.Request(
                f"{self.base_url}{self.api_path.replace('/chat/completions', '/models')}",
                headers=self._headers(),
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=min(5, self.timeout_seconds)) as resp:
                return resp.status == 200
        except (urllib.error.URLError, OSError, ValueError):
            return False

    def complete(self, request: CompletionRequest) -> CompletionResponse:
        def _call() -> CompletionResponse:
            req = urllib.request.Request(
                f"{self.base_url}{self.api_path}",
                data=self._body(request, stream=False),
                headers=self._headers(),
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            choice = (payload.get("choices") or [{}])[0]
            content = (choice.get("message") or {}).get("content", "")
            usage_raw = payload.get("usage") or {}
            usage = Usage(
                prompt_tokens=usage_raw.get("prompt_tokens") or estimate_messages_tokens(request.messages),
                completion_tokens=usage_raw.get("completion_tokens") or estimate_tokens(content),
            )
            usage.total_tokens = usage.prompt_tokens + usage.completion_tokens
            return CompletionResponse(
                model=payload.get("model", request.model),
                content=content,
                finish_reason=choice.get("finish_reason", "stop"),
                usage=usage,
                provider=self.name,
            )

        try:
            return self._retry(_call)
        except LLMProviderError:
            raise
        except Exception as exc:  # noqa: BLE001
            raise LLMProviderError(f"{self.name} completion failed: {exc}") from exc

    def stream(self, request: CompletionRequest) -> Iterable[StreamChunk]:
        req = urllib.request.Request(
            f"{self.base_url}{self.api_path}",
            data=self._body(request, stream=True),
            headers=self._headers(),
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                for raw_line in resp:
                    line = raw_line.decode("utf-8").strip()
                    if not line or not line.startswith("data:"):
                        continue
                    data = line[5:].strip()
                    if data == "[DONE]":
                        yield StreamChunk(delta="", done=True)
                        break
                    try:
                        obj = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    delta = ((obj.get("choices") or [{}])[0].get("delta") or {}).get("content", "")
                    done = (obj.get("choices") or [{}])[0].get("finish_reason") is not None
                    if delta or done:
                        yield StreamChunk(delta=delta, done=done)
        except Exception as exc:  # noqa: BLE001
            raise LLMProviderError(f"{self.name} streaming failed: {exc}") from exc
