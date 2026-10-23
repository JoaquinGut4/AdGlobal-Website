import pytest
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


def test_refresh_token_returns_a_usable_access_token(client: TestClient) -> None:
    session = login_as(client, "test@adglobalperu.com", "TestAdmin", "password-segura")
    refreshed = client.post(
        "/api/v1/auth/refresh",
        json={"refreshToken": session["refreshToken"]},
    )
    assert refreshed.status_code == 200, refreshed.text
    assert refreshed.json()["refreshToken"]
    headers = {"Authorization": f"Bearer {refreshed.json()['accessToken']}"}
    assert client.get("/api/v1/auth/me", headers=headers).status_code == 200


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
            "numeroPedidoEstado": "LAP-0001: Almacén 1",
            "tipoTicket": "general",
            "estadoEquipo": "Almacén 1",
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
    assert ticket["numeroPedidoEstado"] == "LAP-0001: Almacén 1"
    assert ticket["tipoTicket"] == "general"
    assert ticket["estadoEquipo"] == "Almacén 1"
    assert ticket["fecha"].endswith(("Z", "+00:00"))

    missing_reference = client.post(
        "/api/v1/tickets",
        headers=auth_headers,
        json={"cliente": "Empresa Prueba", "equipo": "LAP-0001", "prioridad": "Alta", "descripcion": "No enciende"},
    )
    assert missing_reference.status_code == 422

    missing_contact = client.post(
        "/api/v1/tickets",
        headers=auth_headers,
        json={
            "cliente": "Empresa Prueba", "equipo": "LAP-0001", "prioridad": "Alta",
            "descripcion": "No enciende", "numeroPedidoEstado": "PED-2026-001",
            "tipoTicket": "pedido", "numeroPedido": "PED-2026-001",
        },
    )
    assert missing_contact.status_code == 422

    by_order = client.post(
        "/api/v1/tickets",
        headers=auth_headers,
        json={
            "cliente": "Empresa Prueba", "equipo": "LAP-0001", "prioridad": "Alta",
            "descripcion": "No enciende", "numeroPedidoEstado": "PED-2026-001",
            "tipoTicket": "pedido", "numeroPedido": "PED-2026-001",
            "telefonoContacto": "955746704",
            "direccionPedido": "Av. Principal 123, Miraflores, Lima",
        },
    )
    assert by_order.status_code == 422

    missing_state = client.post(
        "/api/v1/tickets",
        headers=auth_headers,
        json={
            "cliente": "Inventario interno", "equipo": "LAP-0001", "prioridad": "Media",
            "descripcion": "Revisión", "numeroPedidoEstado": "Almacén 1", "tipoTicket": "general",
        },
    )
    assert missing_state.status_code == 422

    completed = client.post(
        f"/api/v1/tickets/{ticket['id']}/resolver",
        headers=auth_headers,
        json={"evidencias": ["/uploads/tickets/evidencia.jpg"], "descripcionSolucion": "Incidencia atendida"},
    )
    assert completed.status_code == 409

    deleted = client.delete(f"/api/v1/tickets/{ticket['id']}", headers=auth_headers)
    assert deleted.status_code == 204
    assert all(
        item["id"] != ticket["id"]
        for item in client.get("/api/v1/tickets", headers=auth_headers).json()
    )


def test_existing_ticket_without_reference_is_still_readable(client: TestClient, auth_headers: dict[str, str]) -> None:
    from backend.app.core.database import SessionLocal
    from backend.app.models import SupportTicket

    with SessionLocal() as db:
        db.add(SupportTicket(
            code="TKT-LEGACY-001", equipment="Equipo antiguo", customer="Cliente antiguo",
            priority="Media", description="Incidencia registrada antes del nuevo campo",
            technician_name="Técnico", order_or_status="",
        ))
        db.commit()

    response = client.get("/api/v1/tickets", headers=auth_headers)
    assert response.status_code == 200, response.text
    assert response.json()[0]["numeroPedidoEstado"] == ""
    assert response.json()[0]["direccionPedido"] == ""


