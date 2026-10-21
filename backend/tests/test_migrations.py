import os
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect


ROOT = Path(__file__).resolve().parents[2]


def test_alembic_upgrade_creates_a_fresh_database(tmp_path: Path) -> None:
    database = tmp_path / "migracion.db"
    env = {
        **os.environ,
        "SECRET_KEY": "test-secret-key-with-more-than-thirty-two-characters",
        "DATABASE_URL_OVERRIDE": f"sqlite:///{database.as_posix()}",
    }

    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=ROOT,
        env=env,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stdout + result.stderr

    inspector = inspect(create_engine(env["DATABASE_URL_OVERRIDE"]))
    tables = set(inspector.get_table_names())
    assert {
        "admin_users",
        "inventory_assets",
        "orders",
        "support_tickets",
        "web_assets",
        "quote_requests",
    }.issubset(tables)

    admin_columns = {column["name"] for column in inspector.get_columns("admin_users")}
    assert {"role", "phone", "token_version"}.issubset(admin_columns)

    order_columns = {column["name"] for column in inspector.get_columns("orders")}
    assert "contact_phone" in order_columns

    ticket_columns = {column["name"] for column in inspector.get_columns("support_tickets")}
    assert {"order_or_status", "ticket_type", "order_address", "equipment_status"}.issubset(
        ticket_columns
    )
