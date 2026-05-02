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
        target: 'http://product-service:8081',
        changeOrigin: true,
      },
      '/api/inventario': {
        target: 'http://inventory-service:8082',
        changeOrigin: true,
      },
      '/api/escaneo': {
        target: 'http://scanner-service:8084',
        changeOrigin: true,
      },
      '/api/clientes': {
        target: 'http://customer-service:8085',
        changeOrigin: true,
      },
      '/api/pedidos': {
        target: 'http://purchase-service:8086',
        changeOrigin: true,
      },
    },
  },
})
