// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/__tests__/**/*.{test,spec}.{js,ts,tsx}'],
    setupFiles: ['./__tests__/setup.ts'],
    fakeTimers: {
      toFake: ['Date', 'setTimeout', 'clearTimeout'],
    },
  },
});
