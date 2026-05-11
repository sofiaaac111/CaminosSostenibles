window.addEventListener('load', async () => {
  const sesion = verificarSesion()
  await cargarPedidos(sesion.idCliente)
})

async function cargarPedidos(idCliente) {
  const lista = document.getElementById('lista-pedidos')
  try {
    const pedidos = await obtenerPedidosCliente(idCliente)

    if (pedidos.length === 0) {
      lista.innerHTML = '<p class="placeholder">Aún no tienes pedidos.</p>'
      return
    }

    const pasos = ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO']

    lista.innerHTML = pedidos.map(pedido => {
      const indiceEstado = Math.max(0, pasos.indexOf(pedido.estado))

      const stepper = pasos.map((paso, i) => `
        <div style="display:flex; align-items:center; gap:2px;">
          <div style="
            width:22px; height:22px; border-radius:50%; font-size:0.65rem; font-weight:700;
            display:flex; align-items:center; justify-content:center;
            background:${i <= indiceEstado ? '#16a34a' : '#e5e7eb'};
            color:${i <= indiceEstado ? '#fff' : '#9ca3af'};">
            ${i <= indiceEstado ? '✓' : i + 1}
          </div>
          <span style="font-size:0.65rem; color:${i === indiceEstado ? '#16a34a' : '#9ca3af'}; white-space:nowrap;">
            ${paso.replace('_', ' ')}
          </span>
          ${i < pasos.length - 1 ? `<div style="width:10px; height:2px; background:${i < indiceEstado ? '#16a34a' : '#e5e7eb'};"></div>` : ''}
        </div>
      `).join('')

      const items = (pedido.items || []).map(a =>
        `<p style="font-size:0.82rem; padding:2px 0;">${a.nombreProducto} × ${a.cantidad} = ${formatearMoneda(a.subtotal)}</p>`
      ).join('')

      return `
        <div class="tarjeta" style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
            <div>
              <strong>Pedido #${pedido.idPedido}</strong>
              <p class="meta">${new Date(pedido.fechaCreacion).toLocaleString('es-CO')}</p>
            </div>
            <strong>${formatearMoneda(pedido.total)}</strong>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:2px; margin:12px 0;">
            ${stepper}
          </div>

          <details>
            <summary style="cursor:pointer; font-size:0.85rem; color:var(--texto-suave);">Ver productos</summary>
            <div style="margin-top:8px;">${items}</div>
          </details>

          <button class="boton-secundario" style="margin-top:8px; font-size:0.8rem;"
            onclick="imprimirRecibo(${JSON.stringify(JSON.stringify(pedido))})">
            Descargar recibo
          </button>
        </div>
      `
    }).join('')
  } catch (error) {
    lista.innerHTML = `<p class="placeholder">Error al cargar pedidos: ${error.message}</p>`
  }
}

function imprimirRecibo(jsonStr) {
  const pedido = JSON.parse(jsonStr)
  const ventana = window.open('', '_blank')
  ventana.document.write(`
    <!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"><title>Recibo #${pedido.idPedido}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:2rem;max-width:500px;margin:0 auto}
      table{width:100%;border-collapse:collapse;margin:1rem 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}
      .total{font-weight:bold;margin-top:1rem}
      button{padding:8px 16px;background:#D62828;color:white;border:none;border-radius:4px;cursor:pointer;margin-top:1rem}
      @media print{button{display:none}}
    </style></head><body>
    <h2>Caminos Sostenibles Market</h2>
    <p><strong>Pedido #${pedido.idPedido}</strong></p>
    <p>Fecha: ${new Date(pedido.fechaCreacion).toLocaleString('es-CO')}</p>
    <p>Estado: ${pedido.estado}</p>
    <table>
      <thead><tr><th>Producto</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
      <tbody>
        ${(pedido.items || []).map(a => `
          <tr><td>${a.nombreProducto}</td><td>${a.cantidad}</td>
          <td>$${Number(a.subtotal).toLocaleString('es-CO')}</td></tr>
        `).join('')}
      </tbody>
    </table>
    <p class="total">Total: $${Number(pedido.total).toLocaleString('es-CO')} ${pedido.moneda || 'COP'}</p>
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
    </body></html>
  `)
  ventana.document.close()
}
