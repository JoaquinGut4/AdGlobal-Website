"""Allow inventory assets without a purchase date.

Revision ID: 20261026_0016
Revises: 20261022_0015
"""

from alembic import op
import sqlalchemy as sa


revision = "20261026_0016"
down_revision = "20261022_0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("inventory_assets") as batch_op:
        batch_op.alter_column("purchase_date", existing_type=sa.Date(), nullable=True)


def downgrade() -> None:
    op.execute("UPDATE inventory_assets SET purchase_date = CURRENT_DATE WHERE purchase_date IS NULL")
    with op.batch_alter_table("inventory_assets") as batch_op:
        batch_op.alter_column("purchase_date", existing_type=sa.Date(), nullable=False)
