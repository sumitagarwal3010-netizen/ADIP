"""Token estimation + context-window management (Phase A).

Dependency-free heuristics (no tokenizer library). Good enough for budgeting,
logging and context-window trimming without pulling in a heavy dependency.
"""
from __future__ import annotations

from app.llm.types import Message

# Rough heuristic: ~4 characters per token for English/code (industry rule of thumb).
_CHARS_PER_TOKEN = 4


def estimate_tokens(text: str) -> int:
    """Estimate the number of tokens in a string."""
    if not text:
        return 0
    return max(1, (len(text) + _CHARS_PER_TOKEN - 1) // _CHARS_PER_TOKEN)


def estimate_messages_tokens(messages: list[Message]) -> int:
    """Estimate tokens across a message list (adds a small per-message overhead)."""
    total = 0
    for m in messages:
        total += estimate_tokens(m.content) + 4  # role/format overhead
    return total


def fit_to_context_window(
    messages: list[Message], context_window: int, reserve_for_response: int = 512
) -> list[Message]:
    """Trim older messages so the prompt fits the model's context window.

    Always preserves the first system message (if any) and the most recent
    messages; drops the oldest non-system messages until it fits.
    """
    budget = max(256, context_window - reserve_for_response)
    if estimate_messages_tokens(messages) <= budget:
        return messages

    system = [m for m in messages[:1] if m.role.value == "system"]
    rest = messages[len(system):]

    # Keep newest messages that fit within the remaining budget.
    kept: list[Message] = []
    running = estimate_messages_tokens(system)
    for m in reversed(rest):
        t = estimate_tokens(m.content) + 4
        if running + t > budget:
            break
        kept.append(m)
        running += t
    kept.reverse()
    return system + kept
