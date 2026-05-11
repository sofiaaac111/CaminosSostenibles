window.addEventListener('load', () => {
  verificarSesion()
  renderizarCarrito()
})

function renderizarCarrito() {
  const carrito = obtenerCarrito()
  const lista = document.getElementById('lista-carrito')
  const totalEl = document.getElementById('total-carrito')
  const btnPagar = document.getElementById('btn-pagar')

  if (carrito.length === 0) {
    lista.innerHTML = '<p class="placeholder">Tu carrito está vacío.</p>'
    totalEl.textContent = '$0'
    btnPagar.style.pointerEvents = 'none'
    btnPagar.style.opacity = '0.5'
    return
  }

  btnPagar.style.pointerEvents = 'auto'
  btnPagar.style.opacity = '1'

  let total = 0
  lista.innerHTML = carrito.map(articulo => {
    const subtotal = articulo.precioProducto * articulo.cantidad
    total += subtotal
    return `
      <div style="display:flex; justify-content:space-between; align-items:center;
                  padding:12px 0; border-bottom:1px solid var(--borde);">
        <div>
          <strong>${articulo.nombreProducto}</strong>
          <p class="meta">${articulo.cantidad} × ${formatearMoneda(articulo.precioProducto)}</p>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <strong>${formatearMoneda(subtotal)}</strong>
          <button class="boton-secundario" onclick="eliminarArticulo(${articulo.idProducto})">
            Quitar
          </button>
        </div>
      </div>
    `
  }).join('')

  totalEl.textContent = formatearMoneda(total)
}

function eliminarArticulo(idProducto) {
  quitarDelCarrito(idProducto)
  renderizarCarrito()
}
