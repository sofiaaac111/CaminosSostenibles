import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AdministradorPage } from './pages/AdministradorPage'
import { BodegaPage } from './pages/BodegaPage'
import {
  ClienteAuthPage,
  ClienteCarritoPage,
  ClienteCatalogoPage,
  ClienteCheckoutPage,
  ClienteCompraExitosaPage,
  ClientePage,
  ClientePedidosPage,
  ClientePerfilPage,
} from './pages/ClientePage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/admin" replace />} />
          <Route path="admin" element={<AdministradorPage />} />
          <Route path="bodega" element={<BodegaPage />} />
        </Route>

        <Route path="/cliente" element={<ClientePage />}>
          <Route path="auth" element={<ClienteAuthPage />} />
          <Route path="catalogo" element={<ClienteCatalogoPage />} />
          <Route path="carrito" element={<ClienteCarritoPage />} />
          <Route path="checkout" element={<ClienteCheckoutPage />} />
          <Route path="compra-exitosa" element={<ClienteCompraExitosaPage />} />
          <Route path="pedidos" element={<ClientePedidosPage />} />
          <Route path="cuenta" element={<ClientePerfilPage />} />
          <Route index element={<Navigate to="auth" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
