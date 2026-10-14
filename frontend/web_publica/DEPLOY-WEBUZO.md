# Despliegue en Webuzo — Web pública AD GLOBAL

Sitio **estático** (React + Vite). No necesita Node, PHP, base de datos ni procesos en el
servidor: solo se sirven archivos.

---

## 1. Qué se sube

El contenido de `dist/` ( **no** el código fuente):

```
public_html/
├── .htaccess        ← configuración Apache/LiteSpeed (oculto)
├── favicon.svg
├── index.html
└── static/          ← JS, CSS, fuentes, imágenes y videos (nombres con hash)
```

Ya viene empaquetado en **`adglobal-web-publica.zip`** (~9.4 MB), listo para extraer.

---

## 2. Generar / actualizar el paquete

```bash
cd frontend/web_publica
npm ci            # o: npm install
npm run build     # tsc --noEmit && vite build  →  dist/

# Regenerar el ZIP (separadores "/" compatibles con Linux):
tar -a -c -f adglobal-web-publica.zip -C dist .
```

**No requiere variables de entorno**: los valores por defecto (WhatsApp, teléfono, correo)
están en `src/config/site.ts`. Si quieres cambiarlos, crea un `.env` (copia de `.env.example`)
**antes** de `npm run build`.

---

## 3. Subir a Webuzo

1. Panel de Webuzo → **File Manager** (o FTP/SFTP).
2. Entra al directorio del dominio:
   - dominio principal → `public_html/`
   - subcarpeta → `public_html/<subcarpeta>/`
3. Borra el contenido de ejemplo (`index.html`, `default.html`, etc.) si existe.
4. Sube `adglobal-web-publica.zip` y pulsa **Extract** (o descomprime en local y sube la carpeta).
5. Activa **"mostrar archivos ocultos"** y confirma que `.htaccess` está presente.

---

## 4. Casos especiales

### Dominio raíz (recomendado)
Nada que tocar. El build usa rutas **relativas** (`./static/...`) y el `.htaccess` ya está
configurado para la raíz.

### Subcarpeta (ej. `https://tudominio.com/web/`)
Edita `.htaccess` y cambia:

| Antes | Después |
|---|---|
| `RewriteBase /` | `RewriteBase /web/` |
| `ErrorDocument 404 /index.html` | `ErrorDocument 404 /web/index.html` |

Opcional: build con `VITE_BASE_PATH=/web/ npm run build`.

### HTTPS / redirección
Webuzo suele gestionar el SSL desde el panel (**SSL → Let's Encrypt**). Si prefieres forzarlo
por `.htaccess`, añade al inicio del archivo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</IfModule>
```

---

## 5. Checklist tras subir

- [ ] `https://tudominio.com/` carga el hero con foto.
- [ ] Los 8 servicios abren y cierran (acordeón).
- [ ] El collage de Preguntas frecuentes rota.
- [ ] El marquee de logos de clientes se desplaza.
- [ ] El botón flotante de WhatsApp abre el chat con el número correcto.
- [ ] El formulario de cotización abre WhatsApp con el mensaje armado.
- [ ] En el pie, "Privacidad" y "Términos" abren su modal.
- [ ] `https://tudominio.com/ruta-inexistente` sirve el `index.html` (fallback SPA), no un 404 del servidor.
- [ ] DevTools → Network: JS/CSS con `cache-control: public, max-age=31536000, immutable`.

---

## 6. Actualizar el sitio

1. `npm run build` → genera `dist/` con **nuevos hashes** en los nombres de archivo.
2. Sube de nuevo `index.html` + `static/` + `.htaccess` + `favicon.svg` (reemplaza todo).

Como los nombres llevan hash, no hay problema de caché: el `index.html` se sirve sin caché
(`max-age=0, must-revalidate`) y los recursos cambian de nombre en cada versión.

---

## 7. Notas

- El `<link rel="canonical">` de `index.html` apunta a `https://adglobalperu.com/`. Si publicas
  en otro dominio, actualízalo.
- Peso del paquete: ~9.4 MB (incluye el video `Impresora 3.mp4` de ~2.9 MB).
- El `.htaccess` incluye: gzip, caché de estáticos, cabeceras de seguridad básicas
  (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`) y el fallback SPA.
