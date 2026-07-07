"""Ollama adapter (Phase A) — real local LLM execution.

Talks to a local Ollama server over HTTP using only the Python standard library
(``urllib``) — no extra dependency. Supports health check, timeout, retry
(via BaseAdapter), non-streaming and streaming completions, and token usage
(from Ollama's response, with an estimation fallback).

The platform still runs fully without Ollama: this adapter is only used when
``LOCAL_LLM_ENABLED=true`` and ``LLM_PROVIDER=ollama``; otherwise deterministic
mock reasoning is used and no network call is made.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Iterable

from app.core.config import settings
from app.core.logging import get_logger
from app.llm.adapters.base import BaseAdapter, LLMProviderError
from app.llm.tokens import estimate_messages_tokens, estimate_tokens
from app.llm.types import CompletionRequest, CompletionResponse, StreamChunk, Usage

logger = get_logger(__name__)


class OllamaAdapter(BaseAdapter):
    name = "ollama"

    DEFAULT_BASE_URL = "http://localhost:11434"

    def __init__(
        self,
        base_url: str | None = None,
        timeout_seconds: int | None = None,
        max_retries: int | None = None,
    ) -> None:
        super().__init__(
            base_url=base_url or settings.ollama_base_url or self.DEFAULT_BASE_URL,
            timeout_seconds=timeout_seconds if timeout_seconds is not None else settings.llm_timeout_seconds,
            max_retries=max_retries if max_retries is not None else settings.llm_max_retries,
        )

    # --- health ---
    def is_available(self) -> bool:
        """True if the Ollama server responds to its version endpoint."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/version", method="GET")
            with urllib.request.urlopen(req, timeout=min(5, self.timeout_seconds)) as resp:
                return resp.status == 200
        except (urllib.error.URLError, OSError, ValueError):
            return False

    def list_models(self) -> list[str]:
        """Return locally available model tags (empty if server unreachable)."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags", method="GET")
            with urllib.request.urlopen(req, timeout=min(10, self.timeout_seconds)) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            return [m.get("name", "") for m in data.get("models", [])]
        except (urllib.error.URLError, OSError, ValueError, json.JSONDecodeError):
            return []

    # --- request building ---
    def _payload(self, request: CompletionRequest, stream: bool) -> bytes:
        body = {
            "model": request.model or settings.ollama_model,
            "messages": [{"role": m.role.value, "content": m.content} for m in request.messages],
            "stream": stream,
            "options": {
                "temperature": request.temperature,
                "num_predict": request.max_tokens or settings.llm_max_tokens,
            },
        }
        if request.stop:
            body["options"]["stop"] = request.stop
        return json.dumps(body).encode("utf-8")

    # --- non-streaming ---
    def complete(self, request: CompletionRequest) -> CompletionResponse:
        def _call() -> CompletionResponse:
            data = self._payload(request, stream=False)
            req = urllib.request.Request(
                f"{self.base_url}/api/chat",
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            content = (payload.get("message") or {}).get("content", "")
            usage = Usage(
                prompt_tokens=payload.get("prompt_eval_count") or estimate_messages_tokens(request.messages),
                completion_tokens=payload.get("eval_count") or estimate_tokens(content),
            )
            usage.total_tokens = usage.prompt_tokens + usage.completion_tokens
            return CompletionResponse(
                model=payload.get("model", request.model),
                content=content,
                finish_reason="stop" if payload.get("done") else "length",
                usage=usage,
                provider=self.name,
            )

        try:
            return self._retry(_call)
        except LLMProviderError:
            raise
        except Exception as exc:  # noqa: BLE001
            raise LLMProviderError(f"Ollama completion failed: {exc}") from exc

    # --- streaming ---
    def stream(self, request: CompletionRequest) -> Iterable[StreamChunk]:
        data = self._payload(request, stream=True)
        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                for raw_line in resp:
                    line = raw_line.decode("utf-8").strip()
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    delta = (obj.get("message") or {}).get("content", "")
                    done = bool(obj.get("done"))
                    if delta or done:
                        yield StreamChunk(delta=delta, done=done)
                    if done:
                        break
        except Exception as exc:  # noqa: BLE001
            raise LLMProviderError(f"Ollama streaming failed: {exc}") from exc
