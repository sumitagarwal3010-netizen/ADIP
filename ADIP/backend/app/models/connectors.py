"""Enterprise connector ORM models."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


class EnterpriseConnector(Base, TimestampMixin):
    __tablename__ = "enterprise_connectors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    connector_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    category: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="mock", index=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    mock_mode: Mapped[bool] = mapped_column(Boolean, default=True)
    dry_run: Mapped[bool] = mapped_column(Boolean, default=False)
    config_json: Mapped[Optional[str]] = mapped_column(Text)
    project_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_health_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_health_status: Mapped[Optional[str]] = mapped_column(String(20))

    credential_refs: Mapped[list["ConnectorCredentialRef"]] = relationship(back_populates="connector")
    runs: Mapped[list["ConnectorRun"]] = relationship(back_populates="connector")
    errors: Mapped[list["ConnectorError"]] = relationship(back_populates="connector")
    assets: Mapped[list["ConnectorAsset"]] = relationship(back_populates="connector")
    findings: Mapped[list["ConnectorFinding"]] = relationship(back_populates="connector")


class ConnectorCredentialRef(Base, TimestampMixin):
    __tablename__ = "connector_credential_refs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    connector_id: Mapped[int] = mapped_column(ForeignKey("enterprise_connectors.id", ondelete="CASCADE"), index=True)
    ref_type: Mapped[str] = mapped_column(String(40), default="env_var")  # env_var | vault_path | secret_manager
    ref_key: Mapped[str] = mapped_column(String(200), nullable=False)
    label: Mapped[Optional[str]] = mapped_column(String(120))

    connector: Mapped[EnterpriseConnector] = relationship(back_populates="credential_refs")


class ConnectorRun(Base, TimestampMixin):
    __tablename__ = "connector_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    connector_id: Mapped[int] = mapped_column(ForeignKey("enterprise_connectors.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(20), index=True)
    dry_run: Mapped[bool] = mapped_column(Boolean, default=False)
    mock: Mapped[bool] = mapped_column(Boolean, default=True)
    assets_synced: Mapped[int] = mapped_column(Integer, default=0)
    findings_synced: Mapped[int] = mapped_column(Integer, default=0)
    duration_ms: Mapped[Optional[float]] = mapped_column(Float)
    message: Mapped[Optional[str]] = mapped_column(Text)

    connector: Mapped[EnterpriseConnector] = relationship(back_populates="runs")


class ConnectorError(Base, TimestampMixin):
    __tablename__ = "connector_errors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    connector_id: Mapped[int] = mapped_column(ForeignKey("enterprise_connectors.id", ondelete="CASCADE"), index=True)
    run_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    error_code: Mapped[Optional[str]] = mapped_column(String(60))
    message: Mapped[str] = mapped_column(Text, nullable=False)

    connector: Mapped[EnterpriseConnector] = relationship(back_populates="errors")


class ConnectorAsset(Base, TimestampMixin):
    __tablename__ = "connector_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    connector_id: Mapped[int] = mapped_column(ForeignKey("enterprise_connectors.id", ondelete="CASCADE"), index=True)
    external_id: Mapped[str] = mapped_column(String(200), index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    kind: Mapped[str] = mapped_column(String(60), default="asset")
    project_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    payload_json: Mapped[Optional[str]] = mapped_column(Text)

    connector: Mapped[EnterpriseConnector] = relationship(back_populates="assets")


class ConnectorFinding(Base, TimestampMixin):
    __tablename__ = "connector_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    connector_id: Mapped[int] = mapped_column(ForeignKey("enterprise_connectors.id", ondelete="CASCADE"), index=True)
    external_id: Mapped[str] = mapped_column(String(200), index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), index=True, default="medium")
    status: Mapped[str] = mapped_column(String(30), default="open")
    project_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    payload_json: Mapped[Optional[str]] = mapped_column(Text)

    connector: Mapped[EnterpriseConnector] = relationship(back_populates="findings")


class IdentityProviderConfig(Base, TimestampMixin):
    __tablename__ = "identity_provider_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    provider_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    mode: Mapped[str] = mapped_column(String(20), default="demo")  # demo | oidc | entra | disabled
    issuer: Mapped[Optional[str]] = mapped_column(String(300))
    client_id: Mapped[Optional[str]] = mapped_column(String(200))
    audience: Mapped[Optional[str]] = mapped_column(String(200))
    jwks_uri: Mapped[Optional[str]] = mapped_column(String(300))
    group_claim: Mapped[Optional[str]] = mapped_column(String(80), default="groups")
    role_claim: Mapped[Optional[str]] = mapped_column(String(80), default="roles")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    bypass_security: Mapped[bool] = mapped_column(Boolean, default=False)
