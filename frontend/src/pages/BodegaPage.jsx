import { useEffect, useState } from 'react'
import {
  buscarProductosPorNombre,
  cambiarEstadoProducto,
  crearProducto,
  editarProducto,
  listarProductos,
  registrarStock,
} from '../api/administradorApi'
import { Notificacion } from '../components/comunes/Notificacion'
import { LectorCodigoBarras } from '../components/bodega/LectorCodigoBarras'
import { FormularioStock } from '../components/inventario/FormularioStock'
import { FormularioProducto } from '../components/productos/FormularioProducto'

export function BodegaPage() {
  const [productos, setProductos] = useState([])
  const [codigoEscaneado, setCodigoEscaneado] = useState('')
  const [coincidencias, setCoincidencias] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('info')
  const [productoAEditar, setProductoAEditar] = useState(null)

  async function recargarProductos() {
    const data = await listarProductos()
    setProductos(data)
  }

  async function manejarCrearProducto(producto) {
    setCargando(true)
    try {
      const creado = await crearProducto(producto)
      setMensaje(`Producto registrado en bodega con ID ${creado.idProducto}.`)
      setTipoMensaje('ok')
      setCodigoEscaneado('')
      await recargarProductos()
    } catch (error) {
      setMensaje(`No se pudo registrar producto: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setCargando(false)
    }
  }

  async function manejarEditarProducto(idProducto, datos) {
    setCargando(true)
    try {
      await editarProducto(idProducto, datos)
      setMensaje(`Producto #${idProducto} actualizado correctamente.`)
      setTipoMensaje('ok')
      setProductoAEditar(null)
      await recargarProductos()
    } catch (error) {
      setMensaje(`No se pudo actualizar el producto: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setCargando(false)
    }
  }

  async function manejarRegistrarStock(datosStock) {
    setCargando(true)
    try {
      const respuesta = await registrarStock(datosStock)
      await cambiarEstadoProducto(datosStock.idProducto, true)
      setMensaje(`Lote registrado. Existencia actual: ${respuesta.cantidadTotal}.`)
      setTipoMensaje('ok')
    } catch (error) {
      setMensaje(`No se pudo registrar stock: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setCargando(false)
    }
  }

  async function buscarCoincidencias(nombre) {
    setCargando(true)
    try {
      const data = await buscarProductosPorNombre(nombre)
      setCoincidencias(data)
      if (data.length === 0) {
        setMensaje('No hay coincidencias en catalogo para ese nombre.')
        setTipoMensaje('info')
      } else {
        setMensaje('Coincidencias encontradas. Selecciona y registra stock por ID.')
        setTipoMensaje('ok')
      }
    } catch (error) {
      setCoincidencias([])
      setMensaje(`Error en busqueda: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    recargarProductos().catch(() => {
      setMensaje('No se pudo cargar el catalogo de productos.')
      setTipoMensaje('error')
    })
  }, [])

  return (
    <section className="vista-admin">
      <div className="intro animar-entrada">
        <h1>Panel de Bodega</h1>
        <p>Aqui se escanean codigos, se registran productos y se ingresa stock fisico por lotes.</p>
      </div>

      <Notificacion mensaje={mensaje} tipo={tipoMensaje} />

      <div className="rejilla-admin">
        <LectorCodigoBarras onCodigoDetectado={setCodigoEscaneado} />
        <FormularioProducto
          onCrearProducto={manejarCrearProducto}
          onEditarProducto={manejarEditarProducto}
          productoEditar={productoAEditar}
          cargando={cargando}
          codigoEscaneado={codigoEscaneado}
        />
        <FormularioStock onRegistrarStock={manejarRegistrarStock} cargando={cargando} />

        <section className="panel tarjeta animar-entrada" style={{ animationDelay: '220ms' }}>
          <header className="panel-encabezado">
            <h2>Buscar producto para ingreso de stock</h2>
            <p>Busca por nombre y obtén el ID para registrar lotes.</p>
          </header>

          <BuscadorNombre onBuscar={buscarCoincidencias} cargando={cargando} />

          {coincidencias.length > 0 && (
            <ul className="lista-bodega">
              {coincidencias.map((producto) => (
                <li key={producto.idProducto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>{producto.nombreProducto}</strong> · ID {producto.idProducto} · Codigo {producto.codigoProducto}</span>
                  <button
                    className="boton-secundario"
                    style={{ marginLeft: '1rem', padding: '4px 12px', fontSize: '0.82rem' }}
                    onClick={() => setProductoAEditar(producto)}
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="placeholder">Productos totales en catalogo: {productos.length}</p>
        </section>
      </div>
    </section>
  )
}

function BuscadorNombre({ onBuscar, cargando }) {
  const [nombre, setNombre] = useState('')

  async function enviar(evento) {
    evento.preventDefault()
    await onBuscar(nombre)
  }

  return (
    <form className="formulario-linea" onSubmit={enviar}>
      <input
        placeholder="Nombre del producto"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        required
      />
      <button className="boton-secundario" type="submit" disabled={cargando}>
        {cargando ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  )
}
