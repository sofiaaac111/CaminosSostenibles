const UMBRAL_CRITICO = 5
const UMBRAL_BAJO    = 20

let scanner        = null
let mapaProductos  = new Map()   // idProducto → nombreProducto

// ── Carga inicial ─────────────────────────────────────────────────────────────
window.addEventListener('load', async () => {
  if (!verificarRol('ADMIN', 'BODEGUERO')) return

  // Cargar nombres de productos y categorías
  try {
    const [productos, categorias] = await Promise.all([obtenerProductos(), obtenerCategorias()])
    mapaProductos = new Map(productos.map(p => [Number(p.idProducto), p.nombreProducto]))
    const select = document.getElementById('nuevo-categoria')
    categorias.forEach(cat => {
      const op = document.createElement('option')
      op.value = cat.idCategoria
      op.textContent = cat.nombre
      select.appendChild(op)
    })
  } catch {}

  const treintaDias = new Date()
  treintaDias.setDate(treintaDias.getDate() + 30)
  document.getElementById('fecha-limite-vencer').value = treintaDias.toISOString().split('T')[0]

  cargarSemaforo()
})

// ── Nombre de producto por ID ─────────────────────────────────────────────────
function nombreProducto(id) {
  return mapaProductos.get(Number(id)) || `Producto #${id}`
}

// ── Scanner de código de barras ───────────────────────────────────────────────

function iniciarScanner() {
  if (scanner) return
  scanner = new Html5Qrcode('contenedor-scanner')
  scanner.start(
    { facingMode: 'environment' },
    { fps: 15, qrbox: { width: 280, height: 120 } },
    (codigoDetectado) => {
      document.getElementById('resultado-scanner').textContent =
        `Código detectado: ${codigoDetectado}`
      buscarProductoPorCodigo(codigoDetectado)
      detenerScanner()
    },
    () => {}
  ).catch(error => {
    document.getElementById('resultado-scanner').textContent =
      'No se pudo acceder a la cámara: ' + error
    scanner = null
  })
}

function detenerScanner() {
  if (!scanner) return
  scanner.stop().then(() => { scanner.clear(); scanner = null }).catch(() => { scanner = null })
}

async function buscarProductoPorCodigo(codigo) {
  try {
    const producto = await obtenerProductoPorCodigo(codigo)
    document.getElementById('id-producto-stock').value = producto.idProducto
    document.getElementById('resultado-scanner').textContent =
      `✓ Producto encontrado: ${producto.nombreProducto} (ID: ${producto.idProducto})`
    ocultarFormularioRegistro()
  } catch {
    // Producto no existe → mostrar formulario de registro
    document.getElementById('resultado-scanner').textContent =
      `Código ${codigo} no registrado. Completa el formulario para agregarlo al sistema.`
    mostrarFormularioRegistro(codigo)
  }
}

// ── Registro de nuevo producto desde bodega ───────────────────────────────────

