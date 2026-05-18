const CARD_PLACEHOLDER = '**** **** **** ****'

function soloDigitos(valor) {
  return valor.replace(/\D/g, '')
}

function formatearNumeroTarjeta(valor) {
  return soloDigitos(valor).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatearVencimiento(valor) {
  const digitos = soloDigitos(valor).slice(0, 4)
  if (digitos.length <= 2) return digitos
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
}

function actualizarTarjeta() {
  const numeroInput = document.getElementById('numero-tarjeta')
  const titularInput = document.getElementById('titular')
  const vencimientoInput = document.getElementById('vencimiento')
  const numeroDisplay = document.getElementById('card-display-number')
  const titularDisplay = document.getElementById('card-display-holder')
  const vencimientoDisplay = document.getElementById('card-display-expiry')

  if (!numeroInput || !titularInput || !vencimientoInput || !numeroDisplay || !titularDisplay || !vencimientoDisplay) return

  const numero = soloDigitos(numeroInput.value)
  const ultimosCuatro = numero.slice(-4)
  const mascara = numero
    ? `${'*'.repeat(Math.max(numero.length - 4, 0))}${ultimosCuatro}`.replace(/(.{4})(?=.)/g, '$1 ')
    : CARD_PLACEHOLDER

  numeroDisplay.textContent = mascara
  titularDisplay.textContent = titularInput.value.trim().toUpperCase() || 'TU NOMBRE'
  vencimientoDisplay.textContent = vencimientoInput.value || 'MM/AA'
}

function prepararFormularioPago() {
  const numeroInput = document.getElementById('numero-tarjeta')
  const vencimientoInput = document.getElementById('vencimiento')
  const cvvInput = document.getElementById('cvv')
  const titularInput = document.getElementById('titular')

  numeroInput?.addEventListener('input', () => {
    numeroInput.value = formatearNumeroTarjeta(numeroInput.value)
    actualizarTarjeta()
  })

  vencimientoInput?.addEventListener('input', () => {
    vencimientoInput.value = formatearVencimiento(vencimientoInput.value)
    actualizarTarjeta()
  })

  cvvInput?.addEventListener('input', () => {
    cvvInput.value = soloDigitos(cvvInput.value).slice(0, 4)
  })

  titularInput?.addEventListener('input', actualizarTarjeta)
}

window.addEventListener('load', () => {
  const sesion = verificarSesion()
  if (!sesion) return

  prepararFormularioPago()

  const carrito = obtenerCarrito()
  if (carrito.length === 0) {
    window.location.href = '/carrito.html'
    return
  }

  document.getElementById('direccion-entrega').value =
    `${sesion.ciudad || ''} - ${sesion.direccion || ''}`.trim()

  const resumen = document.getElementById('resumen-pedido')
  let total = 0
  resumen.innerHTML = carrito.map(articulo => {
    const subtotal = articulo.precioProducto * articulo.cantidad
    total += subtotal

    return `
      <div class="resumen-linea">
        <div>
          <strong>${articulo.nombreProducto}</strong>
          <span>${articulo.cantidad} x ${formatearMoneda(articulo.precioProducto)}</span>
        </div>
        <strong>${formatearMoneda(subtotal)}</strong>
      </div>
    `
  }).join('')

  document.getElementById('total-pago').textContent = formatearMoneda(total)
  actualizarTarjeta()
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
      numeroTarjeta:    soloDigitos(document.getElementById('numero-tarjeta').value),
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
