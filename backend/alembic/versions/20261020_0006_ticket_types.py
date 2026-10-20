"""Store the origin and context of support tickets without altering older records.

Revision ID: 20261020_0006
Revises: 20261020_0005
"""

from alembic import op
import sqlalchemy as sa


revision = "20261020_0006"
down_revision = "20261020_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("support_tickets", sa.Column("ticket_type", sa.String(20), nullable=False, server_default=""))
    op.add_column("support_tickets", sa.Column("order_number", sa.String(30), nullable=False, server_default=""))
    op.add_column("support_tickets", sa.Column("contact_phone", sa.String(40), nullable=False, server_default=""))
    op.add_column("support_tickets", sa.Column("equipment_status", sa.String(80), nullable=False, server_default=""))


def downgrade() -> None:
    op.drop_column("support_tickets", "equipment_status")
    op.drop_column("support_tickets", "contact_phone")
    op.drop_column("support_tickets", "order_number")
    op.drop_column("support_tickets", "ticket_type")
