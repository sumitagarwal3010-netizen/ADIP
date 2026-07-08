"""ADIP Python SDK.

A lightweight, dependency-free (stdlib-only) client for the ADIP REST API.

    from adip_sdk import ADIPClient
    client = ADIPClient("http://localhost:8000")
    projects = client.list_projects()
    artifact = client.generate_artifact(project_id=1, artifact_type="BRD")
"""
from .client import ADIPClient, ADIPError

__all__ = ["ADIPClient", "ADIPError"]
__version__ = "0.1.0"
