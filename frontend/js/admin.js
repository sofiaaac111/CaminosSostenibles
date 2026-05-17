let todosLosProductos = []
let todosLosPedidos   = []
const UMBRAL_STOCK_BAJO    = 5
const UMBRAL_STOCK_MEDIO   = 20

// ── Carga inicial ────────────────────────────────────────────────────────────
window.addEventListener('load', async () => {
  if (!verificarRol('ADMIN')) return
  await Promise.all([cargarProductos(), cargarPedidos(), cargarCategorias()])
  verificarStockBajo()
})

async function cargarCategorias() {
  try {
    const categorias = await obtenerCategorias()
    const select = document.getElementById('categoria')
    select.innerHTML = '<option value="">Selecciona una categoría</option>'
    categorias.forEach(cat => {
      const op = document.createElement('option')
      op.value = cat.idCategoria      // FK id, no el nombre
      op.textContent = cat.nombre
      select.appendChild(op)
    })
  } catch {
    // Si falla, dejar el select vacío
  }
}

// ── PRODUCTOS ─────────────────────────────────────────────────────────────────

async function cargarProductos() {
  try {
    todosLosProductos = await obtenerProductos()
    renderizarTablaProductos(todosLosProductos)
    document.getElementById('m-productos-activos').textContent =
      todosLosProductos.filter(p => p.activo).length
  } catch (error) {
    mostrarNotificacion(document.getElementById('notificacion'), 'Error al cargar productos: ' + error.message, 'error')
  }
}

function renderizarTablaProductos(productos) {
  const cuerpo = document.getElementById('cuerpo-tabla')
  if (!productos.length) {
    cuerpo.innerHTML = '<tr><td colspan="6" class="placeholder">No hay productos.</td></tr>'
    return
  }
  cuerpo.innerHTML = productos.map(p => `
    <tr>
      <td>${p.idProducto}</td>
      <td>${p.nombreProducto}</td>
      <td>${p.categoriaProducto}</td>
      <td>${formatearMoneda(p.precioProducto)}</td>
      <td>${p.activo ? '✅ Activo' : '❌ Inactivo'}</td>
      <td style="display:flex; gap:6px; flex-wrap:wrap;">
        <button class="boton-principal" onclick="cargarParaEditar(${p.idProducto})" style="padding:8px 16px; font-size:0.82rem;">✏️ Editar</button>
        <button class="boton-secundario" onclick="toggleEstado(${p.idProducto}, ${p.activo})" style="padding:8px 16px; font-size:0.82rem;">
          ${p.activo ? 'Desactivar' : 'Activar'}
        </button>
      </td>
    </tr>
  `).join('')
}

function filtrarProductos() {
  const termino = document.getElementById('buscador').value.toLowerCase()
  renderizarTablaProductos(
    todosLosProductos.filter(p =>
      p.nombreProducto.toLowerCase().includes(termino) ||
      (p.categoriaProducto || '').toLowerCase().includes(termino)
    )
  )
}

