import { defineConfig } from 'vite';
import { resolve } from 'node:path';

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
