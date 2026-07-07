"""Application-level exception hierarchy.

Service and repository layers raise these domain exceptions; the API layer
translates them into HTTP responses via registered exception handlers.
"""
from __future__ import annotations


class ADIPError(Exception):
    """Base class for all application errors."""

    status_code: int = 500
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.message
        super().__init__(self.message)


class NotFoundError(ADIPError):
    """A requested entity does not exist."""

    status_code = 404
    message = "Resource not found."


class ConflictError(ADIPError):
    """The request conflicts with current state (e.g. unique constraint)."""

    status_code = 409
    message = "Resource conflict."


class ValidationError(ADIPError):
    """Business-rule validation failed (distinct from Pydantic request validation)."""

    status_code = 422
    message = "Validation failed."
