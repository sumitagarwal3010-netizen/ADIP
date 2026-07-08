"""Plugin SDK for ADIP extensions (Role 15)."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable


@dataclass
class PluginDescriptor:
    id: str
    name: str
    version: str
    hooks: list[str] = field(default_factory=list)


@dataclass
class PluginContext:
    service_registry: object
    feature_registry: object


class PluginSDK:
    """Minimal plugin loader — register hooks without dynamic imports."""

    def __init__(self) -> None:
        self._plugins: dict[str, PluginDescriptor] = {}
        self._hooks: dict[str, list[Callable]] = {}

    def register(self, descriptor: PluginDescriptor) -> None:
        self._plugins[descriptor.id] = descriptor

    def on(self, hook: str, handler: Callable) -> None:
        self._hooks.setdefault(hook, []).append(handler)

    def emit(self, hook: str, *args, **kwargs) -> list[object]:
        return [fn(*args, **kwargs) for fn in self._hooks.get(hook, [])]

    def list_plugins(self) -> list[PluginDescriptor]:
        return list(self._plugins.values())


plugin_sdk = PluginSDK()
