# Caminos Sostenibles Market

Sistema ERP de gestión para un supermercado en línea, basado en microservicios con Spring Boot y frontend en HTML + CSS + JavaScript puro.

---

## Requisitos previos

- Docker Desktop corriendo
- Archivo `.env` en la raíz del proyecto (ver sección Variables de entorno)

---

## Arquitectura distribuida

El proyecto corre dividido entre dos máquinas físicas con sistemas operativos distintos:

| Máquina | Sistema operativo | Servicios |
|---|---|---|
| Mac (anfitrión) | macOS | frontend · customer-service · purchase-service |
| VM Ubuntu (Lima) | Ubuntu 22.04 | product-service · inventory-service |
| Railway (cloud) | Linux | 4 bases de datos MySQL |

> Ver [ARRANQUE.md](ARRANQUE.md) para el paso a paso detallado de cómo encender cada máquina.

---

## Cómo fluye una petición

```
Navegador
    │
    ▼
nginx  (Docker · Mac · :3000)
    ├── /api/clientes   ──► customer-service  (Docker · Mac · :8085)
    ├── /api/pedidos    ──► purchase-service  (Docker · Mac · :8086)
    ├── /api/productos  ──► host.docker.internal:8081 → Lima → product-service   (Ubuntu · :8081)
    └── /api/inventario ──► host.docker.internal:8082 → Lima → inventory-service (Ubuntu · :8082)
```

---

## Arranque rápido

### 1 — Primero en Ubuntu (Lima)

```bash
limactl start ubuntu-cs
limactl shell ubuntu-cs
sudo service docker start
cd CaminosSostenibles
docker-compose up product-service inventory-service
```

### 2 — Luego en el Mac

```bash
docker compose up frontend customer-service purchase-service
```

### 3 — Abrir la app

```
http://localhost:3000
```

Para ver el link HTTPS (acceso desde celular):

```bash
docker compose logs cloudflared
```

---

## Puertos

| Servicio           | Puerto | Máquina  | Descripción                     |
|--------------------|--------|----------|---------------------------------|
| **Frontend**       | 3000   | Mac      | Interfaz web (nginx)            |
| product-service    | 8081   | Ubuntu   | CRUD de productos y categorías  |
| inventory-service  | 8082   | Ubuntu   | Stock, lotes, reservas          |
| customer-service   | 8085   | Mac      | Registro, login, perfil, roles  |
| purchase-service   | 8086   | Mac      | Checkout e historial de pedidos |

---

## Páginas del frontend

| URL                               | Página              | Acceso          |
|-----------------------------------|---------------------|-----------------|
| http://localhost:3000             | Landing             | Todos           |
| http://localhost:3000/auth.html   | Login / Registro    | Clientes        |
| http://localhost:3000/login-admin.html | Acceso personal | Admin / Bodeguero |
| http://localhost:3000/catalogo.html | Catálogo con filtros | Cliente       |
| http://localhost:3000/carrito.html  | Carrito            | Cliente         |
| http://localhost:3000/checkout.html | Pago simulado      | Cliente         |
| http://localhost:3000/factura.html  | Factura de venta   | Cliente         |
| http://localhost:3000/pedidos.html  | Historial pedidos  | Cliente         |
| http://localhost:3000/perfil.html   | Mi perfil          | Cliente         |
| http://localhost:3000/admin.html    | Panel administrador | ADMIN          |
| http://localhost:3000/bodega.html   | Panel bodega       | ADMIN / BODEGUERO |

> El sistema redirige automáticamente según el rol al iniciar sesión. Un cliente no puede acceder a `/admin.html` ni `/bodega.html`.

---

## Roles de usuario

| Rol       | Acceso                                              |
|-----------|-----------------------------------------------------|
| CLIENTE   | Catálogo, carrito, checkout, pedidos, perfil        |
| BODEGUERO | Panel de bodega (semáforo, stock, lotes, escáner)   |
| ADMIN     | Panel administrador (dashboard, productos, pedidos) + bodega |

El rol se asigna en la base de datos. El registro público crea siempre un `CLIENTE`. Para crear un `ADMIN` o `BODEGUERO`, inserta directamente en la tabla `clientes` con el campo `rol` correspondiente.

---

## Endpoints por microservicio

### product-service — puerto 8081

