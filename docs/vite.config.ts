import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^krts\.ui\/agent$/, replacement: fileURLToPath(new URL('../src/agent/index.ts', import.meta.url)) },
      { find: /^krts\.ui$/, replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
    ],
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