def test_order_contact_phone_is_saved_and_editable(client: TestClient, auth_headers: dict[str, str]) -> None:
    order = {
        "fechaEmision": "2026-10-20",
        "direccionPartida": "Almacén",
        "direccionLlegada": "Cliente de prueba",
        "telefonoContacto": "+51 955 746 704",
        "descripcionProductos": "LAP-0001 · Laptop",
        "cantidadProductos": 1,
        "unidadMedida": "UND",
        "motivoTraslado": "Alquiler",
        "observaciones": "",
    }
    created = client.post("/api/v1/pedidos", json=order, headers=auth_headers)
    assert created.status_code == 201, created.text
    assert created.json()["telefonoContacto"] == order["telefonoContacto"]
    order_id = created.json()["id"]

    listed = client.get("/api/v1/pedidos", headers=auth_headers)
    assert listed.status_code == 200
    assert listed.json()[0]["telefonoContacto"] == order["telefonoContacto"]

    updated = client.put(
        f"/api/v1/pedidos/{order_id}",
        json={**order, "telefonoContacto": "987654321"},
        headers=auth_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["telefonoContacto"] == "987654321"

    invalid = client.post(
        "/api/v1/pedidos",
        json={**order, "telefonoContacto": "123"},
        headers=auth_headers,
    )
    assert invalid.status_code == 422


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
    assert len(listed.json()["items"]) == 1

    scanned = client.get("/api/v1/inventario/por-qr?codigo=QR-LAP-TEST-001", headers=auth_headers)
    assert scanned.status_code == 200
    assert scanned.json()["id"] == item_id
    assert client.get("/api/v1/inventario/por-qr?codigo=QR-NO-EXISTE", headers=auth_headers).status_code == 404

    invalid_update = client.put(
        f"/api/v1/inventario/{item_id}",
        json={**payload, "categoriaId": "categoria-inexistente"},
        headers=auth_headers,
    )
    assert invalid_update.status_code == 422

    deleted = client.delete(f"/api/v1/inventario/{item_id}", headers=auth_headers)
    assert deleted.status_code == 204


def test_operational_modules_are_persisted_together(client: TestClient, auth_headers: dict[str, str]) -> None:
    asset_payload = {
        "categoriaId": "laptops",
        "sku": "LAP-FLOW-001",
        "qr": "QR-LAP-FLOW-001",
        "foto": "",
        "marca": "Lenovo",
        "descripcion": "Equipo para flujo integrado",
        "numeroSerial": "SERIAL-FLOW-001",
        "fechaCompra": "2026-10-20",
        "facturaGuiaCompra": "F001-100",
        "precio": 2500,
        "proveedor": "Proveedor SAC",
        "estado": "Almacén 1",
        "observaciones": "",
    }
    asset = client.post("/api/v1/inventario", json=asset_payload, headers=auth_headers)
    assert asset.status_code == 201, asset.text

    order_payload = {
        "fechaEmision": "2026-10-22",
        "direccionPartida": "Almacén",
        "direccionLlegada": "Empresa: Cliente Integrado SAC · Dirección: Av. Principal 123 · Distrito: Miraflores · Provincia: Lima · Departamento: Lima",
        "telefonoContacto": "999888777",
        "descripcionProductos": "LAP-FLOW-001 · Laptops · Equipo para flujo integrado",
        "cantidadProductos": 1,
        "unidadMedida": "UND",
        "motivoTraslado": "Alquiler",
        "observaciones": "",
        "skus": ["LAP-FLOW-001"],
    }
    created = client.post("/api/v1/pedidos", json=order_payload, headers=auth_headers)
    assert created.status_code == 201, created.text
    order = created.json()
    assert order["estadoPedido"] == "Activo"
    assert order["estadosAnteriores"] == {asset.json()["id"]: "Almacén 1"}

    inventory = client.get("/api/v1/inventario", headers=auth_headers).json()["items"]
    assert next(item for item in inventory if item["id"] == asset.json()["id"])["estado"] == "Alquiler"

    customers = client.get("/api/v1/clientes/derivados", headers=auth_headers)
    assert customers.status_code == 200, customers.text
    assert customers.json()[0]["nombre"] == "Cliente Integrado SAC"
    assert customers.json()[0]["pedidosVigentes"] == 1

    finished = client.patch(f"/api/v1/pedidos/{order['id']}/finalizar", headers=auth_headers)
    assert finished.status_code == 200, finished.text
    assert finished.json()["pedido"]["estadoPedido"] == "Finalizado"
    assert finished.json()["inventarioActualizado"] == 1

    inventory = client.get("/api/v1/inventario", headers=auth_headers).json()["items"]
    assert next(item for item in inventory if item["id"] == asset.json()["id"])["estado"] == "Almacén 1"
    movements = client.get("/api/v1/movimientos", headers=auth_headers)
    assert movements.status_code == 200
    assert any(item["elemento"] == order["numeroPedido"] for item in movements.json()["items"])


def test_ticket_persists_inventory_transition(client: TestClient, auth_headers: dict[str, str]) -> None:
    asset_payload = {
        "categoriaId": "laptops",
        "sku": "LAP-TICKET-001",
        "qr": "QR-LAP-TICKET-001",
        "foto": "",
        "marca": "Dell",
        "descripcion": "Equipo con incidencia",
        "numeroSerial": "SERIAL-TICKET-001",
        "fechaCompra": "2026-10-20",
        "facturaGuiaCompra": "F001-200",
        "precio": 2200,
        "proveedor": "Proveedor SAC",
        "estado": "Oficina",
        "observaciones": "",
    }
    asset = client.post("/api/v1/inventario", json=asset_payload, headers=auth_headers).json()
    ticket = client.post(
        "/api/v1/tickets",
        headers=auth_headers,
        json={
            "cliente": "Inventario interno",
            "equipo": "LAP-TICKET-001 — Equipo con incidencia",
            "numeroPedidoEstado": "Oficina",
            "tipoTicket": "general",
            "estadoEquipo": "Oficina",
            "prioridad": "Alta",
            "descripcion": "No enciende",
            "equiposIds": [],
        },
    )
    assert ticket.status_code == 201, ticket.text
    assert ticket.json()["equiposIds"] == []
    diagnosed = client.post(
        f"/api/v1/tickets/{ticket.json()['id']}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": [asset["id"]]},
    )
    assert diagnosed.status_code == 200, diagnosed.text
    assert diagnosed.json()["equiposIds"] == [asset["id"]]
    assert diagnosed.json()["estadosAnteriores"] == {asset["id"]: "Oficina"}
    inventory = client.get("/api/v1/inventario", headers=auth_headers).json()["items"]
    assert next(item for item in inventory if item["id"] == asset["id"])["estado"] == "Diagnóstico"

    resolved = client.post(
        f"/api/v1/tickets/{ticket.json()['id']}/resolver",
        headers=auth_headers,
        json={"evidencias": ["/uploads/tickets/evidencia.jpg"], "descripcionSolucion": "Equipo reparado"},
    )
    assert resolved.status_code == 200, resolved.text
    inventory = client.get("/api/v1/inventario", headers=auth_headers).json()["items"]
    assert next(item for item in inventory if item["id"] == asset["id"])["estado"] == "Oficina"


