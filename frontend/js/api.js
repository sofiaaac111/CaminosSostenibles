// ── Función base para manejar respuestas HTTP ────────────────────────────────
async function manejarRespuesta(respuesta) {
  const texto = await respuesta.text()

  // Si la respuesta no es JSON (ej: página HTML de error), lanzar mensaje claro
  let datos = null
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch {
    if (!respuesta.ok) {
      throw new Error(`El servidor respondió con código ${respuesta.status}. Verifica que todos los servicios estén corriendo.`)
    }
    throw new Error('El servidor devolvió una respuesta inesperada. Puede que el servicio aún esté iniciando.')
  }

  if (!respuesta.ok) {
    const mensaje = (datos && datos.message) ? datos.message : (texto || 'Error en el servidor')
    throw new Error(mensaje)
  }
  return datos
}

// ── PRODUCTOS ─────────────────────────────────────────────────────────────────
async function obtenerCategorias() {
  return manejarRespuesta(await fetch('/api/productos/categorias'))
}

async function obtenerProductos() {
  return manejarRespuesta(await fetch('/api/productos'))
}

async function obtenerProductoPorId(id) {
  return manejarRespuesta(await fetch(`/api/productos/${id}`))
}

async function obtenerProductoPorCodigo(codigo) {
  return manejarRespuesta(await fetch(`/api/productos/codigo/${codigo}`))
}

async function crearProducto(datos) {
  return manejarRespuesta(await fetch('/api/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }))
}

async function editarProducto(id, datos) {
  return manejarRespuesta(await fetch(`/api/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }))
}

async function cambiarEstadoProducto(id, activo) {
  return manejarRespuesta(await fetch(`/api/productos/${id}/estado?activo=${activo}`, {
    method: 'PUT',
  }))
}

// ── INVENTARIO ────────────────────────────────────────────────────────────────
async function obtenerExistencias() {
  return manejarRespuesta(await fetch('/api/inventario/existencias'))
}

async function obtenerExistenciaProducto(idProducto) {
  return manejarRespuesta(await fetch(`/api/inventario/existencias/${idProducto}`))
}

async function agregarStock(idProducto, numeroLote, cantidad, fechaVencimiento) {
  const params = new URLSearchParams({ idProducto, numeroLote, cantidad, fechaVencimiento })
  return manejarRespuesta(await fetch(`/api/inventario/agregar-stock?${params}`, {
    method: 'POST',
  }))
}

async function obtenerLotesPorVencer(fechaLimite) {
  return manejarRespuesta(await fetch(`/api/inventario/lotes-por-vencer?fechaLimite=${fechaLimite}`))
}

async function obtenerLotesProducto(idProducto) {
  return manejarRespuesta(await fetch(`/api/inventario/lotes/${idProducto}`))
}

// ── CLIENTES ──────────────────────────────────────────────────────────────────
async function registrarCliente(datos) {
  return manejarRespuesta(await fetch('/api/clientes/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }))
}

async function iniciarSesion(email, password) {
  return manejarRespuesta(await fetch('/api/clientes/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }))
}

async function obtenerCliente(id) {
  return manejarRespuesta(await fetch(`/api/clientes/${id}`))
}

async function actualizarCliente(id, datos) {
  return manejarRespuesta(await fetch(`/api/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }))
}

async function cambiarContrasena(id, passwordActual, passwordNuevo) {
  return manejarRespuesta(await fetch(`/api/clientes/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passwordActual, passwordNuevo }),
  }))
}

// ── PEDIDOS ───────────────────────────────────────────────────────────────────
async function crearPedido(datos) {
  return manejarRespuesta(await fetch('/api/pedidos/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }))
}

async function obtenerPedidosCliente(idCliente) {
  return manejarRespuesta(await fetch(`/api/pedidos/cliente/${idCliente}`))
}

async function obtenerTodosPedidos() {
  return manejarRespuesta(await fetch('/api/pedidos'))
}

// ── SESIÓN (localStorage) ─────────────────────────────────────────────────────
function guardarSesion(cliente) {
  localStorage.setItem('sesion', JSON.stringify(cliente))
}

function obtenerSesion() {
  const datos = localStorage.getItem('sesion')
  return datos ? JSON.parse(datos) : null
}

function cerrarSesion() {
  localStorage.removeItem('sesion')
  localStorage.removeItem('carrito')
  window.location.href = '/auth.html'
}

function verificarSesion() {
  const sesion = obtenerSesion()
  if (!sesion) { window.location.href = '/auth.html' }
  return sesion
}

function verificarRol(...rolesPermitidos) {
  const sesion = obtenerSesion()
  if (!sesion) { window.location.href = '/login-admin.html'; return null }
  if (!rolesPermitidos.includes(sesion.rol)) {
    window.location.href = sesion.rol === 'CLIENTE' ? '/catalogo.html' : '/login-admin.html'
    return null
  }
  return sesion
}

// ── CARRITO (localStorage) ────────────────────────────────────────────────────
function obtenerCarrito() {
  const datos = localStorage.getItem('carrito')
  return datos ? JSON.parse(datos) : []
}

function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito))
}

function agregarAlCarrito(producto, cantidad) {
  const carrito = obtenerCarrito()
  const existente = carrito.find(a => a.idProducto === producto.idProducto)
  if (existente) {
    existente.cantidad += cantidad
  } else {
    carrito.push({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precioProducto: producto.precioProducto,
      cantidad,
    })
  }
  guardarCarrito(carrito)
}

function quitarDelCarrito(idProducto) {
  guardarCarrito(obtenerCarrito().filter(a => a.idProducto !== idProducto))
}

// ── Utilidades ────────────────────────────────────────────────────────────────
function formatearMoneda(valor) {
  return `$${Number(valor || 0).toLocaleString('es-CO')}`
}

function mostrarNotificacion(contenedor, mensaje, tipo = 'ok') {
  contenedor.innerHTML = `<div class="notificacion ${tipo}">${mensaje}</div>`
  setTimeout(() => { contenedor.innerHTML = '' }, 4000)
}
