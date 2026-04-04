import { useEffect, useState } from 'react'

const estadoInicial = {
  codigoProducto: '',
  nombreProducto: '',
  descripcionProducto: '',
  categoriaProducto: '',
  precioProducto: '',
  unidadMedida: '',
  imagenUrl: '',
}

export function FormularioProducto({ onCrearProducto, onEditarProducto, productoEditar, cargando, codigoEscaneado = '' }) {
  const [formulario, setFormulario] = useState(estadoInicial)

  useEffect(() => {
    if (productoEditar) {
      setFormulario({
        codigoProducto: productoEditar.codigoProducto ?? '',
        nombreProducto: productoEditar.nombreProducto ?? '',
        descripcionProducto: productoEditar.descripcionProducto ?? '',
        categoriaProducto: productoEditar.categoriaProducto ?? '',
        precioProducto: productoEditar.precioProducto ?? '',
        unidadMedida: productoEditar.unidadMedida ?? '',
        imagenUrl: productoEditar.imagenUrl ?? '',
      })
    }
  }, [productoEditar])

  useEffect(() => {
    if (codigoEscaneado && !productoEditar) {
      setFormulario((previo) => ({ ...previo, codigoProducto: codigoEscaneado }))
    }
  }, [codigoEscaneado, productoEditar])

  function actualizarCampo(evento) {
    const { name, value } = evento.target
    setFormulario((previo) => ({ ...previo, [name]: value }))
  }

  function cargarImagen(evento) {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    const lector = new FileReader()
    lector.onload = () => {
      setFormulario((previo) => ({ ...previo, imagenUrl: String(lector.result) }))
    }
    lector.readAsDataURL(archivo)
  }

  async function enviarFormulario(evento) {
    evento.preventDefault()

    const datos = { ...formulario, precioProducto: Number(formulario.precioProducto) }

    if (productoEditar) {
      await onEditarProducto(productoEditar.idProducto, datos)
    } else {
      await onCrearProducto(datos)
      setFormulario(estadoInicial)
    }
  }

  return (
    <section className="panel tarjeta animar-entrada" style={{ animationDelay: '80ms' }}>
      <header className="panel-encabezado">
        <h2>{productoEditar ? `Editar producto #${productoEditar.idProducto}` : 'Registrar Producto'}</h2>
        <p>{productoEditar ? 'Modifica los campos y guarda los cambios.' : 'Se guarda en bd_productos a traves de product-service.'}</p>
      </header>

      <form className="formulario-grid" onSubmit={enviarFormulario}>
        <label>
          Codigo de barras
          <input
            name="codigoProducto"
            value={formulario.codigoProducto}
            onChange={actualizarCampo}
            inputMode="numeric"
            pattern="[0-9]{8,14}"
            title="Solo numeros, entre 8 y 14 digitos"
            required
          />
        </label>

        <label>
          Nombre del producto
          <input name="nombreProducto" value={formulario.nombreProducto} onChange={actualizarCampo} required />
        </label>

        <label>
          Categoria
          <input
            name="categoriaProducto"
            value={formulario.categoriaProducto}
            onChange={actualizarCampo}
            pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ ]+"
            title="Solo letras y espacios"
            required
          />
        </label>

        <label>
          Precio
          <input
            name="precioProducto"
            type="number"
            step="0.01"
            min="0"
            value={formulario.precioProducto}
            onChange={actualizarCampo}
            required
          />
        </label>

        <label>
          Unidad de medida
          <input
            name="unidadMedida"
            value={formulario.unidadMedida}
            onChange={actualizarCampo}
            pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ ]*"
            title="Solo letras y espacios"
          />
        </label>

        <label>
          URL de imagen
          <input
            name="imagenUrl"
            type="url"
            placeholder="https://..."
            value={formulario.imagenUrl}
            onChange={actualizarCampo}
          />
        </label>

        <label>
          O subir imagen
          <input type="file" accept="image/*" onChange={cargarImagen} />
        </label>

        {formulario.imagenUrl && (
          <div className="ancho-completo preview-imagen">
            <img src={formulario.imagenUrl} alt="Vista previa" />
          </div>
        )}

        <label className="ancho-completo">
          Descripcion
          <textarea name="descripcionProducto" value={formulario.descripcionProducto} onChange={actualizarCampo} rows={3} />
        </label>

        <button type="submit" className="boton-principal" disabled={cargando}>
          {cargando ? 'Guardando...' : productoEditar ? 'Actualizar producto' : 'Guardar producto'}
        </button>
      </form>
    </section>
  )
}
