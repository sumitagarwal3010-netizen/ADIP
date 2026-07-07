"""CLI entrypoint for database seeding.

Usage::

    python -m app.seed.run           # seed if empty
    python -m app.seed.run --reset   # drop, recreate and re-seed
"""
from __future__ import annotations

import argparse

from app.core.logging import get_logger
from app.seed.seeder import seed

logger = get_logger("seed")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the ADIP database with banking mock data.")
    parser.add_argument("--reset", action="store_true", help="Drop and recreate all tables before seeding.")
    args = parser.parse_args()

    totals = seed(reset=args.reset)
    if not totals:
        logger.info("No changes (already seeded).")
        return

    total_rows = sum(totals.values())
    logger.info("Seeded %d rows across %d tables:", total_rows, len(totals))
    for table, count in sorted(totals.items()):
        logger.info("  %-26s %5d", table, count)


if __name__ == "__main__":
    main()
