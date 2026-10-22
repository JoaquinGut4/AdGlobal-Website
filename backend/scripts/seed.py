import logging

from sqlalchemy import select

from backend.app.core.config import get_settings
from backend.app.core.database import SessionLocal
from backend.app.core.security import hash_password
from backend.app.models import AdminUser, InventoryCategory, InventoryState, Service
from backend.app.schemas import ADMIN_MODULES


logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

ADMIN_ACCOUNTS = (
    {
        "full_name": "Samuel Aguilar",
        "email": "samuel.aguilar_01@adglobalperu.com",
        "username": "SamuelA01",
        "password_setting": "initial_samuel_password",
    },
    {
        "full_name": "Joaquin Gutierrez",
        "email": "joaquin.gutierrez_02@adglobalperu.com",
        "username": "JoaquinG02",
        "password_setting": "initial_joaquin_password",
    },
)

CATEGORIES = (
    ("laptops", "Laptops", 1, "laptop"),
    ("computadoras", "Computadoras", 2, "package"),
    ("monitores", "Monitores", 3, "monitor"),
    ("tablets", "Tablets", 4, "tablet"),
    ("televisores", "Televisores", 5, "monitor"),
    ("impresoras", "Impresoras", 6, "printer"),
    ("proyectores", "Proyectores", 7, "package"),
)

SERVICES = (
    ("laptops-computadores", "Laptops y computadoras", "Cómputo"),
    ("tablets", "Tablets", "Móvil"),
    ("impresoras-multifuncionales", "Impresoras multifuncionales", "Oficina"),
    ("proyectores", "Proyectores", "Visual"),
    ("equipos-audiovisuales", "Equipos audiovisuales", "Audio"),
    ("totems-digitales", "Tótems digitales", "Visual"),
    ("pantallas-led", "Pantallas LED y televisores", "Visual"),
    ("desarrollo-web", "Desarrollo web y soluciones digitales", "Digital"),
)

INVENTORY_STATES = (
    ("Almacén 1", False),
    ("Oficina", False),
    ("Alquiler", True),
    ("Reparación", False),
    ("Taller", True),
    ("Mantenimiento", False),
    ("Venta", True),
    ("Diagnóstico", True),
    ("Reemplazo requerido", True),
    ("Reservado para reemplazo", True),
    ("Baja", True),
)


def seed() -> None:
    settings = get_settings()
    with SessionLocal() as db:
        for category_id, label, code, icon in CATEGORIES:
            if db.get(InventoryCategory, category_id) is None:
                db.add(InventoryCategory(id=category_id, label=label, code=code, icon_name=icon))

        for order, (name, immutable) in enumerate(INVENTORY_STATES):
            if db.get(InventoryState, name) is None:
                db.add(InventoryState(name=name, is_immutable=immutable, sort_order=order))

        for order, (service_id, title, category) in enumerate(SERVICES):
            if db.get(Service, service_id) is None:
                db.add(Service(id=service_id, title=title, category=category, description="", sort_order=order))

        for account in ADMIN_ACCOUNTS:
            existing = db.scalar(select(AdminUser).where(AdminUser.email == account["email"]))
            if existing:
                continue
            password = getattr(settings, account["password_setting"])
            if not password:
                logger.warning("No se creó %s: falta %s", account["email"], account["password_setting"].upper())
                continue
            db.add(
                AdminUser(
                    full_name=account["full_name"],
                    email=account["email"],
                    username=account["username"],
                    password_hash=hash_password(password),
                    role="Administrador",
                    is_super_admin=True,
                    modules=sorted(ADMIN_MODULES),
                )
            )
        db.commit()
    logger.info("Datos iniciales verificados correctamente")


if __name__ == "__main__":
    seed()
