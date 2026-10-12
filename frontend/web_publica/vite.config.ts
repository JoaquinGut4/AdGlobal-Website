import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
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
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
