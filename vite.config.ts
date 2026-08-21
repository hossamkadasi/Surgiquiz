import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Multi-page production build for the core app, question banks, student cloud, adaptive revision, exam simulator, and editorial review.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        betaBank: resolve(__dirname, 'beta-bank.html'),
        verifiedBank: resolve(__dirname, 'verified-bank.html'),
        student: resolve(__dirname, 'student.html'),
        revision: resolve(__dirname, 'revision.html'),
        exam: resolve(__dirname, 'exam.html'),
        reviewer: resolve(__dirname, 'reviewer.html'),
      },
    },
  },
});
