import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || (process.env.GITHUB_PAGES ? '/pak-geodata/' : '/'),
  server: {
    host: '0.0.0.0',
    port: 5185,
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5185,
    allowedHosts: true
  },
  resolve: {
    alias: {
      'pak-geodata': resolve(__dirname, '../../packages/npm/src/index.ts')
    }
  }
});

