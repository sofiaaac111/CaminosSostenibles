window.addEventListener('load', () => {
  const sesion = verificarSesion()
  const carrito = obtenerCarrito()

  if (carrito.length === 0) {
    window.location.href = '/carrito.html'
    return
  }

  // Mostrar dirección del perfil
  document.getElementById('direccion-entrega').value =
    `${sesion.ciudad || ''} - ${sesion.direccion || ''}`.trim()

  // Mostrar resumen del pedido
  const resumen = document.getElementById('resumen-pedido')
  let total = 0
  resumen.innerHTML = carrito.map(a => {
    const sub = a.precioProducto * a.cantidad
    total += sub
    return `<p style="font-size:0.85rem; padding:4px 0;">${a.nombreProducto} × ${a.cantidad} = ${formatearMoneda(sub)}</p>`
  }).join('')
  document.getElementById('total-pago').textContent = formatearMoneda(total)
})

async function confirmarCompra(evento) {
  evento.preventDefault()
  const sesion  = obtenerSesion()
  const carrito = obtenerCarrito()
  const notif   = document.getElementById('notificacion')
  const boton   = document.getElementById('btn-confirmar')

  boton.disabled = true
  boton.textContent = 'Procesando...'

  try {
    const pedido = await crearPedido({
      idCliente:        sesion.idCliente,
      metodoPago:       'TARJETA',
      titular:          document.getElementById('titular').value,
      numeroTarjeta:    document.getElementById('numero-tarjeta').value,
      vencimiento:      document.getElementById('vencimiento').value,
      cvv:              document.getElementById('cvv').value,
      ciudadEntrega:    sesion.ciudad,
      direccionEntrega: sesion.direccion,
      items: carrito.map(a => ({ idProducto: a.idProducto, cantidad: a.cantidad })),
    })

    guardarCarrito([])
    localStorage.setItem('ultimo-pedido', JSON.stringify(pedido))
    window.location.href = '/factura.html'
  } catch (error) {
    mostrarNotificacion(notif, error.message, 'error')
    boton.disabled = false
    boton.textContent = 'Pagar y confirmar'
  }
}
