# AD GLOBAL — Panel Administrativo

Frontend interno del sistema AD GLOBAL. Construido con el **mismo stack** que la web
pública: **React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + lucide-react**.

Reproduce, de forma modular, la maqueta definida en `Prototipo admin/` (login + dashboard
administrativo) y sirve como base del modelo final del apartado admin.

## Módulos del menú principal

| Vista | Descripción |
| --- | --- |
| Login | Acceso corporativo contra la API, sesión JWT y opción "recordarme". |
| Dashboard | Estadísticas y actividad en tiempo real: distribución de flota, comparativo alquiler vs ventas (semana/mes/año) y estado de almacén. |
| Inventario | Equipos, características, cantidades, estados y disponibilidad (filtros y detalle expandible). |
| Alquileres | Reservas, contratos, periodos y devoluciones. *(estructura en preparación)* |
| Ventas | Solicitudes, pedidos y ventas de equipos tecnológicos. *(estructura en preparación)* |
| Cotizaciones | Bandeja de propuestas comerciales, cambio de estado y respuesta por WhatsApp. |
| Pedidos | Registro y seguimiento de pedidos de equipos hasta su entrega. *(estructura en preparación)* |
| Clientes | Registro de clientes/empresas, contacto e historial comercial. |
| Movimientos | Entradas, salidas, traslados y cambios de ubicación. *(estructura en preparación)* |
| Tickets de soporte | Incidencias técnicas y ciclo de vida (abierto → diagnóstico → reparación → resuelto). |
| Gestión web | Productos, imágenes, servicios y contenido de la web pública. *(estructura en preparación)* |
| Reportes | Resultados operativos y comerciales. *(estructura en preparación)* |
| Configuración | Usuarios, roles, permisos y parámetros generales. *(estructura en preparación)* |

> Los módulos marcados "en preparación" muestran su propósito y capacidades planificadas con el
> componente `components/ui/ModulePlaceholder.tsx`, listos para desarrollar su operación completa.

Acciones globales (barra superior): **Aperturar Ticket** y **Aperturar Cotización**, con sus
modales y notificaciones toast.

## Estructura

```
src/
├── components/
│   ├── layout/      # AdminLayout, Sidebar, Topbar
│   ├── ui/          # Modal, ProgressBar / StackedDistribution
│   ├── dashboard/   # FleetDistribution, FlotaChart, RecentQuotes, WarehouseStatus
│   ├── login/       # LoginScreen
│   ├── modals/      # TicketModal, QuoteModal
│   └── AdGlobalLogo.tsx
├── pages/           # Dashboard, Inventario, Alquileres, Ventas, Cotizaciones, Pedidos,
│                    # Clientes, Movimientos, Tickets, Gestión web, Reportes, Configuración
├── data/            # contenido editable y datos semilla (servicios, inventario, tickets...)
├── hooks/           # useAuth, useLocalStorage
├── context/         # ToastContext
├── config/          # site.ts (env), navigation.ts (menú)
├── lib/             # utilidades (WhatsApp, formato, marcas de tiempo)
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
| `VITE_AUTH_MAX_ATTEMPTS` | Política máxima de intentos | `5` |

## Datos y persistencia

La autenticación y la administración de usuarios consumen el backend. Algunos módulos
operativos aún mantienen estado local mientras se completa su conexión visual con los endpoints.
Las cuentas iniciales se crean mediante el *seed* seguro del backend.

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
