"""LLM integration layer.

Provider-agnostic abstraction for local/remote LLM integration. The Ollama
adapter supports real local execution (Phase A); OpenAI / Gemini / LM Studio
remain plug-in-compatible scaffolds. When ``LOCAL_LLM_ENABLED`` is false
(default), the platform uses deterministic mock reasoning and makes NO network
call, so it runs fully offline.
"""
from app.llm.context_builder import ContextBuilder
from app.llm.parser import ParsedResponse, parse_response
from app.llm.prompt_log import PromptLog, PromptLogEntry, prompt_log
from app.llm.prompt_manager import (
    ConversationManager,
    PromptManager,
    conversation_manager,
    prompt_manager,
)
from app.llm.reasoning import (
    MockReasoner,
    PromptClassification,
    Reasoner,
    default_reasoner,
)
from app.llm.registry import ModelRegistry, ModelSpec, registry
from app.llm.service import LLMService, llm_service
from app.llm.templates import PromptTemplate, TemplateLibrary, template_library
from app.llm.tokens import estimate_messages_tokens, estimate_tokens, fit_to_context_window
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
    "ParsedResponse",
    "parse_response",
    "PromptLog",
    "PromptLogEntry",
    "prompt_log",
    "ConversationManager",
    "PromptManager",
    "conversation_manager",
    "prompt_manager",
    "MockReasoner",
    "PromptClassification",
    "Reasoner",
    "default_reasoner",
    "ModelRegistry",
    "ModelSpec",
    "registry",
    "LLMService",
    "llm_service",
    "PromptTemplate",
    "TemplateLibrary",
    "template_library",
    "estimate_tokens",
    "estimate_messages_tokens",
    "fit_to_context_window",
    "CompletionRequest",
    "CompletionResponse",
    "LLMProvider",
    "Message",
    "Role",
    "StreamChunk",
    "Usage",
]