function cargarParaEditar(id) {
  const p = todosLosProductos.find(p => p.idProducto === id)
  if (!p) return
  document.getElementById('id-producto').value        = p.idProducto
  document.getElementById('codigo').value              = p.codigoProducto
  document.getElementById('nombre').value              = p.nombreProducto
  document.getElementById('categoria').value           = p.categoria?.idCategoria || ''
  document.getElementById('precio').value              = p.precioProducto
  document.getElementById('unidad').value              = p.unidadMedida || ''
  document.getElementById('descripcion').value         = p.descripcionProducto || ''
  document.getElementById('imagen-data').value         = ''
  document.getElementById('imagen-url-original').value = p.imagenUrl || ''
  const preview = document.getElementById('imagen-preview')
  if (p.imagenUrl) { preview.src = p.imagenUrl; preview.style.display = 'block' }
  else preview.style.display = 'none'
  document.getElementById('titulo-formulario').textContent = `Editando producto #${id}`
  document.getElementById('tarjeta-producto').style.display = 'block'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicion() {
  document.getElementById('formulario-producto').reset()
  document.getElementById('id-producto').value = ''
  document.getElementById('titulo-formulario').textContent = 'Editar producto'
  document.getElementById('tarjeta-producto').style.display = 'none'
  document.getElementById('imagen-preview').style.display = 'none'
  document.getElementById('imagen-data').value = ''
  document.getElementById('imagen-url-original').value = ''
}

function previsualizarImagenAdmin(input) {
  const file = input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 500
      let w = img.width, h = img.height
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else        { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.78)
      document.getElementById('imagen-data').value = dataUrl
      const preview = document.getElementById('imagen-preview')
      preview.src = dataUrl
      preview.style.display = 'block'
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

async function toggleEstado(id, estadoActual) {
  try {
    await cambiarEstadoProducto(id, !estadoActual)
    await cargarProductos()
  } catch (error) {
    mostrarNotificacion(document.getElementById('notificacion'), error.message, 'error')
  }
}

document.getElementById('formulario-producto').addEventListener('submit', async (evento) => {
  evento.preventDefault()
  const notif = document.getElementById('notificacion')
  const id    = document.getElementById('id-producto').value
  if (!id) return
  const datos = {
    codigoProducto:      document.getElementById('codigo').value,
    nombreProducto:      document.getElementById('nombre').value,
    idCategoria:         Number(document.getElementById('categoria').value),
    precioProducto:      Number(document.getElementById('precio').value),
    unidadMedida:        document.getElementById('unidad').value,
    imagenUrl:           document.getElementById('imagen-data').value ||
                         document.getElementById('imagen-url-original').value,
    descripcionProducto: document.getElementById('descripcion').value,
  }
  try {
    await editarProducto(Number(id), datos)
    mostrarNotificacion(notif, `Producto #${id} actualizado.`)
    cancelarEdicion()
    await cargarProductos()
  } catch (error) {
    mostrarNotificacion(notif, error.message, 'error')
  }
})

// ── PEDIDOS ───────────────────────────────────────────────────────────────────

async function cargarPedidos() {
  try {
    todosLosPedidos = await obtenerTodosPedidos()
    renderizarTablaPedidos(todosLosPedidos)
    construirDashboard()
  } catch (error) {
    console.error('Error al cargar pedidos:', error)
  }
}

function renderizarTablaPedidos(pedidos) {
  const cuerpo = document.getElementById('cuerpo-pedidos')
  if (!pedidos.length) {
    cuerpo.innerHTML = '<tr><td colspan="5" class="placeholder">No hay pedidos.</td></tr>'
    return
  }
  cuerpo.innerHTML = pedidos.map(p => `
    <tr>
      <td>#${p.idPedido}</td>
      <td>${p.idCliente}</td>
      <td>${p.estado}</td>
      <td>${formatearMoneda(p.total)}</td>
      <td>${new Date(p.fechaCreacion).toLocaleDateString('es-CO')}</td>
    </tr>
  `).join('')
}

function filtrarPedidos() {
  const idCliente  = document.getElementById('filtro-cliente').value.trim()
  const desde      = document.getElementById('filtro-fecha-desde').value
  const hasta      = document.getElementById('filtro-fecha-hasta').value
  const estado     = document.getElementById('filtro-estado').value

  const filtrados = todosLosPedidos.filter(p => {
    const fecha = new Date(p.fechaCreacion)
    return (
      (!idCliente || String(p.idCliente) === idCliente) &&
      (!desde     || fecha >= new Date(desde)) &&
      (!hasta     || fecha <= new Date(hasta + 'T23:59:59')) &&
      (!estado    || p.estado === estado)
    )
  })
  renderizarTablaPedidos(filtrados)
}

function limpiarFiltrosPedidos() {
  document.getElementById('filtro-cliente').value     = ''
  document.getElementById('filtro-fecha-desde').value = ''
  document.getElementById('filtro-fecha-hasta').value = ''
  document.getElementById('filtro-estado').value      = ''
  renderizarTablaPedidos(todosLosPedidos)
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

function construirDashboard() {
  const hoy  = new Date()
  const mesActual = hoy.getMonth()
  const anioActual = hoy.getFullYear()

  // Métricas numéricas
  const pedidosHoy = todosLosPedidos.filter(p => {
    const f = new Date(p.fechaCreacion)
    return f.toDateString() === hoy.toDateString()
  })
  const ingresosMes = todosLosPedidos
    .filter(p => {
      const f = new Date(p.fechaCreacion)
      return f.getMonth() === mesActual && f.getFullYear() === anioActual
    })
    .reduce((sum, p) => sum + Number(p.total || 0), 0)

  document.getElementById('m-pedidos-hoy').textContent   = pedidosHoy.length
  document.getElementById('m-ingresos-mes').textContent  = formatearMoneda(ingresosMes)
  document.getElementById('m-total-pedidos').textContent = todosLosPedidos.length

  // Gráfica: ventas por día (últimos 7 días)
  const etiquetasDias = []
  const ventasPorDia  = []
  for (let i = 6; i >= 0; i--) {
    const dia = new Date()
    dia.setDate(dia.getDate() - i)
    const etiqueta = dia.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
    etiquetasDias.push(etiqueta)
    const totalDia = todosLosPedidos
      .filter(p => new Date(p.fechaCreacion).toDateString() === dia.toDateString())
      .reduce((s, p) => s + Number(p.total || 0), 0)
    ventasPorDia.push(totalDia)
  }

  new Chart(document.getElementById('grafica-ventas-dia'), {
    type: 'bar',
    data: {
      labels: etiquetasDias,
      datasets: [{
        label: 'Ingresos (COP)',
        data: ventasPorDia,
        backgroundColor: '#D62828cc',
        borderRadius: 6,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => `$${v.toLocaleString('es-CO')}` } } },
    },
  })

  // Gráfica: top 5 productos más vendidos
  const conteoProductos = {}
  todosLosPedidos.forEach(pedido => {
    (pedido.items || []).forEach(item => {
      const nombre = item.nombreProducto
      conteoProductos[nombre] = (conteoProductos[nombre] || 0) + Number(item.cantidad || 0)
    })
  })

  const top5 = Object.entries(conteoProductos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  new Chart(document.getElementById('grafica-top-productos'), {
    type: 'doughnut',
    data: {
      labels: top5.map(([nombre]) => nombre),
      datasets: [{
        data: top5.map(([, cantidad]) => cantidad),
        backgroundColor: ['#D62828', '#FF9505', '#16a34a', '#2563eb', '#7c3aed'],
      }],
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
    },
  })
}

// ── ALERTAS DE STOCK BAJO ─────────────────────────────────────────────────────

async function verificarStockBajo() {
  try {
    const [existencias, productos] = await Promise.all([obtenerExistencias(), obtenerProductos()])
    const mapaProds = new Map(productos.map(p => [Number(p.idProducto), p.nombreProducto]))
    const bajos = existencias.filter(e => Number(e.cantidadTotal) < UMBRAL_STOCK_BAJO)

    if (bajos.length === 0) return

    const seccion = document.getElementById('seccion-alertas')
    const lista   = document.getElementById('lista-alertas')
    seccion.style.display = 'block'

    lista.innerHTML = bajos.map(e => {
      const cantidad = Number(e.cantidadTotal)
      const nombre   = mapaProds.get(Number(e.idProducto)) || `Producto #${e.idProducto}`
      const color    = cantidad === 0 ? '#ef4444' : '#f59e0b'
      const razon    = cantidad === 0
        ? 'Stock agotado — reponer urgente'
        : `Solo ${cantidad} unidad${cantidad !== 1 ? 'es' : ''} disponible${cantidad !== 1 ? 's' : ''} (umbral mínimo: ${UMBRAL_STOCK_BAJO})`
      return `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:10px 14px;
                    background:${color}12; border-left:4px solid ${color};
                    border-radius:6px; margin-bottom:8px; font-size:0.875rem;">
          <div>
            <div style="font-weight:700; margin-bottom:2px;">${nombre}</div>
            <div style="font-size:0.78rem; color:var(--texto-suave);">ID: ${e.idProducto} · ${razon}</div>
          </div>
          <span style="color:${color}; font-weight:700; white-space:nowrap; margin-left:12px;">
            ${cantidad === 0 ? 'AGOTADO' : cantidad + ' uds.'}
          </span>
        </div>
      `
    }).join('')
  } catch {
    // Si falla la carga, no mostrar alertas
  }
}
