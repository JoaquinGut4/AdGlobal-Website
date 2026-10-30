"""Pruebas del ciclo de vida de los tickets de soporte.

Cubren creación, diagnóstico (reparación y reemplazo), reversión, resolución,
eliminación y las reglas de integridad con inventario y pedidos.
"""

from datetime import date

from fastapi.testclient import TestClient


def support_user(client: TestClient, auth_headers: dict[str, str], **overrides: object) -> dict:
    payload: dict[str, object] = {
        "nombre": "Soporte Tickets",
        "email": "soporte.tickets@adglobalperu.com",
        "usuario": "SoporteTickets",
        "password": "SoporteTickets2026",
        "rol": "Soporte",
        "telefono": "955746704",
        "activo": True,
        "modulos": ["dashboard", "tickets"],
    }
    payload.update(overrides)
    response = client.post("/api/v1/usuarios", headers=auth_headers, json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def asset(
    client: TestClient,
    auth_headers: dict[str, str],
    sku: str,
    *,
    estado: str = "Almacén 1",
    ubicacion: str = "Almacén 1",
) -> dict:
    response = client.post(
        "/api/v1/inventario",
        headers=auth_headers,
        json={
            "categoriaId": "laptops",
            "sku": sku,
            "qr": f"QR-{sku}",
            "foto": "",
            "marca": "Dell",
            "descripcion": f"Equipo {sku}",
            "numeroSerial": f"SER-{sku}",
            "fechaCompra": "2026-10-20",
            "facturaGuiaCompra": "F001",
            "precio": 2000,
            "proveedor": "Proveedor",
            "estado": estado,
            "ubicacion": ubicacion,
            "observaciones": "",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def order(
    client: TestClient,
    auth_headers: dict[str, str],
    skus: list[str],
    *,
    motivo: str = "Alquiler",
) -> dict:
    response = client.post(
        "/api/v1/pedidos",
        headers=auth_headers,
        json={
            "fechaEmision": date.today().isoformat(),
            "direccionPartida": "Almacén",
            "direccionLlegada": (
                "Empresa: Cliente SAC · Dirección: Calle 1 · Distrito: Lima · "
                "Provincia: Lima · Departamento: Lima"
            ),
            "telefonoContacto": "999999999",
            "descripcionProductos": " · ".join(skus),
            "cantidadProductos": len(skus),
            "unidadMedida": "UND",
            "motivoTraslado": motivo,
            "observaciones": "",
            "skus": skus,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def general_ticket(
    client: TestClient,
    auth_headers: dict[str, str],
    *,
    estado: str = "Almacén 1",
    **overrides: object,
) -> dict:
    payload: dict[str, object] = {
        "cliente": "Inventario interno",
        "equipo": "Pendiente de selección",
        "numeroPedidoEstado": estado,
        "tipoTicket": "general",
        "estadoEquipo": estado,
        "prioridad": "Alta",
        "descripcion": "No enciende",
        "equiposIds": [],
    }
    payload.update(overrides)
    response = client.post("/api/v1/tickets", headers=auth_headers, json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def order_ticket(client: TestClient, auth_headers: dict[str, str], pedido: dict, **overrides: object) -> dict:
    payload: dict[str, object] = {
        "cliente": "Cliente SAC",
        "equipo": "Pendiente de selección",
        "numeroPedidoEstado": pedido["numeroPedido"],
        "tipoTicket": "pedido",
        "numeroPedido": pedido["numeroPedido"],
        "telefonoContacto": "999999999",
        "direccionPedido": "Calle 1",
        "prioridad": "Alta",
        "descripcion": "Equipo con falla",
        "equiposIds": [],
    }
    payload.update(overrides)
    response = client.post("/api/v1/tickets", headers=auth_headers, json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def inventory_row(client: TestClient, auth_headers: dict[str, str], asset_id: str) -> dict:
    rows = client.get("/api/v1/inventario?page_size=100", headers=auth_headers).json()["items"]
    return next(item for item in rows if item["id"] == asset_id)


def test_codes_are_sequential_and_creation_starts_pending(client: TestClient, auth_headers: dict[str, str]) -> None:
    first = general_ticket(client, auth_headers)
    second = general_ticket(client, auth_headers, estado="Oficina")

    assert first["codigo"] == f"TKT-{date.today().year}-001"
    assert second["codigo"] == f"TKT-{date.today().year}-002"
    assert first["estado"] == "Abierto"
    assert first["flujo"] == "Pendiente"
    assert first["equipo"] == "Pendiente de selección"
    assert first["equiposIds"] == []
    assert first["estadosAnteriores"] == {}


def test_creation_rejects_equipment_before_diagnosis(client: TestClient, auth_headers: dict[str, str]) -> None:
    equipo = asset(client, auth_headers, "LAP-CREATE-001", estado="Oficina")

    response = client.post(
        "/api/v1/tickets",
        headers=auth_headers,
        json={
            "cliente": "Inventario interno",
            "equipo": "LAP-CREATE-001",
            "numeroPedidoEstado": "Oficina",
            "tipoTicket": "general",
            "estadoEquipo": "Oficina",
            "prioridad": "Alta",
            "descripcion": "No enciende",
            "equiposIds": [equipo["id"]],
        },
    )

    assert response.status_code == 422
    assert "Gestionar flujo" in response.json()["detail"]


def test_creation_requires_a_ticket_type(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.post(
        "/api/v1/tickets",
        headers=auth_headers,
        json={
            "cliente": "Inventario interno",
            "equipo": "Pendiente de selección",
            "numeroPedidoEstado": "Almacén 1",
            "prioridad": "Alta",
            "descripcion": "No enciende",
        },
    )
    assert response.status_code == 422

    from backend.app.core.database import SessionLocal
    from backend.app.models import SupportTicket

    with SessionLocal() as db:
        legacy = SupportTicket(
            code="TKT-LEGACY-TYPE",
            equipment="Equipo antiguo",
            customer="Cliente antiguo",
            priority="Media",
            description="Ticket anterior sin tipo",
            order_or_status="Almacén 1",
            ticket_type="",
        )
        db.add(legacy)
        db.commit()
        legacy_id = legacy.id

    blocked = client.post(
        f"/api/v1/tickets/{legacy_id}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": ["cualquiera"]},
    )
    assert blocked.status_code == 422
    assert "tipo definido" in blocked.json()["detail"]


def test_general_repair_flow_restores_inventory_and_locks_resolved_ticket(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    equipo = asset(client, auth_headers, "LAP-REPAIR-001", estado="Oficina")
    ticket = general_ticket(client, auth_headers, estado="Oficina")

    diagnosed = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": [equipo["id"]]},
    )
    assert diagnosed.status_code == 200, diagnosed.text
    body = diagnosed.json()
    assert body["estado"] == "En Reparación"
    assert body["flujo"] == "General"
    assert body["estadosAnteriores"] == {equipo["id"]: "Oficina"}
    assert body["ubicacionesAnteriores"] == {equipo["id"]: "Almacén 1"}

    in_workshop = inventory_row(client, auth_headers, equipo["id"])
    assert in_workshop["estado"] == "Reparación"
    assert in_workshop["ubicacion"] == "Taller"

    resolved = client.post(
        f"/api/v1/tickets/{ticket['id']}/resolver",
        headers=auth_headers,
        json={"evidencias": ["/uploads/tickets/reparacion.jpg"], "descripcionSolucion": "Se cambió la placa"},
    )
    assert resolved.status_code == 200, resolved.text
    assert resolved.json()["estado"] == "Resuelto"
    assert resolved.json()["fechaResolucion"] is not None

    restored = inventory_row(client, auth_headers, equipo["id"])
    assert restored["estado"] == "Oficina"
    assert restored["ubicacion"] == "Almacén 1"

    assert client.delete(f"/api/v1/tickets/{ticket['id']}", headers=auth_headers).status_code == 409
    assert client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": [equipo["id"]]},
    ).status_code == 409
    assert client.post(f"/api/v1/tickets/{ticket['id']}/volver", headers=auth_headers).status_code == 409


def test_deleting_active_ticket_restores_inventory(client: TestClient, auth_headers: dict[str, str]) -> None:
    equipo = asset(client, auth_headers, "LAP-DELETE-001", estado="Oficina")
    ticket = general_ticket(client, auth_headers, estado="Oficina")
    diagnosed = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": [equipo["id"]]},
    )
    assert diagnosed.status_code == 200, diagnosed.text

    deleted = client.delete(f"/api/v1/tickets/{ticket['id']}", headers=auth_headers)
    assert deleted.status_code == 204

    restored = inventory_row(client, auth_headers, equipo["id"])
    assert restored["estado"] == "Oficina"
    assert restored["ubicacion"] == "Almacén 1"
    assert client.get("/api/v1/tickets", headers=auth_headers).json() == []


def test_asset_cannot_belong_to_two_active_tickets(client: TestClient, auth_headers: dict[str, str]) -> None:
    equipo = asset(client, auth_headers, "LAP-OCCUPIED-001", estado="Oficina")
    first = general_ticket(client, auth_headers, estado="Oficina")
    second = general_ticket(client, auth_headers, estado="Oficina")

    assert client.post(
        f"/api/v1/tickets/{first['id']}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": [equipo["id"]]},
    ).status_code == 200

    blocked = client.post(
        f"/api/v1/tickets/{second['id']}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": [equipo["id"]]},
    )
    assert blocked.status_code == 409
    assert "otro ticket activo" in blocked.json()["detail"]


def test_replacement_requires_exactly_one_replacement_per_affected(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    first = asset(client, auth_headers, "LAP-AFFECTED-001")
    second = asset(client, auth_headers, "LAP-AFFECTED-002")
    pedido = order(client, auth_headers, ["LAP-AFFECTED-001", "LAP-AFFECTED-002"])
    ticket = order_ticket(client, auth_headers, pedido)

    missing_flag = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": [first["id"]]},
    )
    assert missing_flag.status_code == 422

    missing_pair = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={
            "equiposAfectadosIds": [first["id"], second["id"]],
            "reparable": False,
            "equiposReemplazoIds": [],
        },
    )
    assert missing_pair.status_code == 422
    assert "reemplazo por cada equipo afectado" in missing_pair.json()["detail"]


def test_replacement_rejects_duplicates_self_and_unavailable(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    first = asset(client, auth_headers, "LAP-REPL-A-001")
    second = asset(client, auth_headers, "LAP-REPL-A-002")
    replacement = asset(client, auth_headers, "LAP-REPL-R-001")
    rented = asset(client, auth_headers, "LAP-REPL-R-002", estado="Alquiler", ubicacion="Alquilado")
    pedido = order(client, auth_headers, ["LAP-REPL-A-001", "LAP-REPL-A-002"])
    ticket = order_ticket(client, auth_headers, pedido)

    duplicated = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={
            "equiposAfectadosIds": [first["id"], second["id"]],
            "reparable": False,
            "equiposReemplazoIds": [replacement["id"], replacement["id"]],
        },
    )
    assert duplicated.status_code == 422
    assert "repetir" in duplicated.json()["detail"]

    same_as_affected = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={
            "equiposAfectadosIds": [first["id"], second["id"]],
            "reparable": False,
            "equiposReemplazoIds": [first["id"], replacement["id"]],
        },
    )
    assert same_as_affected.status_code == 422
    assert "propio reemplazo" in same_as_affected.json()["detail"]

    unavailable = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={
            "equiposAfectadosIds": [first["id"], second["id"]],
            "reparable": False,
            "equiposReemplazoIds": [replacement["id"], rented["id"]],
        },
    )
    assert unavailable.status_code == 409
    assert "no está disponible" in unavailable.json()["detail"]


