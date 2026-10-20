"""Store the order number or inventory state required for a support ticket.

Revision ID: 20261020_0005
Revises: 20261020_0004
"""

from alembic import op
import sqlalchemy as sa


revision = "20261020_0005"
down_revision = "20261020_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "support_tickets",
        sa.Column("order_or_status", sa.String(length=2048), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("support_tickets", "order_or_status")
