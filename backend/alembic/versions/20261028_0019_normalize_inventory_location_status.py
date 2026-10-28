"""Normalize inventory location and status defaults.

Revision ID: 20261028_0019
Revises: 20261028_0018
"""

from datetime import datetime

from alembic import op
import sqlalchemy as sa


revision = "20261028_0019"
down_revision = "20261028_0018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    states = sa.table(
        "inventory_states",
        sa.column("name", sa.String(length=80)),
        sa.column("is_immutable", sa.Boolean()),
        sa.column("sort_order", sa.Integer()),
        sa.column("created_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
    )
    assets = sa.table(
        "inventory_assets",
        sa.column("location", sa.String(length=40)),
        sa.column("status", sa.String(length=80)),
    )
    existing = connection.execute(
        sa.select(states.c.name).where(states.c.name == "Disponible")
    ).first()
    if existing is None:
        now = datetime.utcnow()
        connection.execute(
            states.insert().values(
                name="Disponible",
                is_immutable=True,
                sort_order=0,
                created_at=now,
                updated_at=now,
            )
        )
    else:
        connection.execute(
            states.update()
            .where(states.c.name == "Disponible")
            .values(is_immutable=True, sort_order=0)
        )
    connection.execute(
        assets.update().values(location="Almacén 1", status="Disponible")
    )


def downgrade() -> None:
    connection = op.get_bind()
    assets = sa.table(
        "inventory_assets",
        sa.column("location", sa.String(length=40)),
        sa.column("status", sa.String(length=80)),
    )
    states = sa.table("inventory_states", sa.column("name", sa.String(length=80)))
    connection.execute(assets.update().where(assets.c.status == "Disponible").values(status="Almacén 1"))
    connection.execute(states.delete().where(states.c.name == "Disponible"))
