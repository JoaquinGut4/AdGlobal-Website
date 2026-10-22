"""Persist operational inventory, order and ticket state.

Revision ID: 20261022_0009
Revises: 20261021_0008
"""

from datetime import UTC, datetime

from alembic import op
import sqlalchemy as sa


revision = "20261022_0009"
down_revision = "20261021_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "inventory_categories",
        sa.Column("base_fields", sa.JSON(), nullable=True),
    )
    op.create_table(
        "inventory_states",
        sa.Column("name", sa.String(length=80), primary_key=True),
        sa.Column("is_immutable", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.add_column(
        "orders",
        sa.Column("operational_status", sa.String(length=20), nullable=False, server_default="Activo"),
    )
    op.add_column("orders", sa.Column("finalized_at", sa.DateTime(), nullable=True))
    op.add_column("orders", sa.Column("skus", sa.JSON(), nullable=True))
    op.add_column(
        "orders",
        sa.Column("previous_states", sa.JSON(), nullable=True),
    )
    op.add_column(
        "support_tickets",
        sa.Column("asset_ids", sa.JSON(), nullable=True),
    )
    op.add_column(
        "support_tickets",
        sa.Column("previous_states", sa.JSON(), nullable=True),
    )

    states = sa.table(
        "inventory_states",
        sa.column("name", sa.String()),
        sa.column("is_immutable", sa.Boolean()),
        sa.column("sort_order", sa.Integer()),
        sa.column("created_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
    )
    now = datetime.now(UTC).replace(tzinfo=None)
    op.bulk_insert(
        states,
        [
            {"name": "Almacén 1", "is_immutable": False, "sort_order": 0, "created_at": now, "updated_at": now},
            {"name": "Oficina", "is_immutable": False, "sort_order": 1, "created_at": now, "updated_at": now},
            {"name": "Alquiler", "is_immutable": True, "sort_order": 2, "created_at": now, "updated_at": now},
            {"name": "Reparación", "is_immutable": False, "sort_order": 3, "created_at": now, "updated_at": now},
            {"name": "Taller", "is_immutable": True, "sort_order": 4, "created_at": now, "updated_at": now},
            {"name": "Mantenimiento", "is_immutable": False, "sort_order": 5, "created_at": now, "updated_at": now},
            {"name": "Venta", "is_immutable": True, "sort_order": 6, "created_at": now, "updated_at": now},
        ],
    )


def downgrade() -> None:
    op.drop_column("support_tickets", "previous_states")
    op.drop_column("support_tickets", "asset_ids")
    op.drop_column("orders", "previous_states")
    op.drop_column("orders", "skus")
    op.drop_column("orders", "finalized_at")
    op.drop_column("orders", "operational_status")
    op.drop_table("inventory_states")
    op.drop_column("inventory_categories", "base_fields")
