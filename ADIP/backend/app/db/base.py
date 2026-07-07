"""Import surface for Alembic and metadata operations.

Importing ``app.models`` registers every table on ``Base.metadata``.
"""
from app.db.base_class import Base  # noqa: F401
import app.models  # noqa: F401  (side-effect: registers all models)
