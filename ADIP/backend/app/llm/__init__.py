"""LLM integration layer (Phase 11).

Provider-agnostic abstraction for future local/remote LLM integration. This
package is INFRASTRUCTURE ONLY — no LLM SDK is imported, no network calls are
made, and adapters are scaffolds. It gives the platform a clean seam to plug in
Ollama / OpenAI / LM Studio later without touching business code.
"""
from app.llm.context_builder import ContextBuilder
from app.llm.prompt_manager import (
    ConversationManager,
    PromptManager,
    conversation_manager,
    prompt_manager,
)
from app.llm.registry import ModelRegistry, ModelSpec, registry
from app.llm.service import LLMService, llm_service
from app.llm.templates import PromptTemplate, TemplateLibrary, template_library
from app.llm.types import (
    CompletionRequest,
    CompletionResponse,
    LLMProvider,
    Message,
    Role,
    StreamChunk,
    Usage,
)

__all__ = [
    "ContextBuilder",
    "ConversationManager",
    "PromptManager",
    "conversation_manager",
    "prompt_manager",
    "ModelRegistry",
    "ModelSpec",
    "registry",
    "LLMService",
    "llm_service",
    "PromptTemplate",
    "TemplateLibrary",
    "template_library",
    "CompletionRequest",
    "CompletionResponse",
    "LLMProvider",
    "Message",
    "Role",
    "StreamChunk",
    "Usage",
]
