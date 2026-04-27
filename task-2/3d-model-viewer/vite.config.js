import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      output: {
        // Code-split Three.js into its own chunk so it can be cached separately
        manualChunks: (id) => {
          if (id.includes('node_modules/three')) return 'three';
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['three'],
  },
});
