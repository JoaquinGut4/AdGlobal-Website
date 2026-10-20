from datetime import UTC, date, datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.core.database import Base


def new_id() -> str:
    return str(uuid4())


def utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)


class AdminUser(TimestampMixin, Base):
    __tablename__ = "admin_users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    full_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(190), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(40), default="Administrador")
    phone: Mapped[str] = mapped_column(String(30), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_super_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    modules: Mapped[list[str]] = mapped_column(JSON, default=list)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class InventoryCategory(TimestampMixin, Base):
    __tablename__ = "inventory_categories"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    label: Mapped[str] = mapped_column(String(120), unique=True)
    code: Mapped[int] = mapped_column(Integer, unique=True)
    icon_name: Mapped[str] = mapped_column(String(30), default="package")
    custom_fields: Mapped[list[dict]] = mapped_column(JSON, default=list)

    assets: Mapped[list["InventoryAsset"]] = relationship(back_populates="category")


class InventoryAsset(TimestampMixin, Base):
    __tablename__ = "inventory_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    category_id: Mapped[str] = mapped_column(ForeignKey("inventory_categories.id"), index=True)
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    qr: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    photo_url: Mapped[str] = mapped_column(String(500), default="")
    item: Mapped[str | None] = mapped_column(String(120), nullable=True)
    brand: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(300))
    serial_number: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    processor: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ghz: Mapped[str | None] = mapped_column(String(40), nullable=True)
    generation: Mapped[str | None] = mapped_column(String(40), nullable=True)
    screen: Mapped[str | None] = mapped_column(String(60), nullable=True)
    ram: Mapped[str | None] = mapped_column(String(60), nullable=True)
    storage: Mapped[str | None] = mapped_column(String(60), nullable=True)
    storage_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    purchase_date: Mapped[date] = mapped_column(Date)
    purchase_document: Mapped[str] = mapped_column(String(100))
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    supplier: Mapped[str] = mapped_column(String(160))
    rentable: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    status: Mapped[str] = mapped_column(String(80), index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    custom_specs: Mapped[dict] = mapped_column(JSON, default=dict)

    category: Mapped[InventoryCategory] = relationship(back_populates="assets")


class Customer(TimestampMixin, Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(200))
    ruc: Mapped[str] = mapped_column(String(11), unique=True, index=True)
    sector: Mapped[str] = mapped_column(String(120))
    contact_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(190))
    phone: Mapped[str] = mapped_column(String(40))
    event_count: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[str] = mapped_column(String(20), default="Estándar")
    last_activity: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Activo", index=True)


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    issue_date: Mapped[date] = mapped_column(Date, index=True)
    origin_address: Mapped[str] = mapped_column(Text)
    destination_address: Mapped[str] = mapped_column(Text)
    contact_phone: Mapped[str] = mapped_column(String(30), default="")
    product_description: Mapped[str] = mapped_column(Text)
    product_quantity: Mapped[int] = mapped_column(Integer)
    unit: Mapped[str] = mapped_column(String(10), default="UND")
    transfer_reason: Mapped[str] = mapped_column(String(160), index=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class Technician(TimestampMixin, Base):
    __tablename__ = "technicians"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(180))
    phone: Mapped[str] = mapped_column(String(40), default="")
    specialty: Mapped[str] = mapped_column(String(120), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class SupportTicket(TimestampMixin, Base):
    __tablename__ = "support_tickets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    area: Mapped[str | None] = mapped_column(String(80), nullable=True)
    equipment: Mapped[str] = mapped_column(Text)
    customer: Mapped[str] = mapped_column(String(200))
    priority: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(30), default="Abierto", index=True)
    description: Mapped[str] = mapped_column(Text)
    order_or_status: Mapped[str] = mapped_column(String(2048), default="")
    ticket_type: Mapped[str] = mapped_column(String(20), default="")
    order_number: Mapped[str] = mapped_column(String(30), default="")
    contact_phone: Mapped[str] = mapped_column(String(40), default="")
    order_address: Mapped[str] = mapped_column(String(1000), default="")
    equipment_status: Mapped[str] = mapped_column(String(80), default="")
    technician_id: Mapped[str | None] = mapped_column(ForeignKey("technicians.id"), nullable=True)
    technician_name: Mapped[str] = mapped_column(String(180), default="")
    technician_phone: Mapped[str] = mapped_column(String(40), default="")

    technician: Mapped[Technician | None] = relationship()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("admin_users.id"), nullable=True)
    username: Mapped[str] = mapped_column(String(80))
    module: Mapped[str] = mapped_column(String(40), index=True)
    action: Mapped[str] = mapped_column(String(30))
    element: Mapped[str] = mapped_column(String(160))
    detail: Mapped[str] = mapped_column(Text)


class WebAsset(TimestampMixin, Base):
    __tablename__ = "web_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    section: Mapped[str] = mapped_column(String(30), index=True)
    service_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    file_url: Mapped[str] = mapped_column(String(500))
    mime_type: Mapped[str] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Service(TimestampMixin, Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    category: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    features: Mapped[list[str]] = mapped_column(JSON, default=list)
    specs: Mapped[list[dict]] = mapped_column(JSON, default=list)
    ideal_for: Mapped[list[str]] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class QuoteRequest(TimestampMixin, Base):
    __tablename__ = "quote_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    full_name: Mapped[str] = mapped_column(String(160))
    company: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(190), index=True)
    phone: Mapped[str] = mapped_column(String(40))
    service_id: Mapped[str] = mapped_column(String(100), index=True)
    requested_dates: Mapped[str] = mapped_column(String(200), default="")
    city: Mapped[str] = mapped_column(String(100))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="Nueva", index=True)
