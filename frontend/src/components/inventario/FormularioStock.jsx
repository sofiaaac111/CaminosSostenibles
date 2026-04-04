import { useState } from 'react'

const estadoInicial = {
  idProducto: '',
  numeroLote: '',
  cantidad: '',
  fechaVencimiento: '',
}

export function FormularioStock({ onRegistrarStock, cargando }) {
  const [formulario, setFormulario] = useState(estadoInicial)

  function actualizarCampo(evento) {
    const { name, value } = evento.target
    setFormulario((previo) => ({ ...previo, [name]: value }))
  }

  async function enviarFormulario(evento) {
    evento.preventDefault()

    await onRegistrarStock({
      idProducto: Number(formulario.idProducto),
      numeroLote: formulario.numeroLote,
      cantidad: Number(formulario.cantidad),
      fechaVencimiento: formulario.fechaVencimiento,
    })

    setFormulario(estadoInicial)
  }

  return (
    <section className="panel tarjeta animar-entrada" style={{ animationDelay: '200ms' }}>
      <header className="panel-encabezado">
        <h2>Registrar Stock Fisico</h2>
        <p>Simula entrada de mercancia por lote para inventory-service.</p>
      </header>

      <form className="formulario-grid" onSubmit={enviarFormulario}>
        <label>
          ID del producto
          <input name="idProducto" type="number" min="1" value={formulario.idProducto} onChange={actualizarCampo} required />
        </label>

        <label>
          Numero de lote
          <input name="numeroLote" value={formulario.numeroLote} onChange={actualizarCampo} required />
        </label>

        <label>
          Cantidad
          <input name="cantidad" type="number" step="0.01" min="0.01" value={formulario.cantidad} onChange={actualizarCampo} required />
        </label>

        <label>
          Fecha de vencimiento
          <input
            name="fechaVencimiento"
            type="date"
            value={formulario.fechaVencimiento}
            onChange={actualizarCampo}
            required
          />
        </label>

        <button type="submit" className="boton-principal" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrar lote'}
        </button>
      </form>
    </section>
  )
}
