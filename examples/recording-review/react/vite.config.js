import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const allowed = ['.', '../shared', '../../skins', '../../../preferences', '../../../node_modules'].map(path => fileURLToPath(new URL(path, import.meta.url)));
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { fs: { allow: allowed } },
});
