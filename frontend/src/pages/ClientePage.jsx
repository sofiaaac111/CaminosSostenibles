import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { listarExistencias, listarProductos } from '../api/administradorApi'

gsap.registerPlugin(ScrambleTextPlugin)
import {
  actualizarCliente,
  checkoutPedido,
  listarPedidosCliente,
  loginCliente,
  obtenerCliente,
  registrarCliente,
} from '../api/clienteApi'
import { Notificacion } from '../components/comunes/Notificacion'

const SESION_KEY = 'erp_cliente_sesion_real'
const CARRITO_KEY_PREFIX = 'erp_cliente_carrito_'
const ULTIMA_COMPRA_KEY_PREFIX = 'erp_cliente_ultima_compra_'

const PERFIL_VACIO = {
  idCliente: null,
  nombre: '',
  email: '',
  ciudad: '',
  direccion: '',
  telefono: '',
}

export function ClientePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [productos, setProductos] = useState([])
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [perfil, setPerfil] = useState(PERFIL_VACIO)
  const [autenticado, setAutenticado] = useState(false)
  const [credenciales, setCredenciales] = useState({ email: '', password: '' })
  const [registro, setRegistro] = useState({
    nombre: '',
    email: '',
    password: '',
    ciudad: '',
    direccion: '',
    telefono: '',
  })
  const [carrito, setCarrito] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [pago, setPago] = useState({
    titular: '',
    numero: '',
    vencimiento: '',
    cvv: '',
  })
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('info')
  const [cargando, setCargando] = useState(false)
  const [inicializado, setInicializado] = useState(false)
  const [ultimaCompra, setUltimaCompra] = useState(null)
  const [miniCarritoAbierto, setMiniCarritoAbierto] = useState(false)
  const [perfilDropdownAbierto, setPerfilDropdownAbierto] = useState(false)
  const [vistaActual, setVistaActual] = useState('catalogo') // 'catalogo' o 'compra'
  const miniCarritoRef = useRef(null)
  const perfilDropdownRef = useRef(null)

  const totalCarrito = useMemo(
    () => carrito.reduce((acum, item) => acum + item.precioProducto * item.cantidad, 0),
    [carrito]
  )

  const cantidadItemsCarrito = useMemo(
    () => carrito.reduce((acum, item) => acum + Number(item.cantidad || 0), 0),
    [carrito]
  )

  const productosFiltrados = useMemo(() => {
    const termino = textoBusqueda.trim().toLowerCase()
    if (!termino) return productos
    return productos.filter((producto) =>
      [producto.nombreProducto, producto.categoriaProducto, producto.codigoProducto]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(termino))
    )
  }, [productos, textoBusqueda])

  async function iniciarSesionPersistida() {
    const guardado = localStorage.getItem(SESION_KEY)
    if (!guardado) return

    try {
      const sesion = JSON.parse(guardado)
      if (!sesion?.idCliente) return
      const cliente = await obtenerCliente(sesion.idCliente)
      setPerfil(cliente)
      setAutenticado(true)
      await recargarPedidos(cliente.idCliente)
    } catch (_) {
      localStorage.removeItem(SESION_KEY)
    }
  }

  async function recargarCatalogo() {
    setCargando(true)
    try {
      const [catalogo, existencias] = await Promise.all([listarProductos(), listarExistencias()])

      const existenciasPorProducto = new Map(
        existencias.map((item) => [item.idProducto, Number(item.cantidadTotal)])
      )

      const productosConEstado = catalogo.map((producto) => {
        const cantidadDisponible = existenciasPorProducto.get(producto.idProducto) || 0
        const agotado = cantidadDisponible <= 0 || producto.activo === false
        return {
          ...producto,
          cantidadDisponible,
          agotado,
        }
      })

      setProductos(productosConEstado)
    } catch (error) {
      setMensaje(`No se pudo cargar el catalogo: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setCargando(false)
    }
  }

  async function recargarPedidos(idCliente) {
    try {
      const data = await listarPedidosCliente(idCliente)
      setPedidos(data)
    } catch (error) {
      setMensaje(`No se pudo cargar historial de pedidos: ${error.message}`)
      setTipoMensaje('error')
    }
  }

  function mostrarError(texto) {
    setMensaje(texto)
    setTipoMensaje('error')
  }

  async function manejarRegistro(evento) {
    evento.preventDefault()
    try {
      const cliente = await registrarCliente(registro)
      localStorage.setItem(SESION_KEY, JSON.stringify({ idCliente: cliente.idCliente }))
      setPerfil(cliente)
      setAutenticado(true)
      setRegistro({ nombre: '', email: '', password: '', ciudad: '', direccion: '', telefono: '' })
      setMensaje('')
      await recargarPedidos(cliente.idCliente)
      navigate('/cliente/catalogo', { replace: true })
    } catch (error) {
      mostrarError(error.message)
    }
  }

  async function manejarLogin(evento) {
    evento.preventDefault()
    try {
      const cliente = await loginCliente(credenciales)
      localStorage.setItem(SESION_KEY, JSON.stringify({ idCliente: cliente.idCliente }))
      setPerfil(cliente)
      setAutenticado(true)
      setCredenciales({ email: '', password: '' })
      setMensaje('')
      await recargarPedidos(cliente.idCliente)
      navigate('/cliente/catalogo', { replace: true })
    } catch (error) {
      mostrarError(error.message)
    }
  }

  async function guardarPerfil() {
    if (!perfil.idCliente) return
    try {
      const actualizado = await actualizarCliente(perfil.idCliente, {
        nombre: perfil.nombre,
        ciudad: perfil.ciudad,
        direccion: perfil.direccion,
        telefono: perfil.telefono,
      })
      setPerfil(actualizado)
      setMensaje('')
    } catch (error) {
      mostrarError(error.message)
    }
  }

  function salirSesion() {
    localStorage.removeItem(SESION_KEY)
    setAutenticado(false)
    setPerfil(PERFIL_VACIO)
    setCarrito([])
    setPedidos([])
    setPago({ titular: '', numero: '', vencimiento: '', cvv: '' })
    setUltimaCompra(null)
    setMensaje('')
    setMiniCarritoAbierto(false)
    navigate('/cliente/auth', { replace: true })
  }

  function agregarAlCarrito(producto, cantidad) {
    if (producto.agotado) return
    const cantidadValida = Math.max(1, Number(cantidad) || 1)
    if (cantidadValida > producto.cantidadDisponible) {
      mostrarError('La cantidad supera la disponibilidad actual.')
      return
    }

    setCarrito((previo) => {
      const existente = previo.find((item) => item.idProducto === producto.idProducto)
      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidadValida
        if (nuevaCantidad > producto.cantidadDisponible) {
          mostrarError('No puedes exceder el stock disponible en el carrito.')
          return previo
        }
        return previo.map((item) =>
          item.idProducto === producto.idProducto ? { ...item, cantidad: nuevaCantidad } : item
        )
      }
      return [
        ...previo,
        {
          idProducto: producto.idProducto,
          nombreProducto: producto.nombreProducto,
          precioProducto: Number(producto.precioProducto),
          cantidad: cantidadValida,
        },
      ]
    })
    setMensaje('')
  }

  function quitarDelCarrito(idProducto) {
    setCarrito((previo) => previo.filter((item) => item.idProducto !== idProducto))
  }

  async function confirmarCompra(evento) {
    evento.preventDefault()
    if (!perfil.idCliente) return
    if (carrito.length === 0) {
      return
    }

    setProcesandoPago(true)
    try {
      const pedidoConfirmado = await checkoutPedido({
        idCliente: perfil.idCliente,
        metodoPago: 'TARJETA',
        titular: pago.titular,
        numeroTarjeta: pago.numero,
        vencimiento: pago.vencimiento,
        cvv: pago.cvv,
        ciudadEntrega: perfil.ciudad,
        direccionEntrega: perfil.direccion,
        items: carrito.map((item) => ({
          idProducto: item.idProducto,
          cantidad: item.cantidad,
        })),
      })

      setMensaje('')
      setCarrito([])
      setMiniCarritoAbierto(false)
      setPago({ titular: '', numero: '', vencimiento: '', cvv: '' })
      setUltimaCompra(pedidoConfirmado)
      await recargarCatalogo()
      await recargarPedidos(perfil.idCliente)
      navigate('/cliente/compra-exitosa')
    } catch (error) {
      mostrarError(`No se pudo confirmar la compra: ${error.message}`)
    } finally {
      setProcesandoPago(false)
    }
  }

  useEffect(() => {
    async function cargarInicial() {
      await Promise.all([recargarCatalogo(), iniciarSesionPersistida()])
      setInicializado(true)
    }
    cargarInicial()
  }, [])

  useEffect(() => {
    if (!autenticado || !perfil.idCliente) return

    const guardado = localStorage.getItem(`${CARRITO_KEY_PREFIX}${perfil.idCliente}`)
    if (!guardado) {
      setCarrito([])
      return
    }

    try {
      const carritoPersistido = JSON.parse(guardado)
      if (Array.isArray(carritoPersistido)) {
        setCarrito(carritoPersistido)
      }
    } catch (_) {
      setCarrito([])
    }
  }, [autenticado, perfil.idCliente])

  useEffect(() => {
    if (!autenticado || !perfil.idCliente) return
    localStorage.setItem(`${CARRITO_KEY_PREFIX}${perfil.idCliente}`, JSON.stringify(carrito))
  }, [autenticado, perfil.idCliente, carrito])

  useEffect(() => {
    if (!autenticado || !perfil.idCliente) return

    const guardada = localStorage.getItem(`${ULTIMA_COMPRA_KEY_PREFIX}${perfil.idCliente}`)
    if (!guardada) {
      setUltimaCompra(null)
      return
    }

    try {
      const compra = JSON.parse(guardada)
      setUltimaCompra(compra)
    } catch (_) {
      setUltimaCompra(null)
    }
  }, [autenticado, perfil.idCliente])

  useEffect(() => {
    if (!autenticado || !perfil.idCliente || !ultimaCompra) return
    localStorage.setItem(`${ULTIMA_COMPRA_KEY_PREFIX}${perfil.idCliente}`, JSON.stringify(ultimaCompra))
  }, [autenticado, perfil.idCliente, ultimaCompra])

  useEffect(() => {
    function manejarClickFuera(evento) {
      if (miniCarritoRef.current && !miniCarritoRef.current.contains(evento.target)) {
        setMiniCarritoAbierto(false)
      }
      if (perfilDropdownRef.current && !perfilDropdownRef.current.contains(evento.target)) {
        setPerfilDropdownAbierto(false)
      }
    }

    if (miniCarritoAbierto || perfilDropdownAbierto) {
      document.addEventListener('mousedown', manejarClickFuera)
    }

    return () => {
      document.removeEventListener('mousedown', manejarClickFuera)
    }
  }, [miniCarritoAbierto, perfilDropdownAbierto])

  useEffect(() => {
    setMiniCarritoAbierto(false)
  }, [location.pathname])

  useEffect(() => {
    // Sincronizar vistaActual con la ruta actual
    if (location.pathname.includes('/cliente/catalogo')) {
      setVistaActual('catalogo')
    } else if (location.pathname.includes('/cliente/carrito') || location.pathname.includes('/cliente/compra')) {
      setVistaActual('compra')
    } else if (location.pathname.includes('/cliente/pedidos') || location.pathname.includes('/cliente/cuenta')) {
      // Si está en pedidos o cuenta, volvemos a catalogo (ya que esas son subrutas)
      setVistaActual('catalogo')
    }
  }, [location.pathname])

  if (!inicializado) {
    return (
      <section className="vista-cliente animar-entrada">
        <div className="panel tarjeta cliente-loader">Cargando portal cliente...</div>
      </section>
    )
  }

  const estaEnAuth = location.pathname === '/cliente/auth'

  if (!autenticado && !estaEnAuth) {
    return <Navigate to="/cliente/auth" replace />
  }

  if (autenticado && estaEnAuth) {
    return <Navigate to="/cliente/catalogo" replace />
  }

  if (estaEnAuth) {
    return (
      <Outlet
        context={{
          registro,
          setRegistro,
          credenciales,
          setCredenciales,
          manejarRegistro,
          manejarLogin,
        }}
      />
    )
  }

  return (
    <section className="vista-cliente animar-entrada cliente-layout">
      {mensaje && tipoMensaje === 'error' && <Notificacion mensaje={mensaje} tipo={tipoMensaje} />}

      {autenticado && (
        <header className="cliente-header-full">
          <div className="cliente-header-top">
            <button type="button" className="cliente-brand-btn" onClick={() => setVistaActual('catalogo')}>
              Caminos Sostenibles Market
            </button>

            <div className="cliente-user-section">
              <p className="cliente-greeting">Hola, {perfil.nombre || 'Cliente'}</p>
              <div className="perfil-dropdown" ref={perfilDropdownRef}>
                <button
                  type="button"
                  className="perfil-btn"
                  onClick={() => setPerfilDropdownAbierto((prev) => !prev)}
                  aria-expanded={perfilDropdownAbierto}
                >
                  👤︎
                </button>
                {perfilDropdownAbierto && (
                  <div className="perfil-menu">
                    <button
                      type="button"
                      className="perfil-menu-btn"
                      onClick={() => {
                        navigate('/cliente/pedidos')
                        setPerfilDropdownAbierto(false)
                      }}
                    >
                      Mi cuenta
                    </button>
                    <button
                      type="button"
                      className="perfil-menu-btn"
                      onClick={() => {
                        navigate('/cliente/cuenta')
                        setPerfilDropdownAbierto(false)
                      }}
                    >
                      Editar perfil
                    </button>
                    <div className="perfil-menu-divider"></div>
                    <button
                      type="button"
                      className="perfil-menu-btn perfil-logout"
                      onClick={() => {
                        salirSesion()
                        setPerfilDropdownAbierto(false)
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <nav className="cliente-nav-main">
            <div className="nav-tabs-group">
              <button
                type="button"
                className={vistaActual === 'catalogo' ? 'nav-tab activo' : 'nav-tab'}
                onClick={() => { setVistaActual('catalogo'); navigate('/cliente/catalogo') }}
              >
                Catálogo
              </button>
              <button
                type="button"
                className={vistaActual === 'compra' ? 'nav-tab activo' : 'nav-tab'}
                onClick={() => { setVistaActual('compra'); navigate('/cliente/carrito') }}
              >
                Compras
              </button>
            </div>

            <div className="mini-carrito-wrapper" ref={miniCarritoRef}>
              <button
                type="button"
                className="mini-carrito-btn"
                onClick={() => setMiniCarritoAbierto((prev) => !prev)}
                aria-expanded={miniCarritoAbierto}
              >
                🛒 Carrito
                {cantidadItemsCarrito > 0 && <span className="badge-carrito">{cantidadItemsCarrito}</span>}
              </button>

              {miniCarritoAbierto && (
                <div className="mini-carrito-dropdown">
                  <h3>Resumen rápido</h3>
                  {carrito.length === 0 ? (
                    <p className="placeholder">No hay productos en el carrito.</p>
                  ) : (
                    <>
                      <ul className="mini-carrito-lista">
                        {carrito.slice(0, 4).map((item) => (
                          <li key={item.idProducto}>
                            <span>{item.nombreProducto}</span>
                            <strong>{item.cantidad}</strong>
                          </li>
                        ))}
                      </ul>
                      {carrito.length > 4 && <p className="meta">Y {carrito.length - 4} item(s) más...</p>}
                      <p className="mini-carrito-total">Total: {formatearMoneda(totalCarrito)}</p>
                    </>
                  )}

                  <div className="mini-carrito-acciones">
                    <button
                      type="button"
                      className="boton-secundario"
                      onClick={() => {
                        setVistaActual('compra')
                        setMiniCarritoAbierto(false)
                      }}
                    >
                      Ver carrito
                    </button>
                    <button
                      type="button"
                      className="boton-principal"
                      onClick={() => {
                        navigate('/cliente/checkout')
                        setMiniCarritoAbierto(false)
                      }}
                      disabled={cantidadItemsCarrito === 0}
                    >
                      Pagar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </header>
      )}

      {vistaActual === 'catalogo' && (
        <div className="cliente-content">
          <Outlet
            context={{
              productosFiltrados,
              textoBusqueda,
              setTextoBusqueda,
              agregarAlCarrito,
              carrito,
              quitarDelCarrito,
              totalCarrito,
              perfil,
              setPerfil,
              pedidos,
              registro,
              setRegistro,
              credenciales,
              setCredenciales,
              manejarRegistro,
              manejarLogin,
              guardarPerfil,
              recargarCatalogo,
              cargando,
              pago,
              setPago,
              confirmarCompra,
              procesandoPago,
              ultimaCompra,
            }}
          />
        </div>
      )}

      {vistaActual === 'compra' && (
        <div className="cliente-content">
          <Outlet
            context={{
              productosFiltrados,
              textoBusqueda,
              setTextoBusqueda,
              agregarAlCarrito,
              carrito,
              quitarDelCarrito,
              totalCarrito,
              perfil,
              setPerfil,
              pedidos,
              registro,
              setRegistro,
              credenciales,
              setCredenciales,
              manejarRegistro,
              manejarLogin,
              guardarPerfil,
              recargarCatalogo,
              cargando,
              pago,
              setPago,
              confirmarCompra,
              procesandoPago,
              ultimaCompra,
              mostrarCarrito: true,
            }}
          />
        </div>
      )}




    </section>
  )
}

export function ClienteAuthPage() {
  const { modoAuth, setModoAuth, registro, setRegistro, credenciales, setCredenciales, manejarRegistro, manejarLogin } =
    useClienteContextAuth()

  const titleRef = useRef(null)

  useEffect(() => {
    gsap.to(titleRef.current, {
      duration: 4.6,
      scrambleText: {
        text: 'Caminos Sostenibles Market',
        chars: 'upperCase',
        speed: 0.28,
        delimiter: ' ',
      },
      ease: 'none',
    })
  }, [])

  return (
    <div className="auth-fullscreen">
      <div className="auth-bg-left">
        <h1 ref={titleRef} className="auth-brand-title">&nbsp;</h1>
      </div>

      <div className="auth-right">
        <div className="panel tarjeta auth-panel">
          <div className="auth-tabs">
            <button
              type="button"
              className={modoAuth === 'login' ? 'boton-principal' : 'boton-secundario'}
              onClick={() => setModoAuth('login')}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              className={modoAuth === 'registro' ? 'boton-principal' : 'boton-secundario'}
              onClick={() => setModoAuth('registro')}
            >
              Registrarme
            </button>
          </div>

      {modoAuth === 'login' ? (
        <form className="formulario-grid" onSubmit={manejarLogin}>
          <label>
            Correo
            <input
              type="email"
              value={credenciales.email}
              onChange={(evento) => setCredenciales((prev) => ({ ...prev, email: evento.target.value }))}
              required
            />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              value={credenciales.password}
              onChange={(evento) => setCredenciales((prev) => ({ ...prev, password: evento.target.value }))}
              required
            />
          </label>
          <button type="submit" className="boton-principal ancho-completo">
            Entrar
          </button>
        </form>
      ) : (
        <form className="formulario-grid" onSubmit={manejarRegistro}>
          <label>
            Nombre completo
            <input
              value={registro.nombre}
              onChange={(evento) => setRegistro((prev) => ({ ...prev, nombre: evento.target.value }))}
              required
            />
          </label>
          <label>
            Correo
            <input
              type="email"
              value={registro.email}
              onChange={(evento) => setRegistro((prev) => ({ ...prev, email: evento.target.value }))}
              required
            />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              value={registro.password}
              onChange={(evento) => setRegistro((prev) => ({ ...prev, password: evento.target.value }))}
              required
            />
          </label>
          <label>
            Ciudad
            <input
              value={registro.ciudad}
              onChange={(evento) => setRegistro((prev) => ({ ...prev, ciudad: evento.target.value }))}
              required
            />
          </label>
          <label className="ancho-completo">
            Direccion
            <input
              value={registro.direccion}
              onChange={(evento) => setRegistro((prev) => ({ ...prev, direccion: evento.target.value }))}
              required
            />
          </label>
          <label>
            Telefono
            <input
              value={registro.telefono}
              onChange={(evento) => setRegistro((prev) => ({ ...prev, telefono: evento.target.value }))}
              required
            />
          </label>
          <button type="submit" className="boton-principal ancho-completo">
            Crear cuenta
          </button>
        </form>
      )}
        </div>
      </div>
    </div>
  )
}

export function ClienteCatalogoPage() {
  const { productosFiltrados, textoBusqueda, setTextoBusqueda, agregarAlCarrito, recargarCatalogo, cargando } = useClienteContext()

  return (
    <div className="panel tarjeta">
      <div className="panel-encabezado panel-encabezado-flex">
        <div>
          <h2>Catalogo de productos</h2>
          <p>Explora y agrega productos a tu carrito.</p>
        </div>
        <div className="catalogo-acciones">
          <input
            className="input-busqueda"
            placeholder="Buscar por nombre, categoria o codigo..."
            value={textoBusqueda}
            onChange={(evento) => setTextoBusqueda(evento.target.value)}
          />
          <button className="boton-secundario" type="button" onClick={recargarCatalogo}>
            {cargando ? 'Actualizando...' : 'Recargar'}
          </button>
        </div>
      </div>

      <div className="catalogo-grid">
        {productosFiltrados.map((producto) => (
          <TarjetaProductoCliente key={producto.idProducto} producto={producto} onAgregar={agregarAlCarrito} />
        ))}
        {productosFiltrados.length === 0 && <p className="placeholder">No hay productos para mostrar.</p>}
      </div>
    </div>
  )
}

export function ClienteCarritoPage() {
  const navigate = useNavigate()
  const { carrito, quitarDelCarrito, totalCarrito } = useClienteContext()

  return (
    <div className="carrito-layout">
      <section className="panel tarjeta">
        <CheckoutBreadcrumb pasoActual="carrito" />

        <header className="panel-encabezado">
          <h2>Resumen del carrito</h2>
          <p>Verifica tus productos antes de pasar al pago.</p>
        </header>

        {carrito.length === 0 ? (
          <p className="placeholder">No hay productos en el carrito.</p>
        ) : (
          carrito.map((item) => (
            <article key={item.idProducto} className="item-carrito">
              <div>
                <strong>{item.nombreProducto}</strong>
                <p className="meta">
                  {item.cantidad} x {formatearMoneda(item.precioProducto)}
                </p>
              </div>
              <button className="boton-secundario" type="button" onClick={() => quitarDelCarrito(item.idProducto)}>
                Quitar
              </button>
            </article>
          ))
        )}
      </section>

      <aside className="panel tarjeta resumen-pedido-box">
        <h3>Resumen de compra</h3>
        <p className="meta">Subtotal productos</p>
        <p className="total-box">{formatearMoneda(totalCarrito)}</p>
        <button
          className="boton-principal ancho-completo"
          type="button"
          onClick={() => navigate('/cliente/checkout')}
          disabled={carrito.length === 0}
        >
          Ir a pagar
        </button>
      </aside>
    </div>
  )
}

export function ClienteCheckoutPage() {
  const { perfil, carrito, totalCarrito, pago, setPago, confirmarCompra, procesandoPago } = useClienteContext()

  if (carrito.length === 0) {
    return <Navigate to="/cliente/carrito" replace />
  }

  return (
    <div className="carrito-layout">
      <section className="panel tarjeta">
        <CheckoutBreadcrumb pasoActual="pago" />

        <header className="panel-encabezado">
          <h2>Pago y confirmacion</h2>
          <p>Completa tu pago para registrar el pedido.</p>
        </header>

        <form className="formulario-grid" onSubmit={confirmarCompra}>
          <label>
            Titular
            <input
              value={pago.titular}
              onChange={(evento) => setPago((prev) => ({ ...prev, titular: evento.target.value }))}
              required
            />
          </label>
          <label>
            Numero de tarjeta
            <input
              value={pago.numero}
              onChange={(evento) => setPago((prev) => ({ ...prev, numero: evento.target.value }))}
              inputMode="numeric"
              pattern="[0-9]{16}"
              placeholder="1234123412341234"
              required
            />
          </label>
          <label>
            Vencimiento
            <input
              value={pago.vencimiento}
              onChange={(evento) => setPago((prev) => ({ ...prev, vencimiento: evento.target.value }))}
              placeholder="MM/AA"
              pattern="(0[1-9]|1[0-2])/[0-9]{2}"
              required
            />
          </label>
          <label>
            CVV
            <input
              value={pago.cvv}
              onChange={(evento) => setPago((prev) => ({ ...prev, cvv: evento.target.value }))}
              inputMode="numeric"
              pattern="[0-9]{3,4}"
              required
            />
          </label>
          <label className="ancho-completo">
            Direccion de entrega
            <input value={`${perfil.ciudad || ''} - ${perfil.direccion || ''}`.trim()} disabled />
          </label>

          <div className="acciones-modal ancho-completo">
            <NavigateButton to="/cliente/carrito" className="boton-secundario">
              Volver al carrito
            </NavigateButton>
            <button className="boton-principal" type="submit" disabled={procesandoPago}>
              {procesandoPago ? 'Procesando pago...' : 'Pagar y confirmar'}
            </button>
          </div>
        </form>
      </section>

      <aside className="panel tarjeta resumen-pedido-box">
        <h3>Total a pagar</h3>
        <p className="total-box">{formatearMoneda(totalCarrito)}</p>
        <p className="meta">{carrito.length} productos en el pedido.</p>
      </aside>
    </div>
  )
}

export function ClienteCompraExitosaPage() {
  const navigate = useNavigate()
  const { ultimaCompra } = useClienteContext()

  if (!ultimaCompra) {
    return <Navigate to="/cliente/pedidos" replace />
  }

  return (
    <section className="panel tarjeta compra-exitosa">
      <CheckoutBreadcrumb pasoActual="confirmacion" />

      <div className="icono-exito" aria-hidden="true">
        ✓
      </div>
      <h2>Compra exitosa</h2>
      <p>Tu pedido fue confirmado y ya aparece en tu historial.</p>

      <div className="resumen-exito">
        <p>
          <strong>Pedido:</strong> #{ultimaCompra.idPedido}
        </p>
        <p>
          <strong>Estado:</strong> {ultimaCompra.estado}
        </p>
        <p>
          <strong>Total:</strong> {formatearMoneda(ultimaCompra.total)} {ultimaCompra.moneda}
        </p>
      </div>

      <div className="acciones-modal">
        <button className="boton-secundario" type="button" onClick={() => navigate('/cliente/catalogo')}>
          Seguir comprando
        </button>
        <button className="boton-principal" type="button" onClick={() => navigate('/cliente/pedidos')}>
          Ver mis pedidos
        </button>
      </div>
    </section>
  )
}

export function ClientePedidosPage() {
  const { pedidos } = useClienteContext()
  const [expandidos, setExpandidos] = useState({})

  function alternarDetalle(idPedido) {
    setExpandidos((previo) => ({
      ...previo,
      [idPedido]: !previo[idPedido],
    }))
  }

  return (
    <section className="panel tarjeta">
      <header className="panel-encabezado">
        <h2>Mi cuenta</h2>
        <p>Resumen de tus pedidos y compras.</p>
      </header>

      {pedidos.length === 0 ? (
        <p className="placeholder">Aun no tienes pedidos registrados.</p>
      ) : (
        <div className="pedidos-lista">
          {pedidos.map((pedido) => (
            <article key={pedido.idPedido} className="pedido-card-wrapper">
              <div className="pedido-card">
                <div>
                  <h3>Pedido #{pedido.idPedido}</h3>
                  <p className="meta">{new Date(pedido.fechaCreacion).toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <p className="meta">Estado</p>
                  <strong>{pedido.estado}</strong>
                </div>
                <div>
                  <p className="meta">Total</p>
                  <strong>
                    {formatearMoneda(pedido.total)} {pedido.moneda}
                  </strong>
                </div>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => alternarDetalle(pedido.idPedido)}
                >
                  {expandidos[pedido.idPedido] ? 'Ocultar items' : 'Ver items'}
                </button>
              </div>

              {expandidos[pedido.idPedido] && (
                <div className="pedido-items-detalle">
                  {!pedido.items || pedido.items.length === 0 ? (
                    <p className="placeholder">Este pedido no tiene detalle de items.</p>
                  ) : (
                    pedido.items.map((item, indice) => (
                      <div key={`${pedido.idPedido}-${item.idProducto || indice}`} className="pedido-item-fila">
                        <div>
                          <strong>{item.nombreProducto}</strong>
                          <p className="meta">Codigo: {item.codigoProducto || 'N/A'}</p>
                        </div>
                        <p className="meta">Cant: {item.cantidad}</p>
                        <p className="meta">Subtotal: {formatearMoneda(item.subtotal)}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function ClientePerfilPage() {
  const { perfil, setPerfil, guardarPerfil } = useClienteContext()

  return (
    <section className="panel tarjeta perfil-limpio">
      <header className="panel-encabezado">
        <h2>Editar perfil</h2>
        <p>Administra tus datos personales y de entrega.</p>
      </header>

      <form className="formulario-grid" onSubmit={(evento) => evento.preventDefault()}>
        <label>
          Nombre
          <input
            value={perfil.nombre}
            onChange={(evento) => setPerfil((prev) => ({ ...prev, nombre: evento.target.value }))}
          />
        </label>
        <label>
          Correo
          <input value={perfil.email} disabled />
        </label>
        <label>
          Ciudad
          <input
            value={perfil.ciudad || ''}
            onChange={(evento) => setPerfil((prev) => ({ ...prev, ciudad: evento.target.value }))}
          />
        </label>
        <label>
          Telefono
          <input
            value={perfil.telefono || ''}
            onChange={(evento) => setPerfil((prev) => ({ ...prev, telefono: evento.target.value }))}
          />
        </label>
        <label className="ancho-completo">
          Direccion
          <input
            value={perfil.direccion || ''}
            onChange={(evento) => setPerfil((prev) => ({ ...prev, direccion: evento.target.value }))}
          />
        </label>
      </form>

      <button className="boton-principal" type="button" onClick={guardarPerfil}>
        Guardar cambios
      </button>
    </section>
  )
}

function TarjetaProductoCliente({ producto, onAgregar }) {
  const [cantidad, setCantidad] = useState(1)

  return (
    <article className={`producto-cliente ${producto.agotado ? 'producto-agotado' : ''}`}>
      <div className="imagen-producto-cliente">
        {producto.imagenUrl ? (
          <img src={producto.imagenUrl} alt={producto.nombreProducto} />
        ) : (
          <div className="sin-imagen">Sin imagen</div>
        )}
      </div>
      {producto.agotado && <span className="etiqueta-agotado">Agotado</span>}
      <h3>{producto.nombreProducto}</h3>
      <p className="meta">Codigo: {producto.codigoProducto}</p>
      <p className="meta">Categoria: {producto.categoriaProducto}</p>
      <p className="meta">Disponibles: {producto.cantidadDisponible}</p>
      <p className="precio">{formatearMoneda(producto.precioProducto)}</p>

      <div className="acciones-compra">
        <input
          type="number"
          min="1"
          step="1"
          value={cantidad}
          onChange={(evento) => setCantidad(Number(evento.target.value || 1))}
          disabled={producto.agotado}
        />
        <button
          className="boton-principal"
          type="button"
          onClick={() => onAgregar(producto, cantidad)}
          disabled={producto.agotado}
        >
          Anadir al carrito
        </button>
      </div>
    </article>
  )
}

function NavigateButton({ to, children, className }) {
  const navigate = useNavigate()

  return (
    <button className={className} type="button" onClick={() => navigate(to)}>
      {children}
    </button>
  )
}

function formatearMoneda(valor) {
  return `$${Number(valor || 0).toLocaleString('es-CO')}`
}

function CheckoutBreadcrumb({ pasoActual }) {
  const pasos = [
    { id: 'carrito', etiqueta: 'Carrito' },
    { id: 'pago', etiqueta: 'Pago' },
    { id: 'confirmacion', etiqueta: 'Confirmacion' },
  ]

  return (
    <nav className="checkout-breadcrumb" aria-label="Progreso de compra">
      {pasos.map((paso, indice) => (
        <div key={paso.id} className={`breadcrumb-item ${pasoActual === paso.id ? 'activo' : ''}`}>
          <span>{paso.etiqueta}</span>
          {indice < pasos.length - 1 && <span className="breadcrumb-separador">&gt;</span>}
        </div>
      ))}
    </nav>
  )
}

function useClienteContext() {
  return useOutletContext()
}

function useClienteContextAuth() {
  const ctx = useOutletContext()
  const [modoAuth, setModoAuth] = useState('login')

  return {
    ...ctx,
    modoAuth,
    setModoAuth,
  }
}
