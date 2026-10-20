import re
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


ADMIN_MODULES = {
    "dashboard",
    "inventario",
    "pedidos",
    "clientes",
    "movimientos",
    "tickets",
    "gestion-web",
    "configuracion",
}

ADMIN_ROLES = {
    "Administrador",
    "Soporte",
    "Normal",
}


def validate_phone(value: str) -> str:
    if value and not re.fullmatch(r"[0-9+()\s-]{6,30}", value):
        raise ValueError("Ingresa un número telefónico válido")
    return value


class Schema(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class LoginRequest(Schema):
    email: EmailStr
    usuario: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(Schema):
    refreshToken: str


class SessionUser(Schema):
    id: str
    email: EmailStr
    usuario: str
    nombre: str
    rol: str
    telefono: str
    modulos: list[str]
    superAdmin: bool


class TokenResponse(Schema):
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    expiresIn: int
    user: SessionUser


class AdminUserCreate(Schema):
    nombre: str = Field(min_length=2, max_length=160)
    email: EmailStr
    usuario: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=8, max_length=128)
    rol: str = "Administrador"
    telefono: str = Field(default="", max_length=30)
    activo: bool = True
    modulos: list[str]
    superAdmin: bool = False

    @field_validator("modulos")
    @classmethod
    def valid_modules(cls, value: list[str]) -> list[str]:
        if not value or any(module not in ADMIN_MODULES for module in value):
            raise ValueError("Debe indicar al menos un módulo válido")
        return list(dict.fromkeys(value))

    @field_validator("rol")
    @classmethod
    def valid_role(cls, value: str) -> str:
        if value not in ADMIN_ROLES:
            raise ValueError("Rol no válido")
        return value

    @field_validator("telefono")
    @classmethod
    def valid_phone(cls, value: str) -> str:
        return validate_phone(value)


class AdminUserUpdate(Schema):
    nombre: str | None = Field(default=None, min_length=2, max_length=160)
    email: EmailStr | None = None
    usuario: str | None = Field(default=None, min_length=2, max_length=80)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    rol: str | None = None
    telefono: str | None = Field(default=None, max_length=30)
    activo: bool | None = None
    modulos: list[str] | None = None

    @field_validator("modulos")
    @classmethod
    def valid_modules(cls, value: list[str] | None) -> list[str] | None:
        if value is not None and (not value or any(module not in ADMIN_MODULES for module in value)):
            raise ValueError("Debe indicar al menos un módulo válido")
        return list(dict.fromkeys(value)) if value else value

    @field_validator("rol")
    @classmethod
    def valid_role(cls, value: str | None) -> str | None:
        if value is not None and value not in ADMIN_ROLES:
            raise ValueError("Rol no válido")
        return value

    @field_validator("telefono")
    @classmethod
    def valid_phone(cls, value: str | None) -> str | None:
        return validate_phone(value) if value is not None else value


class AdminUserOut(Schema):
    id: str
    nombre: str
    email: EmailStr
    usuario: str
    rol: str
    telefono: str
    activo: bool
    modulos: list[str]
    superAdmin: bool
    createdAt: datetime


class SupportResponsibleOut(Schema):
    id: str
    nombre: str
    telefono: str
    email: EmailStr


class CustomField(Schema):
    id: str
    label: str
    type: Literal["text", "number", "date"]


class CategoryIn(Schema):
    id: str = Field(pattern=r"^[a-z0-9-]+$")
    label: str
    codigo: int = Field(gt=0)
    iconName: str = "package"
    camposPersonalizados: list[CustomField] = []


class CategoryOut(CategoryIn):
    pass


class InventoryIn(Schema):
    categoriaId: str
    sku: str
    qr: str
    foto: str = ""
    item: str | None = None
    marca: str
    descripcion: str
    numeroSerial: str
    procesador: str | None = None
    ghz: str | None = None
    generacion: str | None = None
    pantalla: str | None = None
    memoriaRam: str | None = None
    memoriaInterna: str | None = None
    tipoMemoriaInterna: str | None = None
    modelo: str | None = None
    fechaCompra: date
    facturaGuiaCompra: str
    precio: Decimal = Field(ge=0)
    proveedor: str
    alquiler: bool | None = None
    estado: str
    observaciones: str = ""
    especificacionesPersonalizadas: dict[str, str] = {}


class InventoryOut(InventoryIn):
    id: str
    categoria: int


