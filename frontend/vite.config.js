import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.trycloudflare.com', '.loca.lt', 'localhost', '127.0.0.1', '192.168.1.85'],
    proxy: {
      '/api/productos': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
      '/api/inventario': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
      },
      '/api/escaneo': {
        target: 'http://127.0.0.1:8084',
        changeOrigin: true,
      },
      '/api/clientes': {
        target: 'http://127.0.0.1:8085',
        changeOrigin: true,
      },
      '/api/pedidos': {
        target: 'http://127.0.0.1:8086',
        changeOrigin: true,
      },
    },
  },
})