def test_replacement_workflow_updates_inventory_and_order(client: TestClient, auth_headers: dict[str, str]) -> None:
    def create_asset(sku: str, serial: str) -> dict:
        response = client.post("/api/v1/inventario", headers=auth_headers, json={
            "categoriaId": "laptops", "sku": sku, "qr": f"QR-{sku}", "foto": "", "marca": "Dell",
            "descripcion": f"Equipo {sku}", "numeroSerial": serial, "fechaCompra": "2026-10-20",
            "facturaGuiaCompra": "F001", "precio": 2000, "proveedor": "Proveedor", "estado": "Almacén 1", "observaciones": "",
        })
        assert response.status_code == 201, response.text
        return response.json()

    affected = create_asset("LAP-REP-001", "SER-REP-001")
    replacement = create_asset("LAP-REP-002", "SER-REP-002")
    order = client.post("/api/v1/pedidos", headers=auth_headers, json={
        "fechaEmision": "2026-10-22", "direccionPartida": "Almacén",
        "direccionLlegada": "Empresa: Cliente SAC · Dirección: Calle 1 · Distrito: Lima · Provincia: Lima · Departamento: Lima",
        "telefonoContacto": "999999999", "descripcionProductos": "LAP-REP-001 · Laptop", "cantidadProductos": 1,
        "unidadMedida": "UND", "motivoTraslado": "Alquiler", "observaciones": "", "skus": ["LAP-REP-001"],
    }).json()
    ticket = client.post("/api/v1/tickets", headers=auth_headers, json={
        "cliente": "Cliente SAC", "equipo": "LAP-REP-001 — Equipo", "numeroPedidoEstado": order["numeroPedido"],
        "tipoTicket": "pedido", "numeroPedido": order["numeroPedido"], "telefonoContacto": "999999999",
        "direccionPedido": "Calle 1", "prioridad": "Alta", "descripcion": "No reparable", "equiposIds": [],
    }).json()

    diagnosed = client.post(f"/api/v1/tickets/{ticket['id']}/diagnostico", headers=auth_headers, json={
        "equiposAfectadosIds": [affected["id"]], "reparable": False, "equiposReemplazoIds": [replacement["id"]],
    })
    assert diagnosed.status_code == 200, diagnosed.text
    assert diagnosed.json()["estado"] == "En Reemplazo"
    inventory = client.get("/api/v1/inventario?page_size=50", headers=auth_headers).json()["items"]
    assert next(item for item in inventory if item["id"] == affected["id"])["estado"] == "Reemplazo requerido"
    assert next(item for item in inventory if item["id"] == replacement["id"])["estado"] == "Reservado para reemplazo"

    rolled_back = client.post(f"/api/v1/tickets/{ticket['id']}/volver", headers=auth_headers)
    assert rolled_back.status_code == 200, rolled_back.text
    assert rolled_back.json()["flujo"] == "Pendiente"
    assert rolled_back.json()["equiposIds"] == []
    inventory = client.get("/api/v1/inventario?page_size=50", headers=auth_headers).json()["items"]
    assert next(item for item in inventory if item["id"] == affected["id"])["estado"] == "Alquiler"
    assert next(item for item in inventory if item["id"] == replacement["id"])["estado"] == "Almacén 1"

    diagnosed = client.post(f"/api/v1/tickets/{ticket['id']}/diagnostico", headers=auth_headers, json={
        "equiposAfectadosIds": [affected["id"]], "reparable": False, "equiposReemplazoIds": [replacement["id"]],
    })
    assert diagnosed.status_code == 200, diagnosed.text

    resolved = client.post(f"/api/v1/tickets/{ticket['id']}/resolver", headers=auth_headers, json={
        "evidencias": ["/uploads/tickets/reemplazo.jpg"], "descripcionSolucion": "Se instaló equipo de reemplazo",
    })
    assert resolved.status_code == 200, resolved.text
    inventory = client.get("/api/v1/inventario?page_size=50", headers=auth_headers).json()["items"]
    assert next(item for item in inventory if item["id"] == affected["id"])["estado"] == "Baja"
    assert next(item for item in inventory if item["id"] == replacement["id"])["estado"] == "Alquiler"
    updated_order = next(item for item in client.get("/api/v1/pedidos", headers=auth_headers).json() if item["id"] == order["id"])
    assert updated_order["skus"] == ["LAP-REP-002"]

    finished = client.patch(f"/api/v1/pedidos/{order['id']}/finalizar", headers=auth_headers)
    assert finished.status_code == 200
    inventory = client.get("/api/v1/inventario?page_size=50", headers=auth_headers).json()["items"]
    assert next(item for item in inventory if item["id"] == replacement["id"])["estado"] == "Almacén 1"


