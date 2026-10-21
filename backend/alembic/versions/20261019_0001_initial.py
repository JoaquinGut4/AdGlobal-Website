"""Esquema inicial de AD GLOBAL.

Esta migración es un snapshot explícito del esquema original. No debe usar
``Base.metadata.create_all``: si se ejecuta con los modelos actuales, las
migraciones posteriores intentan agregar columnas que ya existen y una
instalación limpia falla.

Nota para bases creadas con la versión anterior de esta migración: si quedaron
marcadas en ``20261019_0001`` pero ya tienen todas las columnas actuales, hay que
marcarlas en la última revisión (``alembic stamp 20261021_0008``) en lugar de
volver a ejecutar 0002-0008.

Revision ID: 20261019_0001
Revises:
"""

import sqlalchemy as sa
from alembic import op


revision = "20261019_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "admin_users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=190), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_super_admin", sa.Boolean(), nullable=False),
        sa.Column("modules", sa.JSON(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_admin_users_email", "admin_users", ["email"], unique=True)
    op.create_index("ix_admin_users_username", "admin_users", ["username"], unique=True)

    op.create_table(
        "inventory_categories",
        sa.Column("id", sa.String(length=80), primary_key=True),
        sa.Column("label", sa.String(length=120), nullable=False, unique=True),
        sa.Column("code", sa.Integer(), nullable=False, unique=True),
        sa.Column("icon_name", sa.String(length=30), nullable=False),
        sa.Column("custom_fields", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "inventory_assets",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("category_id", sa.String(length=80), nullable=False),
        sa.Column("sku", sa.String(length=80), nullable=False),
        sa.Column("qr", sa.String(length=160), nullable=False),
        sa.Column("photo_url", sa.String(length=500), nullable=False),
        sa.Column("item", sa.String(length=120), nullable=True),
        sa.Column("brand", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=300), nullable=False),
        sa.Column("serial_number", sa.String(length=160), nullable=False),
        sa.Column("processor", sa.String(length=120), nullable=True),
        sa.Column("ghz", sa.String(length=40), nullable=True),
        sa.Column("generation", sa.String(length=40), nullable=True),
        sa.Column("screen", sa.String(length=60), nullable=True),
        sa.Column("ram", sa.String(length=60), nullable=True),
        sa.Column("storage", sa.String(length=60), nullable=True),
        sa.Column("storage_type", sa.String(length=60), nullable=True),
        sa.Column("model", sa.String(length=100), nullable=True),
        sa.Column("purchase_date", sa.Date(), nullable=False),
        sa.Column("purchase_document", sa.String(length=100), nullable=False),
        sa.Column("price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("supplier", sa.String(length=160), nullable=False),
        sa.Column("rentable", sa.Boolean(), nullable=True),
        sa.Column("status", sa.String(length=80), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("custom_specs", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["inventory_categories.id"]),
    )
    op.create_index("ix_inventory_assets_category_id", "inventory_assets", ["category_id"])
    op.create_index("ix_inventory_assets_sku", "inventory_assets", ["sku"], unique=True)
    op.create_index("ix_inventory_assets_qr", "inventory_assets", ["qr"], unique=True)
    op.create_index(
        "ix_inventory_assets_serial_number",
        "inventory_assets",
        ["serial_number"],
        unique=True,
    )
    op.create_index("ix_inventory_assets_status", "inventory_assets", ["status"])

    op.create_table(
        "customers",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("ruc", sa.String(length=11), nullable=False),
        sa.Column("sector", sa.String(length=120), nullable=False),
        sa.Column("contact_name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=190), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=False),
        sa.Column("event_count", sa.Integer(), nullable=False),
        sa.Column("rating", sa.String(length=20), nullable=False),
        sa.Column("last_activity", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_customers_ruc", "customers", ["ruc"], unique=True)
    op.create_index("ix_customers_status", "customers", ["status"])

    op.create_table(
        "orders",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("order_number", sa.String(length=30), nullable=False),
        sa.Column("issue_date", sa.Date(), nullable=False),
        sa.Column("origin_address", sa.Text(), nullable=False),
        sa.Column("destination_address", sa.Text(), nullable=False),
        sa.Column("product_description", sa.Text(), nullable=False),
        sa.Column("product_quantity", sa.Integer(), nullable=False),
        sa.Column("unit", sa.String(length=10), nullable=False),
        sa.Column("transfer_reason", sa.String(length=160), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_index("ix_orders_issue_date", "orders", ["issue_date"])
    op.create_index("ix_orders_transfer_reason", "orders", ["transfer_reason"])

    op.create_table(
        "technicians",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=False),
        sa.Column("specialty", sa.String(length=120), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "support_tickets",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("code", sa.String(length=30), nullable=False),
        sa.Column("area", sa.String(length=80), nullable=True),
        sa.Column("equipment", sa.Text(), nullable=False),
        sa.Column("customer", sa.String(length=200), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("technician_id", sa.String(length=36), nullable=True),
        sa.Column("technician_name", sa.String(length=180), nullable=False),
        sa.Column("technician_phone", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["technician_id"], ["technicians.id"]),
    )
    op.create_index("ix_support_tickets_code", "support_tickets", ["code"], unique=True)
    op.create_index("ix_support_tickets_priority", "support_tickets", ["priority"])
    op.create_index("ix_support_tickets_status", "support_tickets", ["status"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("occurred_at", sa.DateTime(), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("module", sa.String(length=40), nullable=False),
        sa.Column("action", sa.String(length=30), nullable=False),
        sa.Column("element", sa.String(length=160), nullable=False),
        sa.Column("detail", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["admin_users.id"]),
    )
    op.create_index("ix_audit_logs_occurred_at", "audit_logs", ["occurred_at"])
    op.create_index("ix_audit_logs_module", "audit_logs", ["module"])

    op.create_table(
        "web_assets",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("section", sa.String(length=30), nullable=False),
        sa.Column("service_id", sa.String(length=100), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("file_url", sa.String(length=500), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_web_assets_section", "web_assets", ["section"])
    op.create_index("ix_web_assets_service_id", "web_assets", ["service_id"])

    op.create_table(
        "services",
        sa.Column("id", sa.String(length=100), primary_key=True),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("features", sa.JSON(), nullable=False),
        sa.Column("specs", sa.JSON(), nullable=False),
        sa.Column("ideal_for", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "quote_requests",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("company", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=190), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=False),
        sa.Column("service_id", sa.String(length=100), nullable=False),
        sa.Column("requested_dates", sa.String(length=200), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_quote_requests_email", "quote_requests", ["email"])
    op.create_index("ix_quote_requests_service_id", "quote_requests", ["service_id"])
    op.create_index("ix_quote_requests_status", "quote_requests", ["status"])


def downgrade() -> None:
    op.drop_table("quote_requests")
    op.drop_table("services")
    op.drop_table("web_assets")
    op.drop_table("audit_logs")
    op.drop_table("support_tickets")
    op.drop_table("technicians")
    op.drop_table("orders")
    op.drop_table("customers")
    op.drop_table("inventory_assets")
    op.drop_table("inventory_categories")
    op.drop_table("admin_users")
