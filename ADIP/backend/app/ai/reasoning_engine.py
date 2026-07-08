"""Reasoning engine with CoT / ToT strategy abstraction (Role 6)."""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from app.llm.reasoning import MockReasoner, PromptClassification


class ReasoningStrategy(str, Enum):
    DIRECT = "direct"
    CHAIN_OF_THOUGHT = "chain_of_thought"
    TREE_OF_THOUGHT = "tree_of_thought"


@dataclass
class ReasoningResult:
    classification: PromptClassification
    strategy: ReasoningStrategy
    steps: list[str] = field(default_factory=list)
    confidence: int = 0
    branches: list[str] = field(default_factory=list)


class ReasoningEngine:
    """Wraps the existing Reasoner with explicit strategy metadata."""

    def __init__(self, strategy: ReasoningStrategy = ReasoningStrategy.CHAIN_OF_THOUGHT) -> None:
        self.strategy = strategy
        self._reasoner = MockReasoner()

    def analyze(self, prompt: str, metadata: dict | None = None) -> ReasoningResult:
        classification = self._reasoner.classify(prompt, metadata)
        steps: list[str] = []
        branches: list[str] = []

        if self.strategy == ReasoningStrategy.DIRECT:
            steps = ["Classify prompt"]
        elif self.strategy == ReasoningStrategy.CHAIN_OF_THOUGHT:
            steps = [
                "Parse business intent",
                "Map domain and compliance signals",
                "Estimate complexity and risk",
                "Synthesize recommendation",
            ]
        else:
            branches = [
                "Payments modernization path",
                "Security-hardening path",
                "Regulatory remediation path",
            ]
            steps = ["Explore branches", "Score branches", "Select best path"]

        confidence = min(99, classification.confidence + (5 if self.strategy != ReasoningStrategy.DIRECT else 0))
        return ReasoningResult(
            classification=classification,
            strategy=self.strategy,
            steps=steps,
            confidence=confidence,
            branches=branches,
        )
