import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Toutes les requêtes qui commencent par /api sont redirigées vers le backend 8080
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true, // Nécessaire pour les hôtes virtuels
        secure: false, // À utiliser si votre backend n'est pas en HTTPS
      },
    },
  },
})
