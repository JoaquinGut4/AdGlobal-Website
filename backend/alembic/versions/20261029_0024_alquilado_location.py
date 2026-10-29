"""Normalize assets assigned to orders to the Alquilado location.

Revision ID: 20261029_0024
Revises: 20261029_0023
"""

from alembic import op
import sqlalchemy as sa


revision = "20261029_0024"
down_revision = "20261029_0023"
branch_labels = None
depends_on = None


def upgrade() -> None:
    assets = sa.table(
        "inventory_assets",
        sa.column("location", sa.String(length=255)),
    )
    connection = op.get_bind()
    connection.execute(
        assets.update()
        .where(assets.c.location.like("Cliente %") | assets.c.location.like("Pedido %"))
        .values(location="Alquilado")
    )


def downgrade() -> None:
    # La ubicación anterior incluía datos del cliente y del pedido; no es
    # posible reconstruirla de forma segura.
    pass
