#!/usr/bin/env bash
# ADIP database backup automation (Role 3 — DBA).
# Engine-aware: PostgreSQL (pg_dump custom format) or SQLite (file copy).
#
#   DATABASE_URL=... ./backup.sh [OUTPUT_DIR]
#
# Cron example (daily 02:00, keep 30 days handled by lifecycle/rotation):
#   0 2 * * *  DATABASE_URL=... /path/backend/scripts/db/backup.sh /var/backups/adip
set -euo pipefail

OUT_DIR="${1:-./backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT_DIR"

DB_URL="${DATABASE_URL:-sqlite:///./adip.db}"

if [[ "$DB_URL" == postgres* ]]; then
  OUT="$OUT_DIR/adip-$STAMP.dump"
  echo "PostgreSQL backup -> $OUT"
  pg_dump "$DB_URL" --format=custom --file "$OUT"
  echo "Verifying dump..."
  pg_restore --list "$OUT" >/dev/null && echo "OK: dump is readable."
elif [[ "$DB_URL" == sqlite* ]]; then
  # Strip sqlite:/// prefix to get the file path.
  DB_FILE="${DB_URL#sqlite:///}"
  DB_FILE="${DB_FILE#sqlite://}"
  OUT="$OUT_DIR/adip-$STAMP.db"
  echo "SQLite backup -> $OUT"
  # Use the sqlite3 .backup command if available (consistent snapshot), else cp.
  if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB_FILE" ".backup '$OUT'"
  else
    cp "$DB_FILE" "$OUT"
  fi
  echo "OK: $(du -h "$OUT" | cut -f1)"
else
  echo "Unsupported DATABASE_URL scheme: $DB_URL" >&2
  exit 1
fi

echo "Backup complete: $OUT"
