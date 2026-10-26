import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/pak-geodata/',
  resolve: {
    alias: {
      'pak-geodata': resolve(__dirname, '../../packages/npm/src/index.ts')
    }
  }
});
