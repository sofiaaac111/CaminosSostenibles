export function Notificacion({ mensaje, tipo = 'info' }) {
  if (!mensaje) return null

  return (
    <div className={`notificacion ${tipo}`} role="status">
      {mensaje}
    </div>
  )
}
