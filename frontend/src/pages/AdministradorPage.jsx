import { useEffect, useState } from 'react'
import {
  buscarProductosPorNombre,
  consultarExistencia,
  listarProductos,
  listarTodosPedidos,
} from '../api/administradorApi'
import { Notificacion } from '../components/comunes/Notificacion'
import { PanelExistencias } from '../components/inventario/PanelExistencias'
import { TablaProductos } from '../components/productos/TablaProductos'

export function AdministradorPage() {
  const [productos, setProductos] = useState([])
  const [coincidenciasNombre, setCoincidenciasNombre] = useState([])
  const [existenciaConsultada, setExistenciaConsultada] = useState(null)
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('info')
  const [tabAdmin, setTabAdmin] = useState('catalogo')
  const [ventas, setVentas] = useState([])
  const [cargandoVentas, setCargandoVentas] = useState(false)

  async function recargarProductos() {
    setCargandoProductos(true)
    try {
      const data = await listarProductos()
      setProductos(data)
      setMensaje('Catalogo actualizado correctamente.')
      setTipoMensaje('ok')
    } catch (error) {
      setMensaje(`No se pudieron listar productos: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setCargandoProductos(false)
    }
  }

  async function manejarConsultarExistencia(idProducto) {
    setProcesando(true)
    try {
      const data = await consultarExistencia(idProducto)
      setExistenciaConsultada(data)
      setMensaje('Existencia consultada correctamente.')
      setTipoMensaje('ok')
    } catch (error) {
      setExistenciaConsultada(null)
      setMensaje(`No se pudo consultar existencia: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setProcesando(false)
    }
  }

  async function manejarBuscarPorNombre(nombreProducto) {
    setProcesando(true)
    try {
      const data = await buscarProductosPorNombre(nombreProducto)
      setCoincidenciasNombre(data)
      if (data.length === 0) {
        setMensaje('No se encontraron productos con ese nombre.')
        setTipoMensaje('info')
      } else {
        setMensaje(`Se encontraron ${data.length} coincidencias.`)
        setTipoMensaje('ok')
      }
    } catch (error) {
      setCoincidenciasNombre([])
      setMensaje(`Error al buscar por nombre: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setProcesando(false)
    }
  }

  async function recargarVentas() {
    setCargandoVentas(true)
    try {
      const data = await listarTodosPedidos()
      setVentas(data)
    } catch (error) {
      setMensaje(`No se pudieron cargar las ventas: ${error.message}`)
      setTipoMensaje('error')
    } finally {
      setCargandoVentas(false)
    }
  }

  useEffect(() => {
    recargarProductos()
  }, [])

  function cambiarTab(tab) {
    setTabAdmin(tab)
    if (tab === 'ventas') recargarVentas()
    if (tab === 'catalogo') {
      setCoincidenciasNombre([])
      setExistenciaConsultada(null)
    }
  }

  return (
    <section className="vista-admin">
      <div className="intro animar-entrada">
        <h1>Panel Administrador</h1>
        <p>
          Aqui verificas el estado general del catalogo, el inventario y las ventas recientes.
        </p>
      </div>

      <Notificacion mensaje={mensaje} tipo={tipoMensaje} />

      <div className="tabs-vistas" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab${tabAdmin === 'catalogo' ? ' activo' : ''}`}
          onClick={() => cambiarTab('catalogo')}
        >
          Catálogo
        </button>
        <button
          className={`tab${tabAdmin === 'ventas' ? ' activo' : ''}`}
          onClick={() => cambiarTab('ventas')}
        >
          Ventas recientes
        </button>
      </div>

      {tabAdmin === 'catalogo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <PanelExistencias
            onConsultarPorId={manejarConsultarExistencia}
            onBuscarPorNombre={manejarBuscarPorNombre}
            onConsultarDesdeProducto={manejarConsultarExistencia}
            onLimpiar={() => { setCoincidenciasNombre([]); setExistenciaConsultada(null) }}
            cargando={procesando}
            existencia={existenciaConsultada}
            productosEncontrados={coincidenciasNombre}
            productos={productos}
          />
          <TablaProductos
            productos={productos}
            cargando={cargandoProductos}
            onRecargar={recargarProductos}
          />
        </div>
      )}

      {tabAdmin === 'ventas' && (
        <div className="panel-ventas">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Ventas recientes</h2>
            <button className="boton-secundario" onClick={recargarVentas} disabled={cargandoVentas}>
              {cargandoVentas ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
          {cargandoVentas ? (
            <p>Cargando ventas...</p>
          ) : ventas.length === 0 ? (
            <p>No hay ventas registradas.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tabla-ventas">
                <thead>
                  <tr>
                    <th># Pedido</th>
                    <th>Cliente ID</th>
                    <th>Fecha</th>
                    <th>Método de pago</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.idPedido}>
                      <td>{v.idPedido}</td>
                      <td>{v.idCliente}</td>
                      <td>{v.fechaCreacion ? new Date(v.fechaCreacion).toLocaleString('es-CO') : '—'}</td>
                      <td>{v.metodoPago}</td>
                      <td>${Number(v.total).toLocaleString('es-CO')} {v.moneda}</td>
                      <td>
                        <span className={`estado-badge estado-${v.estado?.toLowerCase()}`}>
                          {v.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
