import { useEffect, useState } from 'react'

export function PanelExistencias({
  onConsultarPorId,
  onBuscarPorNombre,
  onConsultarDesdeProducto,
  onLimpiar,
  cargando,
  existencia,
  productosEncontrados,
  productos,
}) {
  const [busqueda, setBusqueda] = useState('')

  const productoDeExistencia = existencia
    ? productos.find((producto) => producto.idProducto === existencia.idProducto)
    : null

  // Si la búsqueda por nombre devuelve un solo resultado, consultarlo automáticamente
  useEffect(() => {
    if (productosEncontrados.length === 1) {
      onConsultarDesdeProducto(productosEncontrados[0].idProducto)
    }
  }, [productosEncontrados])

  function manejarCambioBusqueda(evento) {
    const valor = evento.target.value
    setBusqueda(valor)
    if (!valor.trim()) {
      onLimpiar?.()
    }
  }

  async function manejarBusqueda(evento) {
    evento.preventDefault()
    if (!busqueda.trim()) return

    const esNumero = /^\d+$/.test(busqueda.trim())

    if (esNumero) {
      await onConsultarPorId(Number(busqueda))
    } else {
      await onBuscarPorNombre(busqueda.trim())
    }
  }

  return (
    <section className="panel tarjeta animar-entrada" style={{ animationDelay: '260ms' }}>
      <header className="panel-encabezado">
        <h2>Verificar Existencias</h2>
        <p>Escribe un ID (números) o un nombre de producto para buscar.</p>
      </header>

      <form className="formulario-linea" onSubmit={manejarBusqueda}>
        <input
          placeholder="ID del producto o nombre..."
          value={busqueda}
          onChange={manejarCambioBusqueda}
          required
        />
        <button type="submit" className="boton-secundario" disabled={cargando}>
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {productosEncontrados.length > 1 && (
        <div className="lista-coincidencias">
          <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--color-texto-suave)' }}>
            Varias coincidencias — selecciona un producto:
          </p>
          {productosEncontrados.map((producto) => (
            <button
              key={producto.idProducto}
              type="button"
              className="coincidencia"
              onClick={() => onConsultarDesdeProducto(producto.idProducto)}
            >
              {producto.nombreProducto} · ID {producto.idProducto}
            </button>
          ))}
        </div>
      )}

      <div className="resultado-json">
        {existencia ? (
          <div className="tarjeta-existencia">
            <p><strong>ID producto:</strong> {existencia.idProducto}</p>
            <p><strong>Producto:</strong> {productoDeExistencia?.nombreProducto || 'No encontrado en catalogo'}</p>
            <p><strong>Codigo:</strong> {productoDeExistencia?.codigoProducto || 'N/A'}</p>
            <p><strong>Cantidad total:</strong> {existencia.cantidadTotal}</p>
          </div>
        ) : (
          <p className="placeholder">Aqui veras el resultado de la consulta de existencias.</p>
        )}
      </div>
    </section>
  )
}
