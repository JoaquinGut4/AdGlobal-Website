# AD GLOBAL — Plataforma Web

Sitio web corporativo de **AD GLOBAL** (alquiler y venta de tecnología para eventos y
empresas). El proyecto está dividido en una **web pública**, un **panel administrativo** y un
**backend** en Python.

> **Estado actual:** ✅ **Fase 1 completada — `frontend/web_publica`** lista para desplegar.
> El backend y el panel admin quedan planificados para fases posteriores.

## Estructura del proyecto

```
mi-plataforma-web/
├── backend/                      # (Fase 2) Lógica del servidor y BD - Python
│   ├── api/
│   │   ├── public/               # Endpoints públicos (catálogo, clientes)
│   │   └── admin/                # Endpoints protegidos (equipos, usuarios, dashboard)
│   ├── modelos/                  # Esquema de la BD (SQLAlchemy)
│   ├── core/                     # database.py, seguridad.py
│   └── main.py                   # Arranque del servidor
│
├── frontend/
│   ├── web_publica/              # ✅ Landing pública (React + Vite + TS + Tailwind v4)
│   │   ├── public/
│   │   │   └── .htaccess         # Config Apache/LiteSpeed para Webuzo
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   │   ├── hero/         # (manual) video y póster del Hero
│   │   │   │   └── servicios/    # ✨ Imágenes y videos por servicio (automático)
│   │   │   ├── components/       # Navbar, Hero, Servicios, FAQ, Cotización, Footer...
│   │   │   ├── config/site.ts    # Configuración y helpers (WhatsApp, medios)
│   │   │   ├── data/             # Contenido editable (servicios, FAQ, clientes, contacto)
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── panel_admin/              # 🚧 Panel administrativo (React + Vite + TS + Tailwind v4)
│       ├── public/               # favicon y .htaccess (SPA + noindex)
│       ├── src/
│       │   ├── components/       # layout (Sidebar/Topbar), ui, modales y login
│       │   ├── pages/            # Dashboard, Cotizaciones, Inventario, Presupuestos, Clientes, Tickets
│       │   ├── data/             # contenido editable y datos semilla
│       │   ├── hooks/            # useAuth, useLocalStorage
│       │   ├── context/          # ToastContext
│       │   ├── config/           # site.ts, navigation.ts
│       │   └── types/            # tipos compartidos
│       └── package.json
│
├── requirements.txt              # (Fase 2) Dependencias de Python
└── README.md
```

## Stack de la web pública

- **React 19** + **TypeScript**
- **Vite 8** (build ultrarrápido)
- **Tailwind CSS v4**
- **lucide-react** (iconos)
- Build 100 % estático → se sirve como archivos en cualquier hosting (Webuzo / Apache).

## Desarrollo local

```bash
cd frontend/web_publica
npm install
cp .env.example .env     # ajusta teléfono, correo, URL si es necesario
npm run dev              # http://localhost:3000
```

Otros comandos:

```bash
npm run lint      # Verificación de tipos (tsc --noEmit)
npm run build     # Compila a ./dist (ejecuta lint + build)
npm run preview   # Sirve el build de producción localmente
```

## Variables de entorno

Solo las variables con prefijo `VITE_` se exponen al navegador. Se configuran en `.env`
(desarrollo) o directamente en el build (producción):

| Variable | Descripción | Por defecto |
| --- | --- | --- |
| `VITE_SITE_URL` | URL pública final (canonical/SEO) | `https://adglobalperu.com` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp de atención (solo dígitos) | `51908838291` |
| `VITE_CONTACT_PHONE_DISPLAY` | Teléfono mostrado en pantalla | `+51 908 838 291` |
| `VITE_CONTACT_EMAIL` | Correo de atención al cliente | `atencionalcliente@adglobalperu.com` |
| `VITE_API_URL` | (Fase 2) URL base del backend | vacío |

> El formulario de cotización **valida los datos y abre WhatsApp** con el mensaje ya preparado
> hacia el número configurado en `VITE_WHATSAPP_NUMBER`.

## Despliegue en Webuzo (hosting)

El build genera archivos estáticos, por lo que **no se necesita Node.js en el servidor**.

### 1. Generar el build

```bash
cd frontend/web_publica
npm install
npm run build
```

Esto crea la carpeta `frontend/web_publica/dist/` con:

```
dist/
├── index.html
├── favicon.svg
├── .htaccess          # compresión, caché y fallback SPA
├── assets/            # imágenes y videos
└── static/            # JS y CSS con hash
```

### 2. Subir los archivos

Usa el **Administrador de Archivos** o **FTP/ SFTP** de Webuzo:

1. Abre el dominio correspondiente en Webuzo.
2. Elimina los archivos de ejemplo (`index.html`, `default.php`, etc.) dentro de
   `public_html/`.
