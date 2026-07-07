"""LLM provider adapters (scaffolds — no runtime dependency)."""
from app.llm.adapters.base import BaseAdapter
from app.llm.adapters.gemini_adapter import GeminiAdapter
from app.llm.adapters.lmstudio_adapter import LMStudioAdapter
from app.llm.adapters.ollama_adapter import OllamaAdapter
from app.llm.adapters.openai_adapter import OpenAIAdapter

__all__ = ["BaseAdapter", "GeminiAdapter", "LMStudioAdapter", "OllamaAdapter", "OpenAIAdapter"]
