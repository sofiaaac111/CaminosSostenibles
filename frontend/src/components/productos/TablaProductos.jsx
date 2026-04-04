export function TablaProductos({ productos, cargando, onRecargar }) {
  return (
    <section className="panel tarjeta animar-entrada" style={{ animationDelay: '140ms' }}>
      <header className="panel-encabezado panel-encabezado-flex">
        <div>
          <h2>Catalogo Actual</h2>
        </div>
        <button className="boton-secundario" onClick={onRecargar} disabled={cargando}>
          {cargando ? 'Actualizando...' : 'Refrescar'}
        </button>
      </header>

      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Unidad</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={7} className="vacio-tabla">
                  No hay productos aun. Registra el primero en el formulario.
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.idProducto}>
                  <td>{producto.idProducto}</td>
                  <td>
                    {producto.imagenUrl ? (
                      <img className="miniatura-producto" src={producto.imagenUrl} alt={producto.nombreProducto} />
                    ) : (
                      <span className="sin-imagen">Sin imagen</span>
                    )}
                  </td>
                  <td>{producto.codigoProducto}</td>
                  <td>{producto.nombreProducto}</td>
                  <td>{producto.categoriaProducto}</td>
                  <td>${Number(producto.precioProducto).toLocaleString('es-CO')}</td>
                  <td>{producto.unidadMedida || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