def login_as(client: TestClient, email: str, usuario: str, password: str) -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "usuario": usuario, "password": password},
    )
    assert response.status_code == 200, response.text
    return response.json()


def create_user(client: TestClient, auth_headers: dict[str, str], **overrides: object) -> dict:
    payload: dict[str, object] = {
        "nombre": "Usuario de Prueba",
        "email": "usuario.prueba@adglobalperu.com",
        "usuario": "UsuarioPrueba",
        "password": "UsuarioPrueba2026",
        "rol": "Normal",
        "telefono": "+51 900 000 003",
        "activo": True,
        "modulos": ["dashboard"],
    }
    payload.update(overrides)
    response = client.post("/api/v1/usuarios", headers=auth_headers, json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def test_staff_directory_requires_tickets_module(client: TestClient, auth_headers: dict[str, str]) -> None:
    created = create_user(client, auth_headers)
    session = login_as(client, created["email"], created["usuario"], "UsuarioPrueba2026")
    limited = {"Authorization": f"Bearer {session['accessToken']}"}

    assert client.get("/api/v1/usuarios/soporte", headers=limited).status_code == 403
    assert client.get("/api/v1/usuarios/soporte", headers=auth_headers).status_code == 200

    granted = client.patch(
        f"/api/v1/usuarios/{created['id']}",
        headers=auth_headers,
        json={"modulos": ["dashboard", "tickets"]},
    )
    assert granted.status_code == 200, granted.text

    # Changing modules bumps the token version, so the previous session must be re-established.
    assert client.get("/api/v1/usuarios/soporte", headers=limited).status_code == 401

    renewed = login_as(client, created["email"], created["usuario"], "UsuarioPrueba2026")
    allowed = {"Authorization": f"Bearer {renewed['accessToken']}"}
    assert client.get("/api/v1/usuarios/soporte", headers=allowed).status_code == 200


def test_password_change_revokes_existing_tokens(client: TestClient, auth_headers: dict[str, str]) -> None:
    created = create_user(client, auth_headers)
    session = login_as(client, created["email"], created["usuario"], "UsuarioPrueba2026")
    old_access = {"Authorization": f"Bearer {session['accessToken']}"}

    changed = client.patch(
        f"/api/v1/usuarios/{created['id']}",
        headers=auth_headers,
        json={"password": "NuevaClave2026"},
    )
    assert changed.status_code == 200, changed.text

    assert client.get("/api/v1/auth/me", headers=old_access).status_code == 401
    refreshed = client.post("/api/v1/auth/refresh", json={"refreshToken": session["refreshToken"]})
    assert refreshed.status_code == 401

    login_as(client, created["email"], created["usuario"], "NuevaClave2026")


def test_last_superadmin_cannot_deactivate_itself(client: TestClient, auth_headers: dict[str, str]) -> None:
    me = client.get("/api/v1/auth/me", headers=auth_headers).json()

    response = client.patch(
        f"/api/v1/usuarios/{me['id']}",
        headers=auth_headers,
        json={"activo": False},
    )
    assert response.status_code == 400, response.text
    assert client.get("/api/v1/auth/me", headers=auth_headers).status_code == 200


def test_password_hash_uses_recommended_work_factor() -> None:
    from backend.app.core.security import hash_password

    digest = hash_password("PruebaSegura2026")
    assert digest.startswith("$pbkdf2-sha256$600000$")


def test_login_locks_the_account_after_repeated_failures(client: TestClient) -> None:
    credentials = {"email": "test@adglobalperu.com", "usuario": "TestAdmin", "password": "incorrecta"}

    for _ in range(5):
        assert client.post("/api/v1/auth/login", json=credentials).status_code == 401

    blocked = client.post("/api/v1/auth/login", json={**credentials, "password": "password-segura"})
    assert blocked.status_code == 429
    assert int(blocked.headers["Retry-After"]) >= 1


def test_login_lockout_is_scoped_to_the_attempted_account(client: TestClient) -> None:
    credentials = {"email": "test@adglobalperu.com", "usuario": "TestAdmin", "password": "incorrecta"}
    for _ in range(5):
        assert client.post("/api/v1/auth/login", json=credentials).status_code == 401

    other = client.post(
        "/api/v1/auth/login",
        json={"email": "otra@adglobalperu.com", "usuario": "OtraCuenta", "password": "incorrecta"},
    )
    assert other.status_code == 401


def test_unknown_user_still_runs_a_dummy_verification(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    import backend.app.api.auth as auth_module

    calls: list[str] = []
    monkeypatch.setattr(auth_module, "verify_dummy_password", lambda password: calls.append(password) or False)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nadie@adglobalperu.com", "usuario": "Nadie", "password": "incorrecta"},
    )
    assert response.status_code == 401
    assert calls == ["incorrecta"]


def test_sliding_window_limiter_blocks_and_releases_the_key() -> None:
    from backend.app.core.rate_limit import SlidingWindowLimiter

    limiter = SlidingWindowLimiter(max_events=2, window_seconds=60)
    assert limiter.check("cuenta").allowed
    limiter.record("cuenta")
    limiter.record("cuenta")
    blocked = limiter.check("cuenta")
    assert not blocked.allowed
    assert blocked.retry_after >= 1

    limiter.reset("cuenta")
    assert limiter.check("cuenta").allowed


def test_documentation_is_only_exposed_in_development() -> None:
    from backend.app.main import documentation_urls

    assert documentation_urls("development") == {
        "openapi_url": "/openapi.json",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
    }
    for environment in ("production", "staging", "test", "Development"):
        assert documentation_urls(environment) == {
            "openapi_url": None,
            "docs_url": None,
            "redoc_url": None,
        }


def test_ip_rate_limit_is_skipped_for_loopback_peers() -> None:
    from backend.app.core.rate_limit import should_limit_by_ip

    assert should_limit_by_ip("203.0.113.7") is True
    assert should_limit_by_ip("127.0.0.1") is False
    assert should_limit_by_ip("::1") is False


def test_logout_revokes_the_current_session(client: TestClient) -> None:
    session = login_as(client, "test@adglobalperu.com", "TestAdmin", "password-segura")
    headers = {"Authorization": f"Bearer {session['accessToken']}"}

    assert client.get("/api/v1/auth/me", headers=headers).status_code == 200
    assert client.post("/api/v1/auth/logout", headers=headers).status_code == 204

    assert client.get("/api/v1/auth/me", headers=headers).status_code == 401
    refreshed = client.post("/api/v1/auth/refresh", json={"refreshToken": session["refreshToken"]})
    assert refreshed.status_code == 401


def test_logout_requires_authentication(client: TestClient) -> None:
    assert client.post("/api/v1/auth/logout").status_code == 401
