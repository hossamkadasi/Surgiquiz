import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Multi-page production build for the core app, beta bank, student cloud, and adaptive revision.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        betaBank: resolve(__dirname, 'beta-bank.html'),
        student: resolve(__dirname, 'student.html'),
        revision: resolve(__dirname, 'revision.html'),
      },
    },
  },
});
