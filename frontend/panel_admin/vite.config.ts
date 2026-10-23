import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  // `--mode http` sirve el panel sin TLS: útil en escritorio, pero la cámara
  // del navegador solo funciona en HTTPS o localhost.
  const useHttps = mode !== 'http';
  const keyPath = fileURLToPath(new URL('../../.cert/server.key', import.meta.url));
  const certPath = fileURLToPath(new URL('../../.cert/server.crt', import.meta.url));
  const hasTrustedDevCertificate = useHttps && existsSync(keyPath) && existsSync(certPath);
  return {
    plugins: [react(), tailwindcss(), ...(mode === 'development' && !hasTrustedDevCertificate ? [basicSsl({
      name: 'AD GLOBAL desarrollo local',
      domains: ['localhost', '192.168.18.249'],
    })] : [])],
    base: process.env.VITE_BASE_PATH || './',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: 'dist',
      // Los bundles con hash van a /static; los medios de /public/assets se conservan aparte.
      assetsDir: 'static',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
    },
    server: {
      port: 3001,
      host: '0.0.0.0',
      https: !useHttps ? undefined : hasTrustedDevCertificate ? {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      } : {},
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  };
});
