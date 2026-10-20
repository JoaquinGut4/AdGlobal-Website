"""Keep the destination address captured from an order on the support ticket.

Revision ID: 20261020_0007
Revises: 20261020_0006
"""

from alembic import op
import sqlalchemy as sa


revision = "20261020_0007"
down_revision = "20261020_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "support_tickets",
        sa.Column("order_address", sa.String(length=1000), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("support_tickets", "order_address")
