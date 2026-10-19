import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const allowed = ['.', '../shared', '../../skins', '../../../preferences', '../../../node_modules'].map(path => fileURLToPath(new URL(path, import.meta.url)));
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: { fs: { allow: allowed } },
});
