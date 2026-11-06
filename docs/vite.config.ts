import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { 'krts.ui': fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
