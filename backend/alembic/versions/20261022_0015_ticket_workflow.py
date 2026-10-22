"""Add repair/replacement workflow to support tickets.

Revision ID: 20261022_0015
Revises: 20261022_0014
"""

from datetime import UTC, datetime

from alembic import op
import sqlalchemy as sa


revision = "20261022_0015"
down_revision = "20261022_0014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("support_tickets", sa.Column("is_repairable", sa.Boolean(), nullable=True))
    op.add_column("support_tickets", sa.Column("workflow_type", sa.String(length=30), nullable=False, server_default="Pendiente"))
    op.add_column("support_tickets", sa.Column("replacement_asset_ids", sa.JSON(), nullable=True))
    op.add_column("support_tickets", sa.Column("replacement_previous_states", sa.JSON(), nullable=True))
    op.add_column("support_tickets", sa.Column("evidence_urls", sa.JSON(), nullable=True))
    op.add_column("support_tickets", sa.Column("solution_description", sa.Text(), nullable=True))
    op.add_column("support_tickets", sa.Column("resolved_at", sa.DateTime(), nullable=True))

    states = sa.table(
        "inventory_states",
        sa.column("name"), sa.column("is_immutable"), sa.column("sort_order"),
        sa.column("created_at"), sa.column("updated_at"),
    )
    now = datetime.now(UTC).replace(tzinfo=None)
    rows = [
        {"name": "Diagnóstico", "is_immutable": True, "sort_order": 7, "created_at": now, "updated_at": now},
        {"name": "Reparación", "is_immutable": True, "sort_order": 8, "created_at": now, "updated_at": now},
        {"name": "Reemplazo requerido", "is_immutable": True, "sort_order": 9, "created_at": now, "updated_at": now},
        {"name": "Reservado para reemplazo", "is_immutable": True, "sort_order": 10, "created_at": now, "updated_at": now},
        {"name": "Baja", "is_immutable": True, "sort_order": 11, "created_at": now, "updated_at": now},
    ]
    bind = op.get_bind()
    for row in rows:
        exists = bind.execute(sa.select(sa.func.count()).select_from(states).where(states.c.name == row["name"])).scalar()
        if not exists:
            bind.execute(states.insert().values(**row))
        else:
            bind.execute(states.update().where(states.c.name == row["name"]).values(is_immutable=True, sort_order=row["sort_order"]))


def downgrade() -> None:
    op.execute("DELETE FROM inventory_states WHERE name IN ('Diagnóstico','Reparación','Reemplazo requerido','Reservado para reemplazo','Baja')")
    op.drop_column("support_tickets", "resolved_at")
    op.drop_column("support_tickets", "solution_description")
    op.drop_column("support_tickets", "evidence_urls")
    op.drop_column("support_tickets", "replacement_previous_states")
    op.drop_column("support_tickets", "replacement_asset_ids")
    op.drop_column("support_tickets", "workflow_type")
    op.drop_column("support_tickets", "is_repairable")
