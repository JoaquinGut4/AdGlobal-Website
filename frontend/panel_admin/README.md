# AD GLOBAL — Panel Administrativo

Frontend interno del sistema AD GLOBAL. Construido con el **mismo stack** que la web
pública: **React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + lucide-react**.

Reproduce, de forma modular, la maqueta definida en `Prototipo admin/` (login + dashboard
administrativo) y sirve como base del modelo final del apartado admin.

## Módulos del menú principal

| Vista | Descripción |
| --- | --- |
| Login | Acceso corporativo contra la API, sesión JWT, refresh token y opción "recordarme". |
| Dashboard | Distribución de flota, comparativo alquiler vs ventas y clientes activos. |
| Inventario | Equipos, características, estados y categorías (filtros y detalle expandible). |
| Pedidos | Registro y seguimiento de pedidos; guía de remisión y control de estados. |
| Clientes | Directorio derivado de los pedidos (oculto en el menú, accesible desde el Dashboard). |
| Movimientos | Auditoría centralizada de Pedidos, Inventario y Tickets. |
| Tickets de soporte | Incidencias técnicas y ciclo de vida (abierto → diagnóstico → reparación → resuelto). |
| Gestión web | Imágenes y videos de la web pública (subida, orden, visibilidad y borrado). |
| Configuración | Usuarios, roles, módulos y teléfonos de contacto. |

Acciones globales (barra superior): **Aperturar Ticket** y **Aperturar Pedido**, con sus
modales y notificaciones toast.

> Cotizaciones web y Presupuestos aún no tienen pantalla en el panel; la API de
> `/cotizaciones` está disponible para una siguiente fase.

## Estructura

```
src/
├── components/
│   ├── layout/      # AdminLayout, Sidebar, Topbar
│   ├── ui/          # Modal, ProgressBar, LocalDataNotice
│   ├── dashboard/   # FleetDistribution, FlotaChart, ClientesChart
│   ├── login/       # LoginScreen
│   ├── modals/      # TicketModal, OrderModal, InventoryModal, GuideModal
│   └── AdGlobalLogo.tsx
├── pages/           # Dashboard, Inventario, Pedidos, Clientes, Movimientos,
│                    # Tickets, Gestión web, Configuración
├── data/            # catálogos visuales compartidos
├── hooks/           # useAuth
├── context/         # ToastContext
├── config/          # site.ts (env), navigation.ts (menú)
├── lib/             # API, sincronización de inventario, tickets y utilidades
├── types/           # tipos compartidos
├── App.tsx
└── main.tsx
```

## Desarrollo

```bash
npm install
cp .env.example .env     # ajusta los valores (opcional en local)
npm run dev              # http://localhost:3001
```

Otros comandos:

```bash
npm run lint      # Verificación de tipos (tsc --noEmit)
npm run build     # Compila a ./dist (ejecuta lint + build)
npm run preview   # Sirve el build de producción localmente
```

## Variables de entorno

Solo las variables con prefijo `VITE_` se exponen al navegador:

| Variable | Descripción | Por defecto |
| --- | --- | --- |
| `VITE_ADMIN_NAME` | Nombre mostrado en el login | `AD GLOBAL PERÚ` |
| `VITE_PUBLIC_SITE_URL` | URL de la web pública (botón "Volver a la web") | `https://adglobalperu.com` |
| `VITE_API_URL` | URL base versionada del backend | `http://localhost:8000/api/v1` |

## Datos y persistencia

Consumen la API/MySQL: autenticación (con refresh token), usuarios, gestión web, inventario,
pedidos, clientes derivados, movimientos y tickets. MySQL es la fuente de verdad y los cambios
se comparten entre equipos. Las asignaciones de inventario producidas por pedidos y tickets se
realizan transaccionalmente en el backend. Las cuentas iniciales se crean mediante el *seed*
seguro del backend.

### Ciclo de vida de pedidos e inventario

Al crear un pedido de alquiler o venta, se guardan los estados originales de los equipos
identificados por SKU y se cambian a `Alquiler` o `Venta`, respectivamente. **Finalizar**
un alquiler devuelve los equipos a sus estados anteriores; finalizar una venta la mantiene
como `Venta`. **Eliminar** un pedido activo de alquiler o venta restaura esos estados;
eliminar una venta finalizada también los restaura. Si un equipo fue cambiado manualmente
después de crear el pedido, su estado no se sobrescribe. Los pedidos anteriores a esta
función no tienen estados originales guardados y no se restauran automáticamente.

El formulario no pide una cantidad manual: cada SKU distinto encontrado en el inventario
cuenta como una unidad. Los pedidos existentes conservan su cantidad histórica.

Los estados operativos `Alquiler`, `Venta`, `Diagnóstico`, `Reparación`,
`Reemplazo requerido`, `Reservado para reemplazo` y `Baja` están protegidos y no se pueden
editar ni eliminar. El estado anterior `Vendido` se normaliza como `Venta`.

El ticket tiene dos pestañas: **Por pedido** (se elige un pedido activo y se leen cliente,
contacto y dirección) y **General / Inventario** (se elige el estado de origen). Los equipos
afectados se seleccionan posteriormente dentro de **Gestionar flujo**. Al guardar los cambios,
los equipos pasan a `Diagnóstico`. El botón **Volver** revierte el diagnóstico y restaura en
MySQL todos los estados anteriores. En tickets por pedido se decide si el equipo es reparable: el flujo de
reparación lo mueve a `Reparación`; el flujo de reemplazo mueve el afectado a
`Reemplazo requerido` y reserva un sustituto. Al resolver una reparación se restaura el
estado anterior. Al resolver un reemplazo, el afectado pasa a `Baja`, el sustituto ocupa su
estado y se actualiza el SKU del pedido activo. Ambos flujos requieren evidencia y descripción
de la solución. El mensaje de WhatsApp sigue siendo manual.

## Despliegue (Webuzo / Apache)

El build genera archivos estáticos en `dist/`, con `public/.htaccess` incluido (fallback SPA,
compresión, caché y cabecera `noindex`).

1. `npm run build`
2. Sube el **contenido** de `dist/` (incluido el `.htaccess` oculto) a `public_html/`
   del subdominio o carpeta destino (por ejemplo `admin.tudominio.com`).
3. Activa SSL (Let's Encrypt) y la redirección a HTTPS.

Para desplegar en el subdirectorio acordado, compila con
`VITE_BASE_PATH="/panel_admin/"`; el `.htaccess` ya usa ese `RewriteBase`.
