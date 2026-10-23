# AD GLOBAL — Plataforma Web

Sitio web corporativo de **AD GLOBAL** (alquiler y venta de tecnología para eventos y
empresas). El proyecto está dividido en una **web pública**, un **panel administrativo** y un
**backend** en Python.

> **Estado actual:** frontend público, panel administrativo y backend FastAPI/MySQL disponibles.

## Estructura del proyecto

```
mi-plataforma-web/
├── backend/                      # FastAPI + SQLAlchemy + Alembic
│   ├── app/api/                  # Autenticación, rutas públicas y administrativas
│   ├── app/core/                 # Configuración, conexión y seguridad
│   ├── alembic/                  # Migraciones MySQL
│   ├── scripts/seed.py           # Datos y administradores iniciales
│   └── tests/                    # Pruebas de API
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
│       │   ├── pages/            # Dashboard, Inventario, Pedidos, Clientes, Movimientos, Tickets
│       │   ├── data/             # contenido editable y datos semilla
│       │   ├── hooks/            # useAuth, useLocalStorage
│       │   ├── context/          # ToastContext
│       │   ├── config/           # site.ts, navigation.ts
│       │   └── types/            # tipos compartidos
│       └── package.json
│
├── requirements.txt              # Dependencias de Python
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

## Backend y MySQL

La API usa **FastAPI**, **SQLAlchemy 2**, **Alembic**, autenticación JWT y MySQL 8 con
`utf8mb4`. Las contraseñas se guardan únicamente como hashes PBKDF2-SHA256.

### Arranque local

Requiere Python 3.12+ y MySQL 8. Copia `.env.example` como `.env` en la raíz y ajusta
`SECRET_KEY`, `MYSQL_*` y `CORS_ORIGINS`. El ejemplo de la raíz y el de `backend/` usan
los mismos nombres de variables que lee `backend/app/core/config.py`.

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
alembic upgrade head
python -m backend.scripts.seed
uvicorn backend.app.main:app --reload --port 8000
pytest backend/tests -q
```

Configura el panel con `VITE_API_URL="http://localhost:8000/api/v1"`. Los grupos principales
de rutas son:

- `/api/v1/auth/*`: login, renovación y sesión actual.
- `/api/v1/public/*`: catálogo, imágenes y solicitudes de cotización.
- `/api/v1/inventario`, `/pedidos`, `/clientes`, `/tickets`: operación administrativa.
- `/api/v1/usuarios`, `/tecnicos`, `/movimientos`, `/servicios`, `/web-assets`: configuración,
  auditoría y gestión de contenido.

Todas las rutas administrativas requieren `Authorization: Bearer <token>` y validan los
módulos habilitados para la cuenta.

> El panel consume actualmente `auth`, `usuarios`, `web-assets`, `inventario`, `pedidos`,
> `clientes/derivados`, `movimientos` y `tickets`. Estas operaciones se persisten en MySQL.

### Notificación de tickets por WhatsApp

Al crear un ticket, el panel abre WhatsApp con el mensaje preparado para el usuario Soporte
asignado. El envío final lo confirma manualmente la persona que apertura el ticket. No se
requieren credenciales externas ni se realizan llamadas automáticas a la API de WhatsApp.

## Variables de entorno

Solo las variables con prefijo `VITE_` se exponen al navegador. Se configuran en `.env`
(desarrollo) o directamente en el build (producción):

| Variable | Descripción | Por defecto |
| --- | --- | --- |
| `VITE_SITE_URL` | URL pública final (canonical/SEO) | `https://adglobalperu.com` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp de atención (solo dígitos) | `51908838291` |
| `VITE_CONTACT_PHONE_DISPLAY` | Teléfono mostrado en pantalla | `+51 908 838 291` |
| `VITE_CONTACT_EMAIL` | Correo de atención al cliente | `atencionalcliente@adglobalperu.com` |
| `VITE_API_URL` | URL base versionada del backend | `http://localhost:8000/api/v1` |

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

### Contenido multimedia de la web

El módulo **Gestión web** del panel sube imágenes y videos al backend y permite:

- Ver archivos por sección: banner, servicios y preguntas frecuentes.
- Editar nombre, sección, servicio, orden y visibilidad.
- Eliminar el archivo del servidor y de la base de datos.

La web pública consume los archivos activos desde:

```text
GET /api/v1/public/web-assets
```

Configura `VITE_API_URL` en `frontend/web_publica/.env` con la URL del backend.
Formatos admitidos: JPG, PNG, WebP, AVIF, GIF, MP4, WebM, MOV, OGV, M4V y MPEG.
Límites: 10 MB para imágenes y 100 MB para videos.