3. Sube **el contenido** de `dist/` (no la carpeta `dist` en sí) a `public_html/`.
   - Importante: incluye el archivo oculto `.htaccess`.

Ruta típica: `/home/usuario/public_html/` (o `public_html/tudominio.com/` si es un dominio
adicional).

### 3. Configurar el dominio

- **DNS:** apunta el dominio (registro `A`) a la IP del servidor Webuzo.
- **SSL:** en Webuzo → **SSL** → emite un certificado **Let's Encrypt** y activa la
  redirección de HTTP a HTTPS.
- Si se despliega en un **subdirectorio**, compila con `VITE_BASE_PATH="/subcarpeta/"` y
  ajusta `RewriteBase` en `.htaccess`.

### 4. Actualizaciones

Cada nueva versión: ejecuta `npm run build` y re-sube el contenido de `dist/` a
`public_html/` (sobrescribiendo). El `.htaccess` ya deja el `index.html` sin caché y cachea
los recursos con hash durante 1 año.

## Contenido editable

Sin tocar los componentes, el contenido se actualiza en:

- `src/data/servicios.ts` — textos, especificaciones y características de cada servicio.
- `src/data/contenido.ts` — métricas, FAQs, clientes, datos de contacto y redes.
- `src/config/site.ts` — teléfono/WhatsApp, correo y URL (o vía `.env`).

### Imágenes y videos de "Nuestros Servicios" (automático)

Los medios se leen **solos** desde `src/assets/servicios/<carpeta>/`; no hay que
editar código. Deja los archivos en su carpeta, guarda y aparecen en la web.

| Servicio | Carpeta(s) |
| --- | --- |
| Pantallas LED y Televisores | `pantallas-led`, `televisores` |
| Laptops y Computadores | `laptops`, `computadoras` |
| Equipos Audiovisuales | `audiovisuales` |
| Tablets | `tablets` |
| Impresoras Multifuncionales | `impresoras` |
| Desarrollo Web | `desarrollo-web` |

Reglas:

- **Fotos:** `jpg`, `jpeg`, `png`, `webp`, `avif`, `gif`, `svg`.
  **Videos:** `mp4`, `webm`, `mov`, `ogv`, `m4v`.
- **Portada de la tarjeta:** el archivo que empiece por `portada.` o `cover.`
  (ej. `portada.webp`); si no existe, se usa la primera imagen.
- **Orden:** alfabético natural. Usa prefijos `01-`, `02-` para forzar un orden.
- **Texto de cada foto/video:** se deriva del nombre del archivo
  (`muro-led-auditorio.jpg` → "Muro led auditorio"). Para sobrescribirlo, crea un
  `_captions.json` dentro de la carpeta:

  ```json
  { "1.jpg": "Muro LED en auditorio corporativo" }
  ```

- Añadir/eliminar archivos se refleja al instante en `npm run dev` y en cada
  `npm run build`. La lógica está en `src/data/media.ts`.

> El video y el póster del **Hero** sí son manuales: `src/assets/hero/` y se
> referencian en `src/data/contenido.ts`.

## Panel administrativo (`frontend/panel_admin`)

Frontend interno construido con el **mismo stack** de la web pública (React 19, Vite 8,
TypeScript y Tailwind CSS v4). Reproduce la maqueta de `Prototipo admin/` de forma modular.

Incluye:

- **Login corporativo** con validación, sesión persistente y credenciales demo.
- **Dashboard** con distribución de flota, comparativo alquiler vs ventas y estado de almacén.
- **Cotizaciones Web** (bandeja completa, cambio de estado y respuesta por WhatsApp).
- **Control de Inventario** (filtros, búsqueda, distribución por alquiler/oficina/taller).
- **Presupuestos & Proformas**, **Directorio de Clientes** y **Tickets de Soporte**.
- Modales de **apertura de ticket** y **cotización** con notificaciones (toast).

Desarrollo local:

```bash
cd frontend/panel_admin
npm install
cp .env.example .env     # ajusta nombre, URL de la web pública y API
npm run dev              # http://localhost:3001
```

> Los datos de ejemplo se guardan en `localStorage` mientras el backend (Fase 2) no esté
> conectado. La capa de datos está aislada en `src/data/` y `src/hooks/`, lista para
> reemplazarse por llamadas a la API (`VITE_API_URL`).

## Roadmap

- **Fase 1 — Web pública** ✅ (este entregable)
- **Fase 2 — Backend (Python):** API pública (catálogo/clientes), modelos SQLAlchemy,
  autenticación JWT, conexión MySQL/PostgreSQL.
- **Fase 3 — Panel admin:** 🚧 frontend en `frontend/panel_admin` (login, dashboard,
  cotizaciones, inventario, presupuestos, clientes y tickets). Pendiente: conexión con la API.