```
GET    /api/productos                         → listar todos los productos
GET    /api/productos/{id}                    → obtener por ID
GET    /api/productos/codigo/{codigo}         → obtener por código de barras
GET    /api/productos/buscar?nombre=          → buscar por nombre
GET    /api/productos/categorias              → listar categorías disponibles
POST   /api/productos                         → crear producto
PUT    /api/productos/{id}                    → actualizar producto
PUT    /api/productos/{id}/estado?activo=true → activar o desactivar
DELETE /api/productos/{id}                    → eliminar
```

### inventory-service — puerto 8082

```
GET  /api/inventario/existencias                          → stock de todos los productos
GET  /api/inventario/existencias/{idProducto}             → stock de un producto
GET  /api/inventario/lotes/{idProducto}                   → lotes registrados de un producto
GET  /api/inventario/lotes-por-vencer?fechaLimite=        → lotes próximos a vencer
POST /api/inventario/agregar-stock?idProducto=&numeroLote=&cantidad=&fechaVencimiento=
POST /api/inventario/reducir-stock?idProducto=&cantidad=
POST /api/inventario/reservar?idProducto=&cantidad=&idCliente=   → reservar stock 10 min
POST /api/inventario/confirmar-reserva?idReserva=                → confirmar y descontar
```

> Al agregar stock a un producto inactivo, el sistema lo activa automáticamente llamando al product-service.

### customer-service — puerto 8085

```
POST /api/clientes/registro      → registrar cliente (rol CLIENTE por defecto)
POST /api/clientes/login         → iniciar sesión (devuelve rol)
GET  /api/clientes/{id}          → obtener datos del cliente
PUT  /api/clientes/{id}          → actualizar perfil
PUT  /api/clientes/{id}/password → cambiar contraseña
```

### purchase-service — puerto 8086

```
POST /api/pedidos/checkout       → crear pedido completo con reserva de stock
GET  /api/pedidos/cliente/{id}   → pedidos de un cliente
GET  /api/pedidos                → listar todos los pedidos (admin)
```

---

## Variables de entorno (.env)

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=tramway.proxy.rlwy.net
DB_PORT=36355
BD_USERNAME=root
DB_PASSWORD=tu_password_aqui
```

> El archivo `.env` está en `.gitignore` y nunca se sube al repositorio.

---

## Estructura del proyecto

```
CaminosSostenibles/
├── docker-compose.yml          ← orquesta todos los servicios + volúmenes hot-reload
├── pom.xml                     ← proyecto Maven raíz (padre de los 4 módulos)
├── .env                        ← credenciales (NO se sube a Git)
│
├── product-service/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── resources/
│   │   └── application.properties
│   └── src/productservice/
│       ├── models/             ← Producto, Categoria (entidades JPA)
│       ├── crud/               ← ProductoRepository, CategoriaRepository
│       ├── service/            ← ProductoService, CategoriaService (siembra 10 categorías)
│       └── routers/            ← ProductoController
│
├── inventory-service/
│   ├── resources/application.properties
│   └── src/inventoryservice/
│       ├── models/             ← ExistenciaProducto, Lote, ReservaStock
│       ├── crud/               ← repositorios con bloqueo pesimista (@Lock)
│       ├── service/            ← InventarioService (reservas, expiración, auto-activación)
│       └── routers/            ← InventarioController
│
├── customer-service/
│   ├── resources/application.properties
│   └── src/customerservice/
│       ├── models/             ← Cliente, Rol (enum: ADMIN, BODEGUERO, CLIENTE)
│       ├── schemas/            ← DatosCliente (incluye rol), FormularioRegistro, etc.
│       ├── crud/               ← ClienteRepository
│       ├── service/            ← ClienteService (BCrypt, roles)
│       └── routers/            ← ClienteController, GlobalExceptionHandler
│
├── purchase-service/
│   ├── resources/application.properties
│   └── src/purchaseservice/
│       ├── client/             ← ClienteProductos, ClienteInventario (Feign)
│       ├── models/             ← Pedido, PedidoItem
│       ├── schemas/            ← DatosPedido, FormularioCompra, etc.
│       ├── crud/               ← PedidoRepository
│       ├── service/            ← PedidoService (checkout con reserva de stock)
│       └── routers/            ← PedidoController, GlobalExceptionHandler
│
└── frontend/
    ├── Dockerfile              ← imagen nginx (3 líneas)
    ├── nginx.conf              ← proxy de APIs + resolver Docker DNS
    ├── css/estilos.css         ← sistema de diseño unificado
    ├── js/
    │   ├── api.js              ← todas las llamadas fetch + helpers de sesión y rol
    │   ├── auth.js             ← login/registro con redirect por rol
    │   ├── admin.js            ← dashboard, productos, pedidos, alertas de stock
    │   ├── bodega.js           ← semáforo, lotes, historial, escáner
    │   ├── catalogo.js         ← catálogo con sidebar de filtros y categorías
    │   ├── carrito.js          ← carrito con localStorage
    │   ├── checkout.js         ← simulación de pago → redirige a factura
    │   ├── pedidos.js          ← historial de pedidos del cliente
    │   └── perfil.js           ← perfil y cambio de contraseña
    └── *.html                  ← una página por vista (sin framework)
