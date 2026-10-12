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
│   │   │   ├── assets/           # Imágenes y videos organizados por categoría
│   │   │   └── .htaccess         # Config Apache/LiteSpeed para Webuzo
│   │   ├── src/
│   │   │   ├── components/       # Navbar, Hero, Servicios, FAQ, Cotización, Footer...
│   │   │   ├── config/site.ts    # Configuración y helpers (WhatsApp, assets)
│   │   │   ├── data/             # Contenido editable (servicios, FAQ, clientes, contacto)
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── panel_admin/              # (Fase 3) Dashboard administrativo
│       └── assets/
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
| `VITE_WHATSAPP_NUMBER` | WhatsApp de atención (solo dígitos) | `51957586421` |
| `VITE_CONTACT_PHONE_DISPLAY` | Teléfono mostrado en pantalla | `+51 957 586 421` |
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

- `src/data/servicios.ts` — servicios, fotos, videos, especificaciones.
- `src/data/contenido.ts` — métricas, FAQs, clientes, datos de contacto y redes.
- `src/config/site.ts` — teléfono/WhatsApp, correo y URL (o vía `.env`).
- `public/assets/` — imágenes y videos por categoría (`pantallas-led`, `laptops`, etc.).

## Roadmap

- **Fase 1 — Web pública** ✅ (este entregable)
- **Fase 2 — Backend (Python):** API pública (catálogo/clientes), modelos SQLAlchemy,
  autenticación JWT, conexión MySQL/PostgreSQL.
- **Fase 3 — Panel admin:** dashboard protegido, gestión de equipos y usuarios.