def test_replacement_rollback_clears_links_and_restores_inventory(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    affected = asset(client, auth_headers, "LAP-ROLL-A-001")
    replacement = asset(client, auth_headers, "LAP-ROLL-R-001")
    pedido = order(client, auth_headers, ["LAP-ROLL-A-001"])
    ticket = order_ticket(client, auth_headers, pedido)

    diagnosed = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={
            "equiposAfectadosIds": [affected["id"]],
            "reparable": False,
            "equiposReemplazoIds": [replacement["id"]],
        },
    )
    assert diagnosed.status_code == 200, diagnosed.text
    assert diagnosed.json()["equiposReemplazoIds"] == [replacement["id"]]
    assert diagnosed.json()["ubicacionesReemplazoAnteriores"] == {replacement["id"]: "Almacén 1"}

    rolled_back = client.post(f"/api/v1/tickets/{ticket['id']}/volver", headers=auth_headers)
    assert rolled_back.status_code == 200, rolled_back.text
    body = rolled_back.json()
    assert body["flujo"] == "Pendiente"
    assert body["equiposIds"] == []
    assert body["estadosAnteriores"] == {}
    assert body["ubicacionesAnteriores"] == {}
    assert body["equiposReemplazoIds"] == []
    assert body["ubicacionesReemplazoAnteriores"] == {}

    restored_affected = inventory_row(client, auth_headers, affected["id"])
    assert restored_affected["estado"] == "Alquiler"
    restored_replacement = inventory_row(client, auth_headers, replacement["id"])
    assert restored_replacement["estado"] == "Almacén 1"
    assert restored_replacement["ubicacion"] == "Almacén 1"


