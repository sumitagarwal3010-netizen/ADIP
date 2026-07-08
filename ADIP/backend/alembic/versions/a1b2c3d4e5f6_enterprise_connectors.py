"""enterprise connector tables

Revision ID: a1b2c3d4e5f6
Revises: ec97df09e28f
Create Date: 2026-07-08 12:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "ec97df09e28f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "enterprise_connectors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("connector_type", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=True),
        sa.Column("mock_mode", sa.Boolean(), nullable=True),
        sa.Column("dry_run", sa.Boolean(), nullable=True),
        sa.Column("config_json", sa.Text(), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_health_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_health_status", sa.String(length=20), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_enterprise_connectors_connector_type", "enterprise_connectors", ["connector_type"])
    op.create_index("ix_enterprise_connectors_category", "enterprise_connectors", ["category"])
    op.create_index("ix_enterprise_connectors_status", "enterprise_connectors", ["status"])
    op.create_index("ix_enterprise_connectors_project_id", "enterprise_connectors", ["project_id"])

    op.create_table(
        "connector_credential_refs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("connector_id", sa.Integer(), nullable=False),
        sa.Column("ref_type", sa.String(length=40), nullable=True),
        sa.Column("ref_key", sa.String(length=200), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["connector_id"], ["enterprise_connectors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_connector_credential_refs_connector_id", "connector_credential_refs", ["connector_id"])

    op.create_table(
        "connector_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("connector_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("dry_run", sa.Boolean(), nullable=True),
        sa.Column("mock", sa.Boolean(), nullable=True),
        sa.Column("assets_synced", sa.Integer(), nullable=True),
        sa.Column("findings_synced", sa.Integer(), nullable=True),
        sa.Column("duration_ms", sa.Float(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["connector_id"], ["enterprise_connectors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_connector_runs_connector_id", "connector_runs", ["connector_id"])
    op.create_index("ix_connector_runs_status", "connector_runs", ["status"])

    op.create_table(
        "connector_errors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("connector_id", sa.Integer(), nullable=False),
        sa.Column("run_id", sa.Integer(), nullable=True),
        sa.Column("error_code", sa.String(length=60), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["connector_id"], ["enterprise_connectors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_connector_errors_connector_id", "connector_errors", ["connector_id"])
    op.create_index("ix_connector_errors_run_id", "connector_errors", ["run_id"])

    op.create_table(
        "connector_assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("connector_id", sa.Integer(), nullable=False),
        sa.Column("external_id", sa.String(length=200), nullable=True),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("kind", sa.String(length=60), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("payload_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["connector_id"], ["enterprise_connectors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_connector_assets_connector_id", "connector_assets", ["connector_id"])
    op.create_index("ix_connector_assets_external_id", "connector_assets", ["external_id"])
    op.create_index("ix_connector_assets_project_id", "connector_assets", ["project_id"])

    op.create_table(
        "connector_findings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("connector_id", sa.Integer(), nullable=False),
        sa.Column("external_id", sa.String(length=200), nullable=True),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("payload_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["connector_id"], ["enterprise_connectors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_connector_findings_connector_id", "connector_findings", ["connector_id"])
    op.create_index("ix_connector_findings_external_id", "connector_findings", ["external_id"])
    op.create_index("ix_connector_findings_severity", "connector_findings", ["severity"])
    op.create_index("ix_connector_findings_project_id", "connector_findings", ["project_id"])

    op.create_table(
        "identity_provider_configs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("provider_key", sa.String(length=60), nullable=False),
        sa.Column("mode", sa.String(length=20), nullable=True),
        sa.Column("issuer", sa.String(length=300), nullable=True),
        sa.Column("client_id", sa.String(length=200), nullable=True),
        sa.Column("audience", sa.String(length=200), nullable=True),
        sa.Column("jwks_uri", sa.String(length=300), nullable=True),
        sa.Column("group_claim", sa.String(length=80), nullable=True),
        sa.Column("role_claim", sa.String(length=80), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=True),
        sa.Column("bypass_security", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider_key"),
    )
    op.create_index("ix_identity_provider_configs_provider_key", "identity_provider_configs", ["provider_key"])


def downgrade() -> None:
    op.drop_table("identity_provider_configs")
    op.drop_table("connector_findings")
    op.drop_table("connector_assets")
    op.drop_table("connector_errors")
    op.drop_table("connector_runs")
    op.drop_table("connector_credential_refs")
    op.drop_table("enterprise_connectors")
