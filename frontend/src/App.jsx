import { NavLink, Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="app-shell">
      <div className="fondo-decorativo" aria-hidden="true" />

      <header className="cabecera-app">
        <nav className="tabs-vistas" aria-label="Seleccion de vista">
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'tab activo' : 'tab')}>
            Administrador
          </NavLink>
          <NavLink to="/bodega" className={({ isActive }) => (isActive ? 'tab activo' : 'tab')}>
            Bodega
          </NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
