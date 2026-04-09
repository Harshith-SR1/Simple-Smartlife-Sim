import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@react-three')) return 'r3f';
          if (id.includes('node_modules/@react-three/drei')) return 'r3f';
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/react')) return 'react-vendor';
        },
      },
    },
  },
});
