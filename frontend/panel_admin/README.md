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
| Movimientos | Historial de acciones locales de Pedidos, Inventario y Tickets. |
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
├── data/            # datos semilla de pedidos, inventario y movimientos
├── hooks/           # useAuth, useLocalStorage
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

Consumen la API/MySQL: autenticación (con refresh token), usuarios, gestión web y tickets.
Los tickets se cargan con `GET /tickets` al iniciar sesión y se combinan con los vínculos
locales de inventario (`equiposIds` y `estadosAnteriores`).

Siguen en `localStorage` (etiqueta **“Solo este navegador”**): inventario, pedidos, clientes
derivados y movimientos. Esto significa que no se comparten entre equipos ni sobreviven al
borrado de datos del navegador. Como la clave es del navegador y no de la cuenta, dos usuarios
que usen el mismo equipo verán la misma información operativa. Las cuentas iniciales se crean
mediante el *seed* seguro del backend.

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

Los estados `Alquiler`, `Taller` y `Venta` son fijos: siempre están disponibles y no se
pueden editar ni eliminar. El estado anterior `Vendido` se convierte automáticamente a
`Venta` en los datos locales existentes.

El ticket tiene dos pestañas: **Por pedido** (se elige un pedido, se leen su cliente y
contacto y solo se pueden seleccionar sus SKU) y **General / Inventario** (se elige un
estado y solo se muestran equipos de ese estado). Al crearlo, sus equipos pasan a `Taller`.
Al completarlo o eliminarlo regresan al estado anterior, siempre que nadie los haya
cambiado manualmente. Un equipo no puede pertenecer a dos tickets activos. Si un pedido
se finaliza mientras su equipo está en Taller, el equipo volverá al estado anterior al
pedido cuando se complete el ticket. El mensaje de WhatsApp sigue siendo manual.

## Despliegue (Webuzo / Apache)

El build genera archivos estáticos en `dist/`, con `public/.htaccess` incluido (fallback SPA,
compresión, caché y cabecera `noindex`).

1. `npm run build`
2. Sube el **contenido** de `dist/` (incluido el `.htaccess` oculto) a `public_html/`
   del subdominio o carpeta destino (por ejemplo `admin.tudominio.com`).
3. Activa SSL (Let's Encrypt) y la redirección a HTTPS.

Para desplegar en un subdirectorio, compila con `VITE_BASE_PATH="/admin/"` y ajusta
`RewriteBase` en `.htaccess`.
