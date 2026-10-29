"""Add the order lifecycle workflow.

Revision ID: 20261029_0020
Revises: 20261028_0019
"""

from datetime import datetime

from alembic import op
import sqlalchemy as sa


revision = "20261029_0020"
down_revision = "20261028_0019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_columns = {column["name"] for column in inspector.get_columns("orders")}
    columns = {
        "workflow_status": sa.Column("workflow_status", sa.String(length=30), nullable=False, server_default="Borrador"),
        "delivery_date": sa.Column("delivery_date", sa.Date(), nullable=True),
        "service_start_date": sa.Column("service_start_date", sa.Date(), nullable=True),
        "service_end_date": sa.Column("service_end_date", sa.Date(), nullable=True),
        "cancellation_reason": sa.Column("cancellation_reason", sa.String(length=1000), nullable=False, server_default=""),
        "status_changed_at": sa.Column("status_changed_at", sa.DateTime(), nullable=True),
    }
    for name, column in columns.items():
        if name not in existing_columns:
            op.add_column("orders", column)

    # MySQL conserva las operaciones DDL previas aunque una migración falle.
    # Volvemos a inspeccionar para poder recuperar de forma segura una ejecución parcial.
    inspector = sa.inspect(connection)
    existing_indexes = {index["name"] for index in inspector.get_indexes("orders")}
    if "ix_orders_workflow_status" not in existing_indexes:
        op.create_index("ix_orders_workflow_status", "orders", ["workflow_status"])
    if "ix_orders_service_end_date" not in existing_indexes:
        op.create_index("ix_orders_service_end_date", "orders", ["service_end_date"])

    orders = sa.table(
        "orders",
        sa.column("operational_status", sa.String(length=20)),
        sa.column("workflow_status", sa.String(length=30)),
        sa.column("status_changed_at", sa.DateTime()),
    )
    connection.execute(
        orders.update().values(
            workflow_status=sa.case(
                (orders.c.operational_status == "Finalizado", "Cerrado"),
                else_="Confirmado",
            ),
            status_changed_at=datetime.utcnow(),
        )
    )

    states = sa.table(
        "inventory_states",
        sa.column("name", sa.String(length=80)),
        sa.column("is_immutable", sa.Boolean()),
        sa.column("sort_order", sa.Integer()),
        sa.column("created_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
    )
    if connection.execute(sa.select(states.c.name).where(states.c.name == "Reservado")).first() is None:
        now = datetime.utcnow()
        connection.execute(states.insert().values(name="Reservado", is_immutable=True, sort_order=20, created_at=now, updated_at=now))


def downgrade() -> None:
    connection = op.get_bind()
    states = sa.table("inventory_states", sa.column("name", sa.String(length=80)))
    connection.execute(states.delete().where(states.c.name == "Reservado"))
    op.drop_index("ix_orders_service_end_date", table_name="orders")
    op.drop_index("ix_orders_workflow_status", table_name="orders")
    op.drop_column("orders", "status_changed_at")
    op.drop_column("orders", "cancellation_reason")
    op.drop_column("orders", "service_end_date")
    op.drop_column("orders", "service_start_date")
    op.drop_column("orders", "delivery_date")
    op.drop_column("orders", "workflow_status")
