import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(import.meta.dirname),
  server: {
    fs: {
      allow: [resolve(import.meta.dirname, '..')],
    },
  },
  build: {
    outDir: resolve(import.meta.dirname, '../demo-dist'),
    emptyOutDir: true,
  },
});