### Importar las fotos existentes de la web pública

Las fotos y videos que estaban en `frontend/web_publica/src/assets/servicios/` se
migraron a Gestión web con:

```bash
python -m backend.scripts.import_web_media
```

El script copia los archivos a `backend/uploads/`, crea los registros en `web_assets`
para las secciones **hero**, **servicios** y **FAQ**, y es idempotente: se puede
ejecutar varias veces sin duplicar archivos. Los originales de `web_publica` se
conservan como respaldo local.

## Panel administrativo (`frontend/panel_admin`)

Frontend interno construido con el **mismo stack** de la web pública (React 19, Vite 8,
TypeScript y Tailwind CSS v4). Reproduce la maqueta de `Prototipo admin/` de forma modular.

Incluye:

- **Login corporativo** con autenticación JWT, refresh token y sesión persistente.
- **Dashboard** con distribución de flota y comparativo alquiler vs ventas.
- **Control de Inventario** (filtros, búsqueda, estados y categorías personalizadas).
- **Pedidos**, **Directorio de Clientes**, **Movimientos** y **Tickets de Soporte**.
- **Gestión web** (imágenes y videos de la web pública) y **Configuración** de usuarios.
- Modales de **apertura de ticket** y **pedido** con notificaciones (toast).

### Estado de conexión del panel

| Módulo | Persistencia |
| --- | --- |
| Login, usuarios, gestión web y tickets | API/MySQL |
| Inventario, pedidos, clientes y movimientos | API/MySQL |
| Cotizaciones web | API disponible; pantalla del panel pendiente |
| Presupuestos | No implementado |

Inventario, pedidos, clientes derivados, movimientos y tickets se cargan desde la API al
iniciar sesión. Los cambios de estado que producen pedidos y tickets se ejecutan en la misma
transacción de base de datos y quedan registrados en la auditoría del servidor.

Desarrollo local:

```bash
cd frontend/panel_admin
npm install
cp .env.example .env     # ajusta nombre, URL de la web pública y API
npm run dev              # https://localhost:3001
```

El servidor de desarrollo usa **HTTPS** porque la cámara del navegador (escáner QR de
Inventario) solo se habilita en contextos seguros. Vite redirige `/api` y `/uploads` al
backend en `http://127.0.0.1:8000`, por lo que no hay contenido mixto ni CORS. Para trabajar
sin cámara en el escritorio se puede usar `npm run dev:http`.

### Escáner QR desde una tablet en la red local

1. Genera el certificado local incluyendo la IP de la laptop:

   ```bash
   .venv\Scripts\python.exe -m backend.scripts.generate_dev_certificate --ip 192.168.18.249
   ```

   Crea `.cert/adglobal-dev-ca.crt` (autoridad local en DER, formato que acepta Android),
   `.cert/adglobal-dev-ca.pem` (misma autoridad en PEM) y `.cert/server.crt` + `server.key`
   (certificado del panel). Todos están excluidos de Git.

2. En la tablet descarga la autoridad local:

   ```text
   http://192.168.18.249:8000/dev-ca.crt
   ```

3. Instálala como certificado de confianza:
   - **Android:** Ajustes → Seguridad → Cifrado y credenciales → Instalar certificado →
     Certificado de CA. Chrome debe reiniciarse.
   - **iPad/iOS:** Ajustes → General → VPN y gestión de dispositivos → instalar el perfil;
     luego Ajustes → General → Información → Ajustes de confianza de certificados → activar
     confianza total.

4. Abre el panel en `https://192.168.18.249:3001`. Si la IP de la laptop cambia, vuelve a
   ejecutar el paso 1 y reinstala la CA.

> En producción el panel se sirve por HTTPS real, por lo que la cámara funciona sin pasos
> adicionales.

> La autenticación, usuarios, gestión web, inventario, pedidos, clientes, movimientos y
> tickets consumen la API y utilizan MySQL como fuente de verdad.

## Roadmap

- **Fase 1 — Web pública** ✅ (este entregable)
- **Fase 2 — Backend (Python):** ✅ API pública y administrativa, SQLAlchemy, Alembic,
  autenticación JWT y MySQL.
- **Fase 3 — Panel admin:** 🚧 frontend en `frontend/panel_admin`. Conectados a la API:
  login/refresh, usuarios, gestión web, inventario, pedidos, clientes, movimientos y tickets.
  Pendiente: construir las pantallas de cotizaciones y presupuestos.
