"""Allow inventory assets without a serial number.

Revision ID: 20261026_0017
Revises: 20261026_0016
"""

from alembic import op
import sqlalchemy as sa


revision = "20261026_0017"
down_revision = "20261026_0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("inventory_assets") as batch_op:
        batch_op.alter_column("serial_number", existing_type=sa.String(length=160), nullable=True)


def downgrade() -> None:
    inventory_assets = sa.table(
        "inventory_assets",
        sa.column("sku", sa.String(length=80)),
        sa.column("serial_number", sa.String(length=160)),
    )
    op.execute(
        inventory_assets.update()
        .where(inventory_assets.c.serial_number.is_(None))
        .values(serial_number=sa.literal("SIN-SERIE-") + inventory_assets.c.sku)
    )
    with op.batch_alter_table("inventory_assets") as batch_op:
        batch_op.alter_column("serial_number", existing_type=sa.String(length=160), nullable=False)