def test_reserved_replacement_cannot_be_deleted_or_added_to_an_order(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    affected = asset(client, auth_headers, "LAP-LOCK-A-001")
    replacement = asset(client, auth_headers, "LAP-LOCK-R-001")
    pedido = order(client, auth_headers, ["LAP-LOCK-A-001"])
    ticket = order_ticket(client, auth_headers, pedido)
    assert client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={
            "equiposAfectadosIds": [affected["id"]],
            "reparable": False,
            "equiposReemplazoIds": [replacement["id"]],
        },
    ).status_code == 200

    deleted = client.delete(f"/api/v1/inventario/{replacement['id']}", headers=auth_headers)
    assert deleted.status_code == 409, deleted.text

    reassigned = client.post(
        "/api/v1/pedidos",
        headers=auth_headers,
        json={
            "fechaEmision": date.today().isoformat(),
            "direccionPartida": "Almacén",
            "direccionLlegada": (
                "Empresa: Otro Cliente · Dirección: Calle 2 · Distrito: Lima · "
                "Provincia: Lima · Departamento: Lima"
            ),
            "telefonoContacto": "988888888",
            "descripcionProductos": "LAP-LOCK-R-001",
            "cantidadProductos": 1,
            "unidadMedida": "UND",
            "motivoTraslado": "Alquiler",
            "observaciones": "",
            "skus": ["LAP-LOCK-R-001"],
        },
    )
    assert reassigned.status_code == 409, reassigned.text


