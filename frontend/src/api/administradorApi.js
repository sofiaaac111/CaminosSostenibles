// En desarrollo usamos rutas relativas y Vite proxy para evitar problemas
// de CORS/certificados en iPhone cuando se accede por HTTPS público.
const API_BASE_PRODUCTOS = '/api/productos'
const API_BASE_INVENTARIO = '/api/inventario'

async function manejarRespuesta(respuesta) {
  const tipo = respuesta.headers.get('content-type') || ''
  const payload = tipo.includes('application/json')
    ? await respuesta.json()
    : await respuesta.text()

  if (!respuesta.ok) {
    const mensaje = typeof payload === 'string' ? payload : JSON.stringify(payload)
    throw new Error(mensaje || 'Error en la peticion al servidor')
  }

  return payload
}

export async function listarProductos() {
  const respuesta = await fetch(API_BASE_PRODUCTOS)
  return manejarRespuesta(respuesta)
}

export async function buscarProductosPorNombre(nombreProducto) {
  const params = new URLSearchParams({ nombre: nombreProducto })
  const respuesta = await fetch(`${API_BASE_PRODUCTOS}/buscar?${params.toString()}`)
  return manejarRespuesta(respuesta)
}

export async function crearProducto(producto) {
  const respuesta = await fetch(API_BASE_PRODUCTOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto),
  })

  return manejarRespuesta(respuesta)
}

export async function cambiarEstadoProducto(idProducto, activo) {
  const params = new URLSearchParams({ activo: String(activo) })
  const respuesta = await fetch(`${API_BASE_PRODUCTOS}/${idProducto}/estado?${params.toString()}`, {
    method: 'PUT',
  })
  return manejarRespuesta(respuesta)
}

export async function registrarStock({ idProducto, numeroLote, cantidad, fechaVencimiento }) {
  const params = new URLSearchParams({
    idProducto: String(idProducto),
    numeroLote,
    cantidad: String(cantidad),
    fechaVencimiento,
  })

  const respuesta = await fetch(`${API_BASE_INVENTARIO}/agregar-stock?${params.toString()}`, {
    method: 'POST',
  })

  return manejarRespuesta(respuesta)
}

export async function consultarExistencia(idProducto) {
  const respuesta = await fetch(`${API_BASE_INVENTARIO}/existencias/${idProducto}`)
  return manejarRespuesta(respuesta)
}

export async function listarExistencias() {
  const respuesta = await fetch(`${API_BASE_INVENTARIO}/existencias`)
  return manejarRespuesta(respuesta)
}

export async function listarTodosPedidos() {
  const respuesta = await fetch('/api/pedidos')
  return manejarRespuesta(respuesta)
}

export async function editarProducto(idProducto, producto) {
  const respuesta = await fetch(`${API_BASE_PRODUCTOS}/${idProducto}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto),
  })
  return manejarRespuesta(respuesta)
}
