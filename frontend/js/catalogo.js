let todosLosProductos = []
let categoriaActiva   = ''
let precioMaxActivo   = Infinity
let esAdmin           = false

window.addEventListener('load', async () => {
  const sesion = obtenerSesion()
  esAdmin = !!(sesion && (sesion.rol === 'ADMIN' || sesion.rol === 'BODEGUERO'))

  if (esAdmin) {
    document.querySelectorAll('.nav-cliente').forEach(el => el.style.display = 'none')
    const navAdmin = document.getElementById('nav-admin')
    if (navAdmin) navAdmin.style.display = 'flex'
    const banner = document.getElementById('banner-admin')
    if (banner) banner.style.display = 'block'
    const filtroDisp = document.getElementById('sidebar-disponibilidad')
    if (filtroDisp) filtroDisp.style.display = 'none'
  } else {
    verificarSesion()
    actualizarBadgeCarrito()
  }

  await Promise.all([cargarCatalogo(), cargarCategoriasEnSidebar()])
})

async function cargarCatalogo() {
  try {
    const [productos, existencias] = await Promise.all([
      obtenerProductos(),
      obtenerExistencias(),
    ])
    const mapaStock = new Map(existencias.map(e => [e.idProducto, Number(e.cantidadTotal)]))
    // Admin ve todos los productos; cliente solo ve los activos
    const base = esAdmin ? productos : productos.filter(p => p.activo)
    todosLosProductos = base.map(p => ({
      ...p,
      cantidadDisponible: mapaStock.get(p.idProducto) || 0,
      agotado: (mapaStock.get(p.idProducto) || 0) <= 0,
    }))
    renderizarProductos(todosLosProductos)
  } catch (error) {
    document.getElementById('grilla-productos').innerHTML =
      `<p class="placeholder">Error al cargar el catálogo: ${error.message}</p>`
  }
}

async function cargarCategoriasEnSidebar() {
  try {
    const categorias = await obtenerCategorias()
    const contenedor = document.getElementById('lista-categorias')
    contenedor.innerHTML = categorias.map(cat => `
      <button class="btn-categoria" onclick="seleccionarCategoria('${cat.nombre}', this)">
        ${cat.nombre}
      </button>
    `).join('')
  } catch {}
}

function seleccionarCategoria(nombre, boton) {
  categoriaActiva = nombre
  document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('activo'))
  boton.classList.add('activo')
  filtrarProductos()
}

function actualizarPrecio(input) {
  const valor = Number(input.value)
  precioMaxActivo = valor >= 100000 ? Infinity : valor
  document.getElementById('precio-display').textContent =
    precioMaxActivo === Infinity ? 'Sin límite' : `$${valor.toLocaleString('es-CO')}`
  filtrarProductos()
}

function filtrarProductos() {
  const termino         = document.getElementById('buscador').value.toLowerCase()
  const soloDisponibles = esAdmin && document.getElementById('solo-disponibles').checked

  const filtrados = todosLosProductos.filter(p => {
    const coincideTexto     = !termino || p.nombreProducto.toLowerCase().includes(termino) ||
                              (p.categoriaProducto || '').toLowerCase().includes(termino)
    const coincideCategoria = !categoriaActiva || p.categoriaProducto === categoriaActiva
    const coincidePrecio    = Number(p.precioProducto) <= precioMaxActivo
    const coincideStock     = esAdmin ? (!soloDisponibles || !p.agotado) : !p.agotado
    return coincideTexto && coincideCategoria && coincidePrecio && coincideStock
  })

  renderizarProductos(filtrados)
}

function limpiarFiltros() {
  document.getElementById('buscador').value = ''
  document.getElementById('filtro-precio-max').value = 100000
  document.getElementById('precio-display').textContent = 'Sin límite'
  const cb = document.getElementById('solo-disponibles')
  if (cb) cb.checked = false
  document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('activo'))
  document.querySelector('.btn-categoria').classList.add('activo')
  categoriaActiva = ''
  precioMaxActivo = Infinity
  renderizarProductos(todosLosProductos)
}

function renderizarProductos(productos) {
  const grilla = document.getElementById('grilla-productos')

  // Clientes nunca ven productos sin stock
  const visibles = esAdmin ? productos : productos.filter(p => !p.agotado)

  document.getElementById('conteo').textContent =
    `${visibles.length} producto${visibles.length !== 1 ? 's' : ''}`

  if (!visibles.length) {
    grilla.innerHTML = '<p class="placeholder">No hay productos disponibles.</p>'
    return
  }

  grilla.innerHTML = visibles.map(p => {
    let indicadorStock
    if (esAdmin) {
      if (p.agotado) {
        indicadorStock = '<span class="sin-stock">Sin stock</span>'
      } else if (p.cantidadDisponible <= 5) {
        indicadorStock = `<span class="stock-bajo">⚠ Quedan ${p.cantidadDisponible}</span>`
      } else {
        indicadorStock = `<span class="stock-ok">${p.cantidadDisponible} disponibles</span>`
      }
    } else {
      indicadorStock = p.cantidadDisponible <= 5
        ? '<span class="stock-bajo">⚠ Pocas unidades</span>'
        : '<span class="stock-ok">Disponible</span>'
    }

    const acciones = esAdmin
      ? `<div style="padding:6px 14px 14px;">
           <span style="font-size:0.78rem; color:var(--texto-suave); font-style:italic;">Vista previa</span>
         </div>`
      : `<div class="acciones-producto">
           <input type="number" id="cant-${p.idProducto}" value="1" min="1" max="${p.cantidadDisponible}">
           <button class="boton-principal" onclick="agregarProductoAlCarrito(${p.idProducto})">
             Agregar
           </button>
         </div>`

    return `
      <div class="producto-tarjeta ${p.agotado ? 'agotado' : ''}">
        ${p.imagenUrl
          ? `<img src="${p.imagenUrl}" alt="${p.nombreProducto}">`
          : '<div class="sin-imagen">Sin imagen</div>'}
        <h3>${p.nombreProducto}</h3>
        <p class="meta">${p.categoriaProducto || ''}</p>
        ${indicadorStock}
        <p class="precio">${formatearMoneda(p.precioProducto)}</p>
        ${acciones}
      </div>
    `
  }).join('')
}

function agregarProductoAlCarrito(idProducto) {
  const producto = todosLosProductos.find(p => p.idProducto === idProducto)
  if (!producto || producto.agotado) return

  const cantidad = Number(document.getElementById(`cant-${idProducto}`).value) || 1
  if (cantidad > producto.cantidadDisponible) {
    alert('La cantidad supera el stock disponible.')
    return
  }

  agregarAlCarrito(producto, cantidad)
  actualizarBadgeCarrito()

  const notif = document.getElementById('notificacion')
  mostrarNotificacion(notif, `✓ ${producto.nombreProducto} agregado al carrito.`)
}

function actualizarBadgeCarrito() {
  const total = obtenerCarrito().reduce((s, a) => s + a.cantidad, 0)
  const badge = document.getElementById('badge-carrito')
  if (!badge) return
  if (total > 0) { badge.textContent = total; badge.style.display = 'inline' }
  else badge.style.display = 'none'
}