```

---

## Stack tecnológico

| Capa              | Tecnología                                    |
|-------------------|-----------------------------------------------|
| Backend           | Java 17, Spring Boot 3.2                      |
| Comunicación      | REST (HTTP), OpenFeign (purchase → otros)     |
| Base de datos     | MySQL 8 en Railway (4 bases independientes)   |
| Transacciones     | Spring @Transactional + bloqueo pesimista     |
| Seguridad         | BCrypt (contraseñas), roles en BD             |
| Frontend          | HTML5, CSS3, JavaScript ES2022 (fetch API)    |
| Servidor web      | Nginx (proxy inverso + archivos estáticos)    |
| Contenedores      | Docker + Docker Compose                       |
| HTTPS móvil       | Cloudflare Tunnel (cloudflared)               |
| Scanner códigos   | html5-qrcode (CDN)                            |
| Gráficas          | Chart.js (CDN)                                |

---

## Bases de datos en Railway

Host: `tramway.proxy.rlwy.net:36355`

| Base de datos | Servicio que la usa | Tablas principales                          |
|---------------|---------------------|---------------------------------------------|
| bd_productos  | product-service     | productos, categorias                       |
| bd_inventario | inventory-service   | existencias_producto, lotes, reservas_stock |
| bd_clientes   | customer-service    | clientes (con campo `rol`)                  |
| bd_pedidos    | purchase-service    | pedidos, pedido_items                       |

---

## Categorías de productos

Las categorías están preestablecidas en la base de datos y se siembran automáticamente al iniciar el `product-service`:

- Frutas y verduras · Lácteos y huevos · Carnes y pescados · Panadería y cereales
- Bebidas · Limpieza y hogar · Higiene personal · Snacks y dulces
- Congelados · Aceites y condimentos

---

## Acceso desde el celular

El celular requiere HTTPS para usar la cámara del escáner. Cloudflare genera el enlace automáticamente:

```bash
docker compose logs cloudflared
```

Busca: `https://algo-random.trycloudflare.com` y ábrelo en Safari (iPhone) o Chrome (Android).

---

## Conceptos clave para la sustentación

**Sistemas Distribuidos:**
- 4 microservicios independientes, cada uno con su propia base de datos (aislamiento total)
- Comunicación entre servicios vía HTTP usando OpenFeign (purchase-service llama a product-service e inventory-service)
- Orquestación con Docker Compose en red compartida `app-network` con DNS interno
- Nginx como proxy inverso: el frontend nunca habla directamente con los backends
- Resolver Docker (`127.0.0.11`) para que nginx resuelva nombres de servicios dinámicamente

**Sistemas Transaccionales:**
- `@Transactional` garantiza atomicidad en operaciones de inventario (todo o nada)
- Bloqueo pesimista (`@Lock(PESSIMISTIC_WRITE)`) en `reducirStock` evita doble venta simultánea
- Sistema de reservas temporales (10 min) previene inconsistencias durante el checkout
- Cada base de datos tiene esquema independiente — no hay joins entre servicios
- `@Scheduled` limpia reservas expiradas cada 60 segundos automáticamente

**Control de acceso:**
- Roles (ADMIN, BODEGUERO, CLIENTE) almacenados en la entidad `Cliente`
- El login devuelve el rol y el frontend redirige según corresponde
- Guards en JS verifican el rol antes de cargar cada página protegida
