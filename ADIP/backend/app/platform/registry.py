"""Service, feature and dependency registries (Role 15)."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class RegistryEntry:
    name: str
    version: str
    description: str = ""
    metadata: dict = field(default_factory=dict)


class ServiceRegistry:
  def __init__(self) -> None:
      self._entries: dict[str, RegistryEntry] = {}

  def register(self, entry: RegistryEntry) -> None:
      self._entries[entry.name] = entry

  def get(self, name: str) -> RegistryEntry | None:
      return self._entries.get(name)

  def list(self) -> list[RegistryEntry]:
      return list(self._entries.values())


class FeatureRegistry(ServiceRegistry):
    """Feature flags for backend capabilities."""


class DependencyRegistry:
    def __init__(self) -> None:
        self._deps: dict[str, list[str]] = {}

    def declare(self, service: str, depends_on: list[str]) -> None:
        self._deps[service] = depends_on

    def graph(self) -> dict[str, list[str]]:
        return dict(self._deps)


service_registry = ServiceRegistry()
feature_registry = FeatureRegistry()
dependency_registry = DependencyRegistry()

# Bootstrap known ADIP services (additive registration).
for name, desc in [
    ("orchestrator", "Prompt Execution Engine"),
    ("artifact_generator", "24-type artifact framework"),
    ("quality_engine", "Artifact quality scoring"),
    ("ai_reviewer", "AI artifact reviewer"),
    ("llm_runtime", "LLM execution runtime"),
]:
    service_registry.register(RegistryEntry(name=name, version="1.0", description=desc))

feature_registry.register(RegistryEntry(name="local_llm", version="1.0", description="Real LLM execution"))
feature_registry.register(RegistryEntry(name="prompt_workbench", version="1.0", description="Prompt versioning"))
dependency_registry.declare("orchestrator", ["artifact_generator", "llm_runtime"])
dependency_registry.declare("quality_engine", ["artifact_generator"])