class CustomerIn(Schema):
    name: str
    ruc: str = Field(pattern=r"^\d{11}$")
    sector: str
    contacto: str
    email: EmailStr
    telefono: str
    eventos: int = Field(default=0, ge=0)
    rating: Literal["VIP", "A+", "Estándar"] = "Estándar"
    ultimaActividad: date | None = None
    estado: Literal["Activo", "Inactivo"] = "Activo"


class CustomerOut(CustomerIn):
    id: str


class OrderIn(Schema):
    fechaEmision: date
    direccionPartida: str
    direccionLlegada: str
    telefonoContacto: str = Field(default="", max_length=30)
    descripcionProductos: str
    cantidadProductos: int = Field(gt=0)
    unidadMedida: Literal["UND"] = "UND"
    motivoTraslado: str
    observaciones: str = ""

    @field_validator("telefonoContacto")
    @classmethod
    def valid_contact_phone(cls, value: str) -> str:
        if value:
            validate_phone(value)
            digits = re.sub(r"\D", "", value)
            if len(digits) < 7 or len(digits) > 15:
                raise ValueError("El número de contacto debe tener entre 7 y 15 dígitos")
        return value


class OrderOut(OrderIn):
    id: str
    numeroPedido: str


class TechnicianIn(Schema):
    nombre: str
    telefono: str = ""
    especialidad: str = ""
    activo: bool = True


class TechnicianOut(TechnicianIn):
    id: str


class TicketIn(Schema):
    area: str | None = None
    equipo: str
    cliente: str
    prioridad: Literal["Urgente", "Alta", "Media", "Baja"]
    descripcion: str
    numeroPedidoEstado: str = Field(min_length=1, max_length=2048)
    tipoTicket: Literal["pedido", "general"] | None = None
    numeroPedido: str = Field(default="", max_length=30)
    telefonoContacto: str = Field(default="", max_length=40)
    direccionPedido: str = Field(default="", max_length=1000)
    estadoEquipo: str = Field(default="", max_length=80)
    tecnicoId: str | None = None
    tecnico: str = ""
    tecnicoTelefono: str = ""

    @model_validator(mode="after")
    def validate_context(self) -> "TicketIn":
        if self.tipoTicket == "pedido" and not (self.numeroPedido and self.telefonoContacto and self.cliente):
            raise ValueError("El ticket por pedido requiere número de pedido, cliente y número de contacto")
        if self.tipoTicket == "general" and not self.estadoEquipo:
            raise ValueError("El ticket general requiere el estado del equipo")
        return self


class TicketUpdate(Schema):
    area: str | None = None
    prioridad: Literal["Urgente", "Alta", "Media", "Baja"] | None = None
    estado: Literal["Abierto", "En Diagnóstico", "En Reparación", "Resuelto"] | None = None
    descripcion: str | None = None
    tecnicoId: str | None = None


class TicketOut(TicketIn):
    # Los tickets anteriores a la migración pueden tener la referencia vacía.
    numeroPedidoEstado: str
    id: str
    codigo: str
    estado: str
    fecha: datetime


class AuditOut(Schema):
    id: str
    fecha: datetime
    usuario: str
    modulo: str
    accion: str
    elemento: str
    detalle: str


class ServiceIn(Schema):
    id: str
    title: str
    category: str
    fullDescription: str
    features: list[str] = []
    specs: list[dict[str, str]] = []
    idealFor: list[str] = []
    activo: bool = True
    orden: int = 0


class QuoteIn(Schema):
    nombre: str = Field(min_length=2, max_length=160)
    empresa: str = Field(min_length=2, max_length=200)
    correo: EmailStr
    telefono: str = Field(min_length=7, max_length=40)
    servicioId: str
    fechas: str = ""
    ciudad: str
    mensaje: str = Field(min_length=10, max_length=5000)


class QuoteOut(QuoteIn):
    id: str
    estado: str
    createdAt: datetime


class QuoteUpdate(Schema):
    estado: Literal["Nueva", "Contactada", "Cotizada", "Cerrada", "Descartada"]


class WebAssetOut(Schema):
    id: str
    section: str
    serviceId: str | None
    name: str
    dataUrl: str
    mimeType: str
    sortOrder: int
    isActive: bool
    createdAt: datetime


class WebAssetUpdate(Schema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    section: str | None = None
    serviceId: str | None = None
    sortOrder: int | None = Field(default=None, ge=0)
    isActive: bool | None = None
