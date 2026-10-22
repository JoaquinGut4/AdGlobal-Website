import os
from pathlib import Path


Path('.pytest_cache').mkdir(exist_ok=True)
os.environ["SECRET_KEY"] = "test-secret-key-with-more-than-thirty-two-characters"
os.environ["DATABASE_URL_OVERRIDE"] = "sqlite:///./.pytest_cache/adglobal_test.db"
os.environ["UPLOAD_DIRECTORY"] = "backend/tests/uploads"

import pytest
from fastapi.testclient import TestClient

from backend.app.core.database import Base, SessionLocal, engine
from backend.app.core.rate_limit import account_login_limiter, ip_login_limiter
from backend.app.core.security import hash_password
from backend.app.main import app
from backend.app.models import AdminUser, InventoryCategory, InventoryState, Service
from backend.app.schemas import ADMIN_MODULES


@pytest.fixture(autouse=True)
def database():
    account_login_limiter.reset_all()
    ip_login_limiter.reset_all()
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        db.add(
            AdminUser(
                full_name="Usuario Prueba",
                email="test@adglobalperu.com",
                username="TestAdmin",
                password_hash=hash_password("password-segura"),
                is_super_admin=True,
                modules=sorted(ADMIN_MODULES),
            )
        )
        db.add(InventoryCategory(id="laptops", label="Laptops", code=1, icon_name="laptop"))
        states = ("Almacén 1", "Oficina", "Alquiler", "Taller", "Venta", "Diagnóstico", "Reparación", "Reemplazo requerido", "Reservado para reemplazo", "Baja")
        for order, state in enumerate(states):
            db.add(InventoryState(name=state, is_immutable=state in {"Alquiler", "Taller", "Venta", "Diagnóstico", "Reparación", "Reemplazo requerido", "Reservado para reemplazo", "Baja"}, sort_order=order))
        db.add(Service(id="laptops-computadores", title="Laptops y computadoras", category="Cómputo", description="Servicio de prueba"))
        db.commit()
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@adglobalperu.com", "usuario": "TestAdmin", "password": "password-segura"},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['accessToken']}"}
