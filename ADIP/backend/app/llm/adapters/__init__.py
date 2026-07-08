"""LLM provider adapters (scaffolds — no runtime dependency)."""
from app.llm.adapters.base import BaseAdapter
from app.llm.adapters.claude_adapter import ClaudeAdapter
from app.llm.adapters.deepseek_adapter import DeepSeekAdapter
from app.llm.adapters.gemini_adapter import GeminiAdapter
from app.llm.adapters.llama_adapter import LlamaAdapter
from app.llm.adapters.lmstudio_adapter import LMStudioAdapter
from app.llm.adapters.mistral_adapter import MistralAdapter
from app.llm.adapters.ollama_adapter import OllamaAdapter
from app.llm.adapters.openai_adapter import OpenAIAdapter
from app.llm.adapters.qwen_adapter import QwenAdapter, QwenCloudAdapter

__all__ = [
    "BaseAdapter",
    "ClaudeAdapter",
    "DeepSeekAdapter",
    "GeminiAdapter",
    "LlamaAdapter",
    "LMStudioAdapter",
    "MistralAdapter",
    "OllamaAdapter",
    "OpenAIAdapter",
    "QwenAdapter",
    "QwenCloudAdapter",
]
