window.addEventListener('load', () => {
  const sesion = obtenerSesion()
  if (sesion) {
    if (sesion.rol === 'ADMIN') window.location.href = '/admin.html'
    else if (sesion.rol === 'BODEGUERO') window.location.href = '/bodega.html'
    else window.location.href = '/catalogo.html'
  }
})

function mostrarLogin() {
  document.getElementById('form-login').style.display = 'grid'
  document.getElementById('form-registro').style.display = 'none'
  document.getElementById('tab-login').className = 'boton-principal'
  document.getElementById('tab-registro').className = 'boton-secundario'
}

function mostrarRegistro() {
  document.getElementById('form-login').style.display = 'none'
  document.getElementById('form-registro').style.display = 'grid'
  document.getElementById('tab-login').className = 'boton-secundario'
  document.getElementById('tab-registro').className = 'boton-principal'
}

async function manejarLogin(evento) {
  evento.preventDefault()
  const notif = document.getElementById('notificacion')
  const email    = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value

  try {
    const cliente = await iniciarSesion(email, password)
    guardarSesion(cliente)
    if (cliente.rol === 'ADMIN') window.location.href = '/admin.html'
    else if (cliente.rol === 'BODEGUERO') window.location.href = '/bodega.html'
    else window.location.href = '/catalogo.html'
  } catch (error) {
    mostrarNotificacion(notif, error.message, 'error')
  }
}

async function manejarRegistro(evento) {
  evento.preventDefault()
  const notif = document.getElementById('notificacion')

  const datos = {
    nombre:    document.getElementById('reg-nombre').value,
    email:     document.getElementById('reg-email').value,
    password:  document.getElementById('reg-password').value,
    ciudad:    document.getElementById('reg-ciudad').value,
    telefono:  document.getElementById('reg-telefono').value,
    direccion: document.getElementById('reg-direccion').value,
  }

  try {
    const cliente = await registrarCliente(datos)
    guardarSesion(cliente)
    window.location.href = '/catalogo.html'
  } catch (error) {
    mostrarNotificacion(notif, error.message, 'error')
  }
}
