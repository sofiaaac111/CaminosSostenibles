async function manejarRespuesta(respuesta) {
  const tipo = respuesta.headers.get('content-type') || ''
  const payload = tipo.includes('application/json')
    ? await respuesta.json()
    : await respuesta.text()

  if (!respuesta.ok) {
    if (payload && typeof payload === 'object' && payload.message) {
      throw new Error(payload.message)
    }
    const mensaje = typeof payload === 'string' ? payload : JSON.stringify(payload)
    throw new Error(mensaje || 'Error en la peticion al servidor')
  }

  return payload
}

export async function registrarCliente(datos) {
  const respuesta = await fetch('/api/clientes/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  return manejarRespuesta(respuesta)
}

export async function loginCliente({ email, password }) {
  const respuesta = await fetch('/api/clientes/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return manejarRespuesta(respuesta)
}

export async function obtenerCliente(idCliente) {
  const respuesta = await fetch(`/api/clientes/${idCliente}`)
  return manejarRespuesta(respuesta)
}

export async function actualizarCliente(idCliente, datos) {
  const respuesta = await fetch(`/api/clientes/${idCliente}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  return manejarRespuesta(respuesta)
}

export async function checkoutPedido(datos) {
  const respuesta = await fetch('/api/pedidos/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  return manejarRespuesta(respuesta)
}

export async function listarPedidosCliente(idCliente) {
  const respuesta = await fetch(`/api/pedidos/cliente/${idCliente}`)
  return manejarRespuesta(respuesta)
}