def test_update_ticket_validates_support_user(client: TestClient, auth_headers: dict[str, str]) -> None:
    soporte = support_user(client, auth_headers)
    ticket = general_ticket(client, auth_headers, tecnicoId=soporte["id"])
    assert ticket["tecnico"] == "Soporte Tickets"

    invalid = client.patch(
        f"/api/v1/tickets/{ticket['id']}",
        headers=auth_headers,
        json={"tecnicoId": "soporte:no-existe"},
    )
    assert invalid.status_code == 422, invalid.text

    cleared = client.patch(
        f"/api/v1/tickets/{ticket['id']}",
        headers=auth_headers,
        json={"tecnicoId": ""},
    )
    assert cleared.status_code == 200, cleared.text
    assert cleared.json()["tecnico"] == ""
    assert cleared.json()["tecnicoTelefono"] == ""

    direct_status = client.patch(
        f"/api/v1/tickets/{ticket['id']}",
        headers=auth_headers,
        json={"estado": "Resuelto"},
    )
    assert direct_status.status_code == 422


def test_resolution_requires_evidence_and_real_solution_text(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    equipo = asset(client, auth_headers, "LAP-RESOLVE-001", estado="Oficina")
    ticket = general_ticket(client, auth_headers, estado="Oficina")
    assert client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={"equiposAfectadosIds": [equipo["id"]]},
    ).status_code == 200

    no_evidence = client.post(
        f"/api/v1/tickets/{ticket['id']}/resolver",
        headers=auth_headers,
        json={"evidencias": [], "descripcionSolucion": "Solución válida"},
    )
    assert no_evidence.status_code == 422

    blank = client.post(
        f"/api/v1/tickets/{ticket['id']}/resolver",
        headers=auth_headers,
        json={"evidencias": ["/uploads/tickets/evidencia.jpg"], "descripcionSolucion": "   "},
    )
    assert blank.status_code == 422

    too_short = client.post(
        f"/api/v1/tickets/{ticket['id']}/resolver",
        headers=auth_headers,
        json={"evidencias": ["/uploads/tickets/evidencia.jpg"], "descripcionSolucion": "ab"},
    )
    assert too_short.status_code == 422


