"""Prompt manager + conversation manager (Phase 11 — infrastructure only)."""
from __future__ import annotations

from dataclasses import dataclass, field

from app.llm.templates import TemplateLibrary, template_library
from app.llm.types import Message, Role


class PromptManager:
    """Builds provider-agnostic message lists from named templates."""

    def __init__(self, library: TemplateLibrary | None = None) -> None:
        self.library = library or template_library

    def build(self, template_name: str, **variables: str) -> list[Message]:
        template = self.library.get(template_name)
        if template is None:
            raise KeyError(f"Unknown prompt template '{template_name}'.")
        system, user = template.render(**variables)
        return [Message(Role.SYSTEM, system), Message(Role.USER, user)]


@dataclass
class Conversation:
    """A stateful, in-memory conversation (message history)."""

    conversation_id: str
    messages: list[Message] = field(default_factory=list)

    def add(self, role: Role, content: str) -> None:
        self.messages.append(Message(role, content))

    def history(self) -> list[Message]:
        return list(self.messages)


class ConversationManager:
    """Manages multiple conversations by id (in-memory store)."""

    def __init__(self) -> None:
        self._conversations: dict[str, Conversation] = {}

    def get_or_create(self, conversation_id: str) -> Conversation:
        conv = self._conversations.get(conversation_id)
        if conv is None:
            conv = Conversation(conversation_id=conversation_id)
            self._conversations[conversation_id] = conv
        return conv

    def append(self, conversation_id: str, role: Role, content: str) -> Conversation:
        conv = self.get_or_create(conversation_id)
        conv.add(role, content)
        return conv

    def reset(self, conversation_id: str) -> None:
        self._conversations.pop(conversation_id, None)


prompt_manager = PromptManager()
conversation_manager = ConversationManager()
