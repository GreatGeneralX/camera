import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages project sites are served below /<repository>/.
  base: process.env.NODE_ENV === 'production' ? '/camera/' : '/',
});