def test_tickets_require_module_permission(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.post(
        "/api/v1/usuarios",
        headers=auth_headers,
        json={
            "nombre": "Usuario Limitado",
            "email": "limitado@adglobalperu.com",
            "usuario": "UsuarioLimitado",
            "password": "UsuarioLimitado2026",
            "rol": "Normal",
            "telefono": "+51 900 000 004",
            "activo": True,
            "modulos": ["dashboard"],
        },
    )
    assert response.status_code == 201, response.text
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "limitado@adglobalperu.com", "usuario": "UsuarioLimitado", "password": "UsuarioLimitado2026"},
    )
    assert login.status_code == 200, login.text
    limited = {"Authorization": f"Bearer {login.json()['accessToken']}"}

    assert client.get("/api/v1/tickets", headers=limited).status_code == 403
    assert client.post(
        "/api/v1/tickets",
        headers=limited,
        json={
            "cliente": "Inventario interno",
            "equipo": "Pendiente de selección",
            "numeroPedidoEstado": "Almacén 1",
            "tipoTicket": "general",
            "estadoEquipo": "Almacén 1",
            "prioridad": "Alta",
            "descripcion": "No enciende",
        },
    ).status_code == 403


def test_replacement_code_keeps_growing_past_999(client: TestClient, auth_headers: dict[str, str]) -> None:
    from backend.app.core.database import SessionLocal
    from backend.app.models import SupportTicket

    year = date.today().year
    with SessionLocal() as db:
        for code in (f"TKT-{year}-999", f"TKT-{year}-1000"):
            db.add(
                SupportTicket(
                    code=code,
                    equipment="Equipo histórico",
                    customer="Cliente histórico",
                    priority="Baja",
                    description="Ticket histórico",
                )
            )
        db.commit()

    created = general_ticket(client, auth_headers)
    assert created["codigo"] == f"TKT-{year}-1001"


def test_replacement_on_sale_order_does_not_mark_it_as_rented(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    affected = asset(client, auth_headers, "LAP-SALE-A-001")
    replacement = asset(client, auth_headers, "LAP-SALE-R-001")
    pedido = order(client, auth_headers, ["LAP-SALE-A-001"], motivo="Venta")
    ticket = order_ticket(client, auth_headers, pedido)

    diagnosed = client.post(
        f"/api/v1/tickets/{ticket['id']}/diagnostico",
        headers=auth_headers,
        json={
            "equiposAfectadosIds": [affected["id"]],
            "reparable": False,
            "equiposReemplazoIds": [replacement["id"]],
        },
    )
    assert diagnosed.status_code == 200, diagnosed.text

    resolved = client.post(
        f"/api/v1/tickets/{ticket['id']}/resolver",
        headers=auth_headers,
        json={
            "evidencias": ["/uploads/tickets/venta.jpg"],
            "descripcionSolucion": "Se entregó el equipo de reemplazo",
        },
    )
    assert resolved.status_code == 200, resolved.text

    delivered = inventory_row(client, auth_headers, replacement["id"])
    assert delivered["estado"] == "Venta"
    assert delivered["ubicacion"] == "Almacén 1"

