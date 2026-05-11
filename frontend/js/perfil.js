window.addEventListener('load', async () => {
  const sesion = verificarSesion()
  try {
    const cliente = await obtenerCliente(sesion.idCliente)
    document.getElementById('perfil-nombre').value    = cliente.nombre || ''
    document.getElementById('perfil-email').value     = cliente.email || ''
    document.getElementById('perfil-ciudad').value    = cliente.ciudad || ''
    document.getElementById('perfil-telefono').value  = cliente.telefono || ''
    document.getElementById('perfil-direccion').value = cliente.direccion || ''
  } catch (error) {
    mostrarNotificacion(document.getElementById('notificacion'), 'Error al cargar perfil: ' + error.message, 'error')
  }
})

function toggleFormularioContrasena() {
  const form = document.getElementById('form-contrasena')
  form.style.display = form.style.display === 'none' ? 'grid' : 'none'
  if (form.style.display === 'none') {
    form.reset()
  }
}

async function guardarPerfil(evento) {
  evento.preventDefault()
  const sesion = obtenerSesion()
  const notif  = document.getElementById('notificacion')

  try {
    const actualizado = await actualizarCliente(sesion.idCliente, {
      nombre:    document.getElementById('perfil-nombre').value,
      ciudad:    document.getElementById('perfil-ciudad').value,
      telefono:  document.getElementById('perfil-telefono').value,
      direccion: document.getElementById('perfil-direccion').value,
    })
    guardarSesion(actualizado)
    mostrarNotificacion(notif, 'Perfil actualizado correctamente.')
  } catch (error) {
    mostrarNotificacion(notif, error.message, 'error')
  }
}

async function cambiarContrasenaUsuario(evento) {
  evento.preventDefault()
  const sesion = obtenerSesion()
  const notif  = document.getElementById('notificacion')

  const actual       = document.getElementById('pass-actual').value
  const nueva        = document.getElementById('pass-nueva').value
  const confirmacion = document.getElementById('pass-confirmar').value

  if (nueva !== confirmacion) {
    mostrarNotificacion(notif, 'Las contraseñas nuevas no coinciden.', 'error')
    return
  }
  if (nueva.length < 6) {
    mostrarNotificacion(notif, 'La nueva contraseña debe tener al menos 6 caracteres.', 'error')
    return
  }

  try {
    await cambiarContrasena(sesion.idCliente, actual, nueva)
    mostrarNotificacion(notif, 'Contraseña actualizada correctamente.')
    toggleFormularioContrasena()
  } catch (error) {
    mostrarNotificacion(notif, error.message, 'error')
  }
}
