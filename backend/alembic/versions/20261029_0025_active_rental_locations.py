"""Normalize locations of assets that belong to active rental orders.

Revision ID: 20261029_0025
Revises: 20261029_0024
"""

import json

from alembic import op
import sqlalchemy as sa


revision = "20261029_0025"
down_revision = "20261029_0024"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    orders = sa.table(
        "orders",
        sa.column("id", sa.String(length=36)),
        sa.column("operational_status", sa.String(length=20)),
        sa.column("previous_states", sa.JSON()),
    )
    assets = sa.table(
        "inventory_assets",
        sa.column("id", sa.String(length=36)),
        sa.column("location", sa.String(length=255)),
        sa.column("status", sa.String(length=80)),
    )
    rows = connection.execute(
        sa.select(orders.c.previous_states).where(orders.c.operational_status == "Activo")
    ).all()
    for (states,) in rows:
        if isinstance(states, str):
            try:
                states = json.loads(states)
            except ValueError:
                states = {}
        for asset_id in (states or {}):
            connection.execute(
                assets.update()
                .where(assets.c.id == asset_id, assets.c.status.in_(("Alquiler", "Despachado")))
                .values(location="Alquilado")
            )


def downgrade() -> None:
    # No se puede reconstruir la ubicación anterior de forma segura.
    pass
