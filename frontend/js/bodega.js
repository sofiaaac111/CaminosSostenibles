const UMBRAL_CRITICO = 5
const UMBRAL_BAJO    = 20

let scanner = null

// ── Carga inicial ─────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  if (!verificarRol('ADMIN', 'BODEGUERO')) return

  const treintaDias = new Date()
  treintaDias.setDate(treintaDias.getDate() + 30)
  document.getElementById('fecha-limite-vencer').value = treintaDias.toISOString().split('T')[0]

  cargarSemaforo()
})

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
      `✓ Producto: ${producto.nombreProducto} (ID: ${producto.idProducto})`
  } catch {
    document.getElementById('resultado-scanner').textContent =
      `No se encontró producto con código ${codigo}`
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

    // Ordenar: primero los críticos, luego bajos, luego normales
    const ordenados = [...existencias].sort((a, b) => Number(a.cantidadTotal) - Number(b.cantidadTotal))

    cuerpo.innerHTML = ordenados.map(e => {
      const cantidad = Number(e.cantidadTotal)
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
          <td>${e.idProducto}</td>
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

    const hoy    = new Date()
    const limite = new Date(fechaLimite)

    cuerpo.innerHTML = lotes.map(lote => {
      const fechaVence = new Date(lote.fechaVencimiento)
      const diasRestantes = Math.ceil((fechaVence - hoy) / (1000 * 60 * 60 * 24))
      let urgencia, color
      if (diasRestantes <= 7)  { urgencia = `🔴 ${diasRestantes} días`; color = '#ef4444' }
      else if (diasRestantes <= 15) { urgencia = `🟡 ${diasRestantes} días`; color = '#f59e0b' }
      else                     { urgencia = `🟢 ${diasRestantes} días`; color = '#16a34a' }

      return `
        <tr>
          <td>${lote.numeroLote}</td>
          <td>${lote.idProducto}</td>
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

  const cuerpo = document.getElementById('cuerpo-historial')
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
