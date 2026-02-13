import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'WebGLViewer',
      fileName: (format) => `viewer.${format === 'es' ? 'js' : 'umd.js'}`
    },
    outDir: 'dist',
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
});