function mostrarFormularioRegistro(codigo) {
  document.getElementById('nuevo-codigo').value = codigo
  document.getElementById('tarjeta-registro-producto')
    .scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function ocultarFormularioRegistro() {
  document.getElementById('formulario-nuevo-producto').reset()
}

async function registrarNuevoProducto(evento) {
  evento.preventDefault()
  const notif = document.getElementById('notificacion')
  const boton = evento.submitter
  boton.disabled = true
  boton.textContent = 'Registrando...'

  try {
    const datos = {
      codigoProducto:      document.getElementById('nuevo-codigo').value,
      nombreProducto:      document.getElementById('nuevo-nombre').value,
      idCategoria:         Number(document.getElementById('nuevo-categoria').value),
      precioProducto:      Number(document.getElementById('nuevo-precio').value),
      unidadMedida:        document.getElementById('nuevo-unidad').value,
      imagenUrl:           document.getElementById('nuevo-imagen').value,
      descripcionProducto: document.getElementById('nuevo-descripcion').value,
    }
    const producto = await crearProducto(datos)

    // Actualizar mapa local de nombres
    mapaProductos.set(Number(producto.idProducto), producto.nombreProducto)

    // Prellenar formulario de stock con el nuevo producto
    document.getElementById('id-producto-stock').value = producto.idProducto
    document.getElementById('resultado-scanner').textContent =
      `✓ Producto registrado: ${producto.nombreProducto} (ID: ${producto.idProducto}). Ahora ingresa el lote de stock.`

    mostrarNotificacion(notif, `Producto "${producto.nombreProducto}" registrado correctamente. Completa el stock a continuación.`)
    ocultarFormularioRegistro()
  } catch (error) {
    mostrarNotificacion(notif, error.message, 'error')
    boton.disabled = false
    boton.textContent = 'Registrar producto y continuar'
  }
}

// ── Formulario de ingreso de stock ────────────────────────────────────────────

document.getElementById('formulario-stock').addEventListener('submit', async (evento) => {
  evento.preventDefault()
  const notif = document.getElementById('notificacion')
  try {
    const resultado = await agregarStock(
      document.getElementById('id-producto-stock').value,
      document.getElementById('numero-lote').value,
      document.getElementById('cantidad-stock').value,
      document.getElementById('fecha-vencimiento').value
    )
    mostrarNotificacion(notif, `Lote registrado. Stock total: ${resultado.cantidadTotal}`)
    document.getElementById('formulario-stock').reset()
    await cargarSemaforo()
  } catch (error) {
    mostrarNotificacion(notif, error.message, 'error')
  }
})

// ── Semáforo de stock ─────────────────────────────────────────────────────────

async function cargarSemaforo() {
  try {
    const existencias = await obtenerExistencias()
    const cuerpo = document.getElementById('cuerpo-semaforo')

    if (!existencias.length) {
      cuerpo.innerHTML = '<tr><td colspan="3" class="placeholder">Sin datos de stock.</td></tr>'
      return
    }

    const ordenados = [...existencias].sort((a, b) => Number(a.cantidadTotal) - Number(b.cantidadTotal))

    cuerpo.innerHTML = ordenados.map(e => {
      const cantidad = Number(e.cantidadTotal)
      const nombre   = nombreProducto(e.idProducto)
      let color, icono, etiqueta
      if (cantidad <= UMBRAL_CRITICO) {
        color = '#ef4444'; icono = '🔴'; etiqueta = cantidad === 0 ? 'AGOTADO' : 'CRÍTICO'
      } else if (cantidad <= UMBRAL_BAJO) {
        color = '#f59e0b'; icono = '🟡'; etiqueta = 'BAJO'
      } else {
        color = '#16a34a'; icono = '🟢'; etiqueta = 'NORMAL'
      }
      return `
        <tr>
          <td><span style="color:${color}; font-weight:600;">${icono} ${etiqueta}</span></td>
          <td>
            <div style="font-weight:600;">${nombre}</div>
            <div style="font-size:0.78rem; color:var(--texto-suave);">ID: ${e.idProducto}</div>
          </td>
          <td style="font-weight:600; color:${color};">${cantidad}</td>
        </tr>
      `
    }).join('')
  } catch (error) {
    document.getElementById('cuerpo-semaforo').innerHTML =
      `<tr><td colspan="3" class="placeholder">Error: ${error.message}</td></tr>`
  }
}

// ── Lotes por vencer ──────────────────────────────────────────────────────────

async function cargarLotesPorVencer() {
  const fechaLimite = document.getElementById('fecha-limite-vencer').value
  if (!fechaLimite) { alert('Selecciona una fecha límite.'); return }

  const cuerpo = document.getElementById('cuerpo-lotes-vencer')
  try {
    const lotes = await obtenerLotesPorVencer(fechaLimite)
    if (!lotes.length) {
      cuerpo.innerHTML = '<tr><td colspan="5" class="placeholder">No hay lotes próximos a vencer.</td></tr>'
      return
    }

    const hoy = new Date()

    cuerpo.innerHTML = lotes.map(lote => {
      const fechaVence    = new Date(lote.fechaVencimiento)
      const diasRestantes = Math.ceil((fechaVence - hoy) / (1000 * 60 * 60 * 24))
      const nombre        = nombreProducto(lote.idProducto)
      let urgencia, color
      if (diasRestantes <= 7)       { urgencia = `🔴 ${diasRestantes} días`; color = '#ef4444' }
      else if (diasRestantes <= 15) { urgencia = `🟡 ${diasRestantes} días`; color = '#f59e0b' }
      else                          { urgencia = `🟢 ${diasRestantes} días`; color = '#16a34a' }

      return `
        <tr>
          <td>${lote.numeroLote}</td>
          <td>
            <div style="font-weight:600;">${nombre}</div>
            <div style="font-size:0.78rem; color:var(--texto-suave);">ID: ${lote.idProducto}</div>
          </td>
          <td>${lote.cantidadLote}</td>
          <td>${fechaVence.toLocaleDateString('es-CO')}</td>
          <td style="color:${color}; font-weight:600;">${urgencia}</td>
        </tr>
      `
    }).join('')
  } catch (error) {
    cuerpo.innerHTML = `<tr><td colspan="5" class="placeholder">Error: ${error.message}</td></tr>`
  }
}

// ── Historial de entradas por producto ────────────────────────────────────────

async function cargarHistorialProducto() {
  const idProducto = document.getElementById('id-producto-historial').value
  if (!idProducto) { alert('Ingresa el ID del producto.'); return }

  const cuerpo   = document.getElementById('cuerpo-historial')
  const titulo   = document.getElementById('titulo-historial')
  const nombre   = nombreProducto(idProducto)
  if (titulo) titulo.textContent = `Historial: ${nombre} (ID ${idProducto})`

  try {
    const lotes = await obtenerLotesProducto(idProducto)
    if (!lotes.length) {
      cuerpo.innerHTML = '<tr><td colspan="5" class="placeholder">Este producto no tiene lotes registrados.</td></tr>'
      return
    }
    cuerpo.innerHTML = lotes.map(lote => `
      <tr>
        <td>${lote.numeroLote}</td>
        <td>${lote.cantidadLote}</td>
        <td>${new Date(lote.fechaIngreso).toLocaleDateString('es-CO')}</td>
        <td>${new Date(lote.fechaVencimiento).toLocaleDateString('es-CO')}</td>
        <td style="font-weight:600;">${lote.cantidadLote}</td>
      </tr>
    `).join('')
  } catch (error) {
    cuerpo.innerHTML = `<tr><td colspan="5" class="placeholder">Error: ${error.message}</td></tr>`
  }
}
