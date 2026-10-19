from fastapi.testclient import TestClient


def test_login_rejects_invalid_credentials(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@adglobalperu.com", "usuario": "TestAdmin", "password": "incorrecta"},
    )
    assert response.status_code == 401


def test_login_and_me(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["usuario"] == "TestAdmin"
    assert response.json()["superAdmin"] is True


def test_public_quote_flow(client: TestClient) -> None:
    response = client.post(
        "/api/v1/public/quotes",
        json={
            "nombre": "Carlos Mendoza",
            "empresa": "Empresa SAC",
            "correo": "carlos@empresa.com",
            "telefono": "999888777",
            "servicioId": "laptops-computadores",
            "fechas": "Noviembre",
            "ciudad": "Lima",
            "mensaje": "Necesito veinte equipos configurados.",
        },
    )
    assert response.status_code == 201
    assert response.json()["estado"] == "Nueva"


def test_support_user_is_available_for_tickets(client: TestClient, auth_headers: dict[str, str]) -> None:
    created = client.post(
        "/api/v1/usuarios",
        headers=auth_headers,
        json={
            "nombre": "Soporte de Prueba",
            "email": "soporte.prueba@adglobalperu.com",
            "usuario": "SoportePrueba",
            "password": "SoportePrueba2026",
            "rol": "Soporte",
            "telefono": "+51 987 654 321",
            "activo": True,
            "modulos": ["dashboard", "tickets"],
        },
    )
    assert created.status_code == 201, created.text
    assert created.json()["rol"] == "Soporte"

    responsibles = client.get("/api/v1/usuarios/soporte", headers=auth_headers)
    assert responsibles.status_code == 200
    assert responsibles.json() == [
        {
            "id": created.json()["id"],
            "nombre": "Soporte de Prueba",
            "telefono": "+51 987 654 321",
            "email": "soporte.prueba@adglobalperu.com",
        }
    ]

    invalid_role = client.post(
        "/api/v1/usuarios",
        headers=auth_headers,
        json={
            "nombre": "Rol Inválido",
            "email": "rol.invalido@adglobalperu.com",
            "usuario": "RolInvalido",
            "password": "RolInvalido2026",
            "rol": "Inventario",
            "telefono": "+51 900 000 000",
            "modulos": ["dashboard"],
        },
    )
    assert invalid_role.status_code == 422


def test_update_and_delete_user(client: TestClient, auth_headers: dict[str, str]) -> None:
    created = client.post(
        "/api/v1/usuarios",
        headers=auth_headers,
        json={
            "nombre": "Usuario Editable",
            "email": "editable@adglobalperu.com",
            "usuario": "UsuarioEditable",
            "password": "UsuarioEditable2026",
            "rol": "Normal",
            "telefono": "+51 900 000 001",
            "modulos": ["dashboard"],
        },
    )
    assert created.status_code == 201, created.text
    user_id = created.json()["id"]

    updated = client.patch(
        f"/api/v1/usuarios/{user_id}",
        headers=auth_headers,
        json={
            "nombre": "Usuario Actualizado",
            "email": "actualizado@adglobalperu.com",
            "usuario": "UsuarioActualizado",
            "rol": "Soporte",
            "telefono": "+51 900 000 002",
            "modulos": ["dashboard", "tickets"],
        },
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["nombre"] == "Usuario Actualizado"
    assert updated.json()["email"] == "actualizado@adglobalperu.com"
    assert updated.json()["usuario"] == "UsuarioActualizado"
    assert updated.json()["rol"] == "Soporte"

    deleted = client.delete(f"/api/v1/usuarios/{user_id}", headers=auth_headers)
    assert deleted.status_code == 204

    listed = client.get("/api/v1/usuarios", headers=auth_headers)
    assert all(item["id"] != user_id for item in listed.json())

    me = client.get("/api/v1/auth/me", headers=auth_headers).json()
    own_delete = client.delete(f"/api/v1/usuarios/{me['id']}", headers=auth_headers)
    assert own_delete.status_code == 400


def test_create_ticket_assigns_support_user(client: TestClient, auth_headers: dict[str, str]) -> None:
    support = client.post(
        "/api/v1/usuarios",
        headers=auth_headers,
        json={
            "nombre": "Andre Reyes",
            "email": "andre.reyes@adglobalperu.com",
            "usuario": "AndreReyes",
            "password": "AndreReyes2026",
            "rol": "Soporte",
            "telefono": "955746704",
            "activo": True,
            "modulos": ["dashboard", "tickets"],
        },
    )
    assert support.status_code == 201, support.text
    support_id = support.json()["id"]

    created = client.post(
        "/api/v1/tickets",
        headers=auth_headers,
        json={
            "cliente": "Empresa Prueba",
            "equipo": "LAP-0001 — Laptop",
            "prioridad": "Alta",
            "descripcion": "No enciende",
            "tecnicoId": support_id,
            "tecnico": "Nombre alternativo",
        },
    )
    assert created.status_code == 201, created.text
    ticket = created.json()
    assert ticket["tecnico"] == "Andre Reyes"
    assert ticket["tecnicoTelefono"] == "955746704"

    completed = client.patch(
        f"/api/v1/tickets/{ticket['id']}",
        headers=auth_headers,
        json={"estado": "Resuelto"},
    )
    assert completed.status_code == 200, completed.text
    assert completed.json()["estado"] == "Resuelto"

    deleted = client.delete(f"/api/v1/tickets/{ticket['id']}", headers=auth_headers)
    assert deleted.status_code == 204
    assert all(
        item["id"] != ticket["id"]
        for item in client.get("/api/v1/tickets", headers=auth_headers).json()
    )


def test_inventory_crud(client: TestClient, auth_headers: dict[str, str]) -> None:
    payload = {
        "categoriaId": "laptops",
        "sku": "LAP-TEST-001",
        "qr": "QR-LAP-TEST-001",
        "foto": "",
        "marca": "Lenovo",
        "descripcion": "ThinkPad de prueba",
        "numeroSerial": "SERIAL-TEST-001",
        "fechaCompra": "2026-10-19",
        "facturaGuiaCompra": "F001-1",
        "precio": 2500,
        "proveedor": "Proveedor SAC",
        "estado": "Almacén 1",
        "observaciones": "Operativo",
    }
    created = client.post("/api/v1/inventario", json=payload, headers=auth_headers)
    assert created.status_code == 201
    item_id = created.json()["id"]

    listed = client.get("/api/v1/inventario?search=LAP-TEST", headers=auth_headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    deleted = client.delete(f"/api/v1/inventario/{item_id}", headers=auth_headers)
    assert deleted.status_code == 204
