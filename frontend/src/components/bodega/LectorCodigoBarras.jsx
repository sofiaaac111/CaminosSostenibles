import { useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const ID_LECTOR = 'lector-codigo-barras'
const FORMATOS_BARRAS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.QR_CODE,
]

export function LectorCodigoBarras({ onCodigoDetectado }) {
  const lectorRef = useRef(null)
  const [activo, setActivo] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const urlHttpsSugerida = `https://${window.location.host}${window.location.pathname}`

  async function iniciarLector() {
    if (activo) return

    try {
      // Verificar que el contenedor existe
      const contenedor = document.getElementById(ID_LECTOR)
      if (!contenedor) {
        setMensaje('Error: Contenedor de cámara no encontrado.')
        return
      }

      const lector = new Html5Qrcode(ID_LECTOR, {
        formatsToSupport: FORMATOS_BARRAS,
      })
      lectorRef.current = lector

      await lector.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 260, height: 160 } },
        (textoDetectado) => {
          onCodigoDetectado(textoDetectado)
          setMensaje(`Codigo detectado: ${textoDetectado}`)
          detenerLector()
        },
        (errorMsg) => {
          // Manejador de errores durante el escaneo
          console.error('Error en escaneo:', errorMsg)
        }
      )

      setActivo(true)
      setMensaje('Camara activa. Enfoca el codigo de barras.')
    } catch (error) {
      const mensajeError = error?.message || String(error) || 'Error desconocido'
      
      // Mensajes más claros según el tipo de error
      if (mensajeError.includes('NotAllowedError') || mensajeError.includes('Permission')) {
        setMensaje('Permiso de cámara denegado. Ve a Configuración > Safari > Cámara y actívalo.')
      } else if (mensajeError.includes('NotFoundError') || mensajeError.includes('no camera')) {
        setMensaje('No se encontró cámara en el dispositivo.')
      } else if (mensajeError.includes('NotSupportedError')) {
        setMensaje('Tu navegador no soporta acceso a cámara. Usa Safari o Chrome.')
      } else if (mensajeError.toLowerCase().includes('stream') || mensajeError.toLowerCase().includes('supported')) {
        setMensaje(`Streaming de camara no soportado en este navegador. Prueba por HTTPS: ${urlHttpsSugerida}`)
      } else if (mensajeError.toLowerCase().includes('secure context') || mensajeError.toLowerCase().includes('https')) {
        setMensaje(`iPhone requiere contexto seguro para camara en vivo. Abre por HTTPS: ${urlHttpsSugerida}`)
      } else {
        setMensaje(`No se pudo iniciar la cámara: ${mensajeError}`)
      }
      
      console.error('Error iniciar cámara:', error)
    }
  }

  async function detenerLector() {
    if (!lectorRef.current) return

    try {
      await lectorRef.current.stop()
      await lectorRef.current.clear()
    } catch (_) {
      // Ignorar errores de cierre del lector
    }

    lectorRef.current = null
    setActivo(false)
  }

  return (
    <section className="panel tarjeta animar-entrada" style={{ animationDelay: '60ms' }}>
      <header className="panel-encabezado">
        <h2>Escaneo con celular</h2>
        <p>Permite leer el codigo de barras usando la camara del dispositivo.</p>
      </header>

      <div className="acciones-lector">
        <button
          type="button"
          className="boton-principal"
          onClick={iniciarLector}
          disabled={activo}
        >
          Iniciar camara
        </button>
      </div>

      <div className="contenedor-lector-wrapper">
        <div id={ID_LECTOR} className="contenedor-lector" />
      </div>
      {mensaje && <p className="mensaje-lector">{mensaje}</p>}
    </section>
  )
}
