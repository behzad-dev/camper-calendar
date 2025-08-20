import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const BASE = process.env.VITE_BASE || '/';

export default defineConfig({
  plugins: [vue()],
  base: BASE,
  resolve: { alias: [{ find: '@', replacement: '/src' }] },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    globals: true,         
  },
});
