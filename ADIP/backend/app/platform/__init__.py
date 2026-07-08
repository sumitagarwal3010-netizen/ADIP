"""Platform extension framework (Role 15)."""
from .plugin_sdk import PluginContext, PluginDescriptor, PluginSDK
from .registry import DependencyRegistry, FeatureRegistry, ServiceRegistry

__all__ = [
    "DependencyRegistry",
    "FeatureRegistry",
    "PluginContext",
    "PluginDescriptor",
    "PluginSDK",
    "ServiceRegistry",
]
