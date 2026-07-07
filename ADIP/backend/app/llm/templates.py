"""Prompt template library (Phase 11 — infrastructure only).

Named, versioned prompt templates with simple ``{placeholder}`` substitution.
Used by the prompt manager to build provider-agnostic messages. No LLM calls.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PromptTemplate:
    name: str
    version: str
    system: str
    user: str

    def render(self, **variables: str) -> tuple[str, str]:
        """Return (system, user) prompts with variables substituted."""
        return self.system.format(**variables), self.user.format(**variables)


class TemplateLibrary:
    """Registry of named prompt templates for the AI SDLC copilots."""

    def __init__(self) -> None:
        self._templates: dict[str, PromptTemplate] = {}
        self._register_defaults()

    def _register_defaults(self) -> None:
        defaults = [
            PromptTemplate(
                name="requirement_analysis",
                version="1.0",
                system="You are the Requirement Copilot for a banking AI SDLC platform. Be precise and regulator-aware.",
                user="Analyze the following requirement for a {project} project and identify gaps:\n\n{content}",
            ),
            PromptTemplate(
                name="architecture_review",
                version="1.0",
                system="You are the Architecture Copilot. Focus on resilience, integration and data design.",
                user="Review the architecture for {project}:\n\n{content}",
            ),
            PromptTemplate(
                name="test_generation",
                version="1.0",
                system="You are the Testing Copilot. Generate functional, negative and reconciliation test cases.",
                user="Generate test cases for {project} feature:\n\n{content}",
            ),
            PromptTemplate(
                name="executive_summary",
                version="1.0",
                system="You are the Executive AI Advisor. Summarize for a CIO audience, concise and outcome-oriented.",
                user="Summarize the AI SDLC posture for {project}:\n\n{content}",
            ),
        ]
        for t in defaults:
            self._templates[t.name] = t

    def register(self, template: PromptTemplate) -> None:
        self._templates[template.name] = template

    def get(self, name: str) -> PromptTemplate | None:
        return self._templates.get(name)

    def list(self) -> list[PromptTemplate]:
        return list(self._templates.values())


template_library = TemplateLibrary()
