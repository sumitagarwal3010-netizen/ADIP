#!/usr/bin/env bash
# ADIP database restore automation (Role 3 — DBA).
# Engine-aware restore + post-restore migration + validation.
#
#   DATABASE_URL=... ./restore.sh <BACKUP_FILE>
#
# WARNING: this overwrites/loads into the target database. Confirm the target.
set -euo pipefail

BACKUP_FILE="${1:?Usage: restore.sh <BACKUP_FILE>}"
DB_URL="${DATABASE_URL:-sqlite:///./adip.db}"
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

[[ -f "$BACKUP_FILE" ]] || { echo "Backup file not found: $BACKUP_FILE" >&2; exit 1; }

echo "Target: ${DB_URL%%@*}...  <-  $BACKUP_FILE"
read -r -p "Proceed with restore? This may overwrite data. [y/N] " ans
[[ "$ans" == "y" || "$ans" == "Y" ]] || { echo "Aborted."; exit 1; }

if [[ "$DB_URL" == postgres* ]]; then
  echo "PostgreSQL restore..."
  pg_restore --dbname "$DB_URL" --clean --if-exists --no-owner "$BACKUP_FILE"
elif [[ "$DB_URL" == sqlite* ]]; then
  DB_FILE="${DB_URL#sqlite:///}"; DB_FILE="${DB_FILE#sqlite://}"
  echo "SQLite restore -> $DB_FILE"
  cp "$BACKUP_FILE" "$DB_FILE"
else
  echo "Unsupported DATABASE_URL scheme: $DB_URL" >&2; exit 1
fi

echo "Applying migrations (alembic upgrade head)..."
( cd "$BACKEND_DIR" && alembic upgrade head )

echo "Validating..."
( cd "$BACKEND_DIR" && python -m scripts.db.health_check | head -20 )

echo "Restore complete."
