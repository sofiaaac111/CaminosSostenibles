# Caminos Sostenibles Market

Sistema ERP de supermercado basado en microservicios con Spring Boot y frontend en React.

---

## Levantar el proyecto

```bash
docker compose up --build
```
> Requiere Docker corriendo. Las bases de datos son remotas en Railway.
---

## URLs una vez levantado

### Acceso principal

| Interfaz           | URL                          |
|--------------------|------------------------------|
| **Frontend (web)** | http://localhost:3000        |
| Eureka Dashboard   | http://localhost:8761        |

### APIs REST y Swagger UI

| Servicio           | Puerto | Base URL                              | Swagger UI                                      |
|--------------------|--------|---------------------------------------|-------------------------------------------------|
| product-service    | 8081   | http://localhost:8081/api/productos   | http://localhost:8081/swagger-ui/index.html     |
| inventory-service  | 8082   | http://localhost:8082/api/inventario  | http://localhost:8082/swagger-ui/index.html     |
| audit-service      | 8083   | http://localhost:8083/api/auditoria   | http://localhost:8083/swagger-ui/index.html     |
| scanner-service    | 8084   | http://localhost:8084/api/escaneo     | http://localhost:8084/swagger-ui/index.html     |
| customer-service   | 8085   | http://localhost:8085/api/clientes    | http://localhost:8085/swagger-ui/index.html     |
| purchase-service   | 8086   | http://localhost:8086/api/pedidos     | http://localhost:8086/swagger-ui/index.html     |

---
## Endpoints por servicio

### product-service — `:8081/api/productos`
```
GET    /                          → listar todos
GET    /{id}                      → obtener por ID
GET    /codigo/{codigo}           → obtener por código de barras
GET    /buscar?nombre=            → buscar por nombre
POST   /                          → crear producto
PUT    /{id}                      → actualizar producto
PUT    /{id}/estado?activo=true   → activar/desactivar
DELETE /{id}                      → eliminar
```
### inventory-service — `:8082/api/inventario`
```
GET  /existencias                          → todas las existencias
GET  /existencias/{idProducto}             → existencia de un producto
GET  /lotes/{idProducto}                   → lotes del producto
POST /agregar-stock?idProducto=&numeroLote=&cantidad=&fechaVencimiento=
POST /reducir-stock?idProducto=&cantidad=
GET  /lotes-por-vencer?fechaLimite=        → lotes próximos a vencer
```
### audit-service — `:8083/api/auditoria`
```
GET /eventos                        → todos los eventos
GET /eventos/agregado/{idAgregado}  → eventos por agregado
GET /eventos/tipo/{tipoEvento}      → eventos por tipo
```
### scanner-service — `:8084/api/escaneo`
```
POST /         → escaneo en caja (codigoBarras, operacion, cantidad)
POST /ventas/online → venta online  (idProducto, cantidad)
```
### customer-service — `:8085/api/clientes`
```
POST /registro          → registrar cliente (body JSON)
POST /login             → iniciar sesión   (body JSON)
GET  /{idCliente}       → obtener perfil
PUT  /{idCliente}       → actualizar perfil (body JSON)
```
### purchase-service — `:8086/api/pedidos`
```
POST /checkout              → crear pedido (body JSON)
GET  /cliente/{idCliente}   → pedidos de un cliente
GET  /                      → listar todos los pedidos
```
---

## Rutas del frontend

| Ruta                  | Vista                        |
|-----------------------|------------------------------|
| `/admin`              | Panel de administración      |
| `/bodega`             | Gestión de inventario        |
| `/cliente/auth`       | Login / Registro de cliente  |
| `/cliente/catalogo`   | Catálogo de productos        |
| `/cliente/carrito`    | Carrito de compras           |
| `/cliente/checkout`   | Proceso de pago              |
| `/cliente/pedidos`    | Historial de pedidos         |
| `/cliente/cuenta`     | Perfil del cliente           |
---

## Arquitectura
```
Frontend (React)
    └── consume los 5 microservicios REST

eureka-server (8761)
    └── registro y descubrimiento de servicios

product-service  → catálogo de productos
inventory-service → stock y lotes con fecha de vencimiento
scanner-service  → escaneo de caja y ventas online (consume product + inventory via Feign)
customer-service → registro y autenticación de clientes
purchase-service → checkout y historial de pedidos
audit-service    → registro de eventos via RabbitMQ
```
---
## Stack tecnológico

| Capa            | Tecnología                            |
|-----------------|---------------------------------------|
| Backend         | Java 17, Spring Boot 3.2, Spring Cloud |
| Service Discovery | Netflix Eureka                      |
| HTTP entre servicios | OpenFeign                        |
| Mensajería      | RabbitMQ (guest/guest, puerto 5672)   |
| Base de datos   | MySQL 8 en Railway (remota)           |
| Frontend        | React 19, React Router 7, Vite 8     |
| Escaneo QR      | html5-qrcode                          |
| Animaciones     | GSAP                                  |
| Contenedores    | Docker + Docker Compose               |
| Servidor web    | Nginx (dentro del contenedor frontend)|
---

## Bases de datos (Railway)

Host: `tramway.proxy.rlwy.net:36355`
| Base de datos   | Servicio que la usa  |
|-----------------|----------------------|
| bd_productos    | product-service      |
| bd_inventario   | inventory-service    |
| bd_auditoria    | audit-service        |
| bd_clientes     | customer-service     |
| bd_pedidos      | purchase-service     |
---

## Estructura del repositorio
```
.
├── docker-compose.yml
├── pom.xml
├── eureka-server/
├── product-service/
├── inventory-service/
├── scanner-service/
├── audit-service/
├── customer-service/
├── purchase-service/
└── frontend/
```
---

## Guía de clases por microservicio

### Cómo están organizados los servicios

En tu editor, la ruta al código de cada servicio es:

```
product-service/src/main/java/productservice/
inventory-service/src/main/java/inventoryservice/
audit-service/src/main/java/auditservice/
scanner-service/src/main/java/scannerservice/
customer-service/src/main/java/customerservice/
purchase-service/src/main/java/purchaseservice/
```

> `src/main/java/` es una convención fija de Java que no se puede cambiar. El código real está en la carpeta con el nombre del servicio.

Dentro de cada una encontrarás siempre las mismas subcarpetas:

| Carpeta      | Equivalente Python  | Qué contiene                                      | Cuándo la tocas                              |
|--------------|---------------------|---------------------------------------------------|----------------------------------------------|
| `models/`    | `models.py`         | La forma de los datos (campos de la tabla en BD)  | Cuando agregas o cambias un campo            |
| `crud/`      | `crud.py`           | Cómo buscar datos en la BD                        | Cuando necesitas un nuevo tipo de búsqueda   |
| `service/`   | *(sin equivalente)* | Las reglas del negocio                            | Cuando cambias cómo funciona algo            |
| `routers/`   | `routers/`          | Los endpoints que recibe la API                   | Cuando agregas o modificas una ruta HTTP     |
| `schemas/`   | `schemas.py`        | Los datos que entran y salen por la API           | Cuando cambias qué campos recibe o devuelve  |
| `client/`    | *(sin equivalente)* | Llamadas a otros microservicios                   | Cuando conectas con otro servicio            |
| `config/`    | *(sin equivalente)* | Configuración de RabbitMQ                         | Casi nunca                                   |

**Flujo de una petición:**
```
Petición HTTP → routers → service → crud → base de datos
                                    ↓
                             (si necesita otro servicio)
                                  client → otro microservicio
```

---

### product-service — Gestión del catálogo de productos

#### `entity/Producto.java`
Representa la tabla `productos` en la BD. Cada campo es una columna.
Tiene validaciones: el código debe tener entre 8-14 dígitos, el nombre entre 2-120 caracteres, el precio debe ser positivo.
**Modificar si:** necesitas agregar un campo nuevo al producto (ej. marca, proveedor).

#### `repository/ProductoRepository.java`
Interface para acceder a la BD. Spring genera el SQL automáticamente.
Tiene dos métodos extra: buscar por `codigoProducto` y buscar por nombre (sin importar mayúsculas).
**Modificar si:** necesitas un nuevo tipo de búsqueda (ej. buscar por categoría).

#### `service/ProductoService.java`
Contiene toda la lógica de negocio. Los productos se crean con `activo=false` por defecto hasta que se activen manualmente.
Métodos: crear, actualizar, eliminar, buscar por nombre, buscar por código, activar/desactivar.
**Modificar si:** quieres cambiar alguna regla (ej. que los productos se creen activos por defecto, o agregar validaciones extra).

#### `controller/ProductoController.java`
Define los 8 endpoints REST de `/api/productos`. Recibe la petición HTTP, llama al service, devuelve la respuesta.
Tiene `@CrossOrigin("*")` para permitir llamadas desde el frontend.
**Modificar si:** necesitas agregar un nuevo endpoint o cambiar el path de uno existente.

---

### inventory-service — Control de stock y lotes

#### `entity/ExistenciaProducto.java`
Tabla `existencias_producto`. Guarda el total de stock disponible por producto (`idProducto`, `cantidadTotal`).
Es el número que se muestra como "stock disponible".
**Modificar si:** necesitas agregar más datos al resumen de stock (ej. stock mínimo de alerta).

#### `entity/Lote.java`
Tabla `lotes_producto`. Cada lote es una entrada de mercancía con su propio número, cantidad y fecha de vencimiento.
Un producto puede tener múltiples lotes.
**Modificar si:** necesitas guardar más información de cada lote (ej. proveedor, precio de compra).

#### `repository/ExistenciaProductoRepository.java`
Accede a la tabla de existencias. Tiene un método para buscar la existencia de un producto específico por su `idProducto`.
**Modificar si:** necesitas nuevas consultas sobre el stock total.

#### `repository/LoteRepository.java`
Accede a la tabla de lotes. Tiene una query personalizada que devuelve los lotes con stock > 0 ordenados por fecha de ingreso (para FIFO).
**Modificar si:** necesitas buscar lotes por otro criterio (ej. por fecha de vencimiento próxima).

#### `service/InventarioService.java`
Lógica del inventario. Dos operaciones importantes:
- `agregarStock`: crea un lote nuevo y suma al total de existencias. Publica un evento `"lote_creado"` a RabbitMQ.
- `reducirStock`: aplica FIFO (reduce primero del lote más antiguo con stock). Publica un evento `"inventario_reducido"`.
**Modificar si:** quieres cambiar la política de reducción (ej. de FIFO a FEFO por fecha de vencimiento).

#### `controller/InventarioController.java`
Define los 6 endpoints de `/api/inventario`.
**Modificar si:** necesitas un nuevo endpoint (ej. transferencia entre ubicaciones).

#### `configuracion/ConfiguracionRabbitMQ.java`
Declara la cola `"cola-auditoria"` como durable (sobrevive reinicios).
**Modificar si:** necesitas agregar más colas o exchanges de RabbitMQ.

---

### audit-service — Registro de eventos del sistema

#### `entity/EventoAuditoria.java`
Tabla `eventos_auditoria`. Guarda cada evento con: tipo de evento, ID del elemento afectado, contenido (detalle), y fecha/hora automática.
**Modificar si:** necesitas guardar más información en cada evento (ej. el usuario que lo ejecutó).

#### `repository/EventoAuditoriaRepository.java`
Permite buscar eventos por `idAgregado` (el ID del objeto afectado) o por `tipoEvento`.
**Modificar si:** necesitas nuevas formas de consultar el historial.

#### `service/EventoAuditoriaService.java`
Tiene dos responsabilidades:
1. Consultar eventos (para el controller).
2. `procesarMensaje`: escucha la cola `"cola-auditoria"` de RabbitMQ. Recibe mensajes con formato `"tipoEvento:idAgregado:contenido"` y los guarda en la BD.
**Modificar si:** cambias el formato del mensaje de RabbitMQ o agregas lógica antes de guardar el evento.

#### `controller/EventoAuditoriaController.java`
Define 3 endpoints de solo lectura en `/api/auditoria`. No hay creación manual de eventos: siempre vienen por RabbitMQ.
**Modificar si:** necesitas agregar filtros (ej. por rango de fechas).

#### `configuracion/ConfiguracionRabbitMQ.java`
Declara la cola `"cola-auditoria"`. Debe coincidir con la misma cola declarada en los otros servicios que publican eventos.
**Modificar si:** cambias el nombre de la cola (deberás cambiarlo en todos los servicios).

---

### scanner-service — Ventas en caja y ventas online

#### `dto/ProductoResumenDto.java`
Objeto que recibe cuando le pregunta al product-service por un producto. Solo tiene los campos que necesita: `idProducto`, `codigoProducto`, `nombreProducto`.
**Modificar si:** necesitas más datos del producto en el proceso de escaneo (ej. precio).

#### `dto/ExistenciaProductoDto.java`
Objeto que recibe del inventory-service con el stock disponible de un producto.
**Modificar si:** necesitas más campos del inventario en el proceso de venta.

#### `client/ClienteProductos.java`
Interface Feign que hace llamadas HTTP al `product-service`. Tiene dos métodos: buscar producto por código de barras y cambiar su estado.
**Modificar si:** necesitas llamar a más endpoints del product-service desde el scanner.

#### `client/ClienteInventario.java`
Interface Feign que hace llamadas HTTP al `inventory-service`. Obtiene el stock disponible y reduce el stock.
**Modificar si:** necesitas usar más endpoints del inventory-service desde el scanner.

#### `service/EscaneoService.java`
Lógica central del escáner:
- `procesarEscaneo`: busca el producto por código de barras, verifica stock, reduce inventario, publica evento a RabbitMQ. Si el operación es `"venta"`, descuenta del stock.
- `procesarVentaOnline`: igual pero recibe el `idProducto` directamente (sin código de barras).
- `actualizarEstadoProductoSegunStock` (privado): después de cada venta, si el stock llega a 0, desactiva el producto en el product-service.
**Modificar si:** quieres cambiar el comportamiento del escaneo (ej. agregar descuentos, cambiar qué operaciones se permiten).

#### `controller/EscaneoController.java`
Define 2 endpoints en `/api/escaneo`. El endpoint `/ventas/online` es el que usa el purchase-service para procesar compras web.
**Modificar si:** necesitas nuevos tipos de operación de escaneo.

#### `configuracion/ConfiguracionRabbitMQ.java`
Declara la cola `"cola-auditoria"` (igual que en los otros servicios) para poder publicar en ella.

---

### customer-service — Registro y autenticación de clientes

#### `entity/Cliente.java`
Tabla `clientes`. Campos: nombre, email (único), contraseña encriptada, ciudad, dirección, teléfono, activo, fechas de registro y actualización (se llenan automáticamente con `@PrePersist` / `@PreUpdate`).
**Modificar si:** necesitas guardar más datos del cliente (ej. fecha de nacimiento, tipo de cliente).

#### `repository/ClienteRepository.java`
Solo tiene un método extra: buscar cliente por email (para el login y para verificar que el email no se repita).
**Modificar si:** necesitas buscar clientes por otro campo.

#### `dto/ClienteRegistroRequest.java`
Los datos que debe enviar el frontend para registrar un cliente. Tiene validaciones: email válido, nombre no vacío.
**Modificar si:** quieres pedir más datos en el registro.

#### `dto/LoginRequest.java`
Los datos del login: solo email y contraseña.
**Modificar si:** quieres cambiar el método de autenticación.

#### `dto/ClienteActualizarRequest.java`
Los datos que puede actualizar un cliente: nombre, ciudad, dirección, teléfono. No puede cambiar email ni contraseña desde aquí.
**Modificar si:** quieres permitir actualizar más campos (ej. agregar cambio de contraseña).

#### `dto/ClienteResponse.java`
Lo que se devuelve al frontend cuando consulta un cliente. Nunca incluye la contraseña. Tiene un método estático `fromEntity(Cliente)` que convierte la entidad a este DTO.
**Modificar si:** quieres incluir más datos en la respuesta (ej. número de pedidos).

#### `service/ClienteService.java`
Lógica de registro y autenticación:
- `registrar`: verifica que el email no exista, encripta la contraseña con BCrypt antes de guardarla.
- `login`: busca el cliente por email, verifica la contraseña con BCrypt (`passwordEncoder.matches`).
- `actualizarPerfil`: actualiza solo los campos permitidos.
**Modificar si:** cambias la lógica de autenticación o el algoritmo de encriptación.

#### `controller/ClienteController.java`
Define los 4 endpoints de `/api/clientes`.
**Modificar si:** necesitas agregar un endpoint (ej. cambiar contraseña, eliminar cuenta).

#### `controller/GlobalExceptionHandler.java`
Captura errores globalmente. Si el service lanza `IllegalArgumentException` (ej. "email ya registrado"), devuelve un JSON de error en vez de un stacktrace. También formatea los errores de validación (`@Valid`) con código HTTP 422.
**Modificar si:** quieres personalizar el formato de los errores o capturar otros tipos de excepción.

---

### purchase-service — Checkout y historial de pedidos

#### `entity/Pedido.java`
Tabla `pedidos`. Cabecera del pedido: cliente, estado, método de pago, referencia de pago, total, dirección de entrega, fechas. Tiene una lista de items (`@OneToMany`).
**Modificar si:** necesitas guardar más datos del pedido (ej. código de descuento, envío).

#### `entity/PedidoItem.java`
Tabla `pedido_items`. Cada línea del pedido: producto, precio unitario al momento de compra, cantidad, subtotal. Al guardar el nombre y precio del producto en el item se asegura que el historial no cambie si el producto cambia de precio.
**Modificar si:** necesitas guardar más datos por item (ej. número de lote).

#### `repository/PedidoRepository.java`
Tiene un método para obtener los pedidos de un cliente ordenados del más reciente al más antiguo.
**Modificar si:** necesitas filtrar pedidos por estado o por rango de fechas.

#### `dto/CheckoutRequest.java`
Lo que envía el frontend al hacer checkout: cliente, método de pago, datos de tarjeta (titular, número, vencimiento, CVV), dirección de entrega, y la lista de items.
**Modificar si:** quieres agregar más datos al proceso de pago (ej. cupón de descuento).

#### `dto/CheckoutItemRequest.java`
Cada item del checkout: `idProducto` y `cantidad`.
**Modificar si:** necesitas enviar más datos por item (ej. notas especiales).

#### `dto/ProductoResumenDto.java`
Datos del producto que este servicio recibe del product-service: id, código, nombre, precio, si está activo.
**Modificar si:** necesitas más campos del producto en el proceso de checkout.

#### `dto/PedidoResponse.java` / `dto/PedidoItemResponse.java`
Lo que se devuelve al frontend al consultar pedidos. Incluye todos los datos del pedido y sus items.
**Modificar si:** quieres incluir más datos en la respuesta del pedido.

#### `client/ClienteProductos.java`
Llama al product-service para obtener los datos de un producto por su ID (para calcular el precio).
**Modificar si:** necesitas llamar a más endpoints del product-service.

#### `client/ClienteEscaneo.java`
Llama al scanner-service para procesar la venta online de cada item del pedido. Es el puente entre la compra web y el descuento de inventario.
**Modificar si:** necesitas cambiar cómo se comunica con el scanner-service.

#### `service/PedidoService.java`
Lógica del checkout:
1. Crea el pedido con estado `"PAGADO"`.
2. Genera una referencia de pago simulada `"SIM-" + UUID`.
3. Para cada item: consulta el producto, verifica que esté activo, llama al scanner-service para descontar el stock, guarda el precio actual del producto en el item.
4. Calcula el total y guarda todo.
**Modificar si:** quieres integrar un pasarela de pago real, aplicar descuentos, o cambiar el flujo del checkout.

#### `controller/PedidoController.java`
Define los 3 endpoints de `/api/pedidos`.
**Modificar si:** necesitas agregar endpoints (ej. cancelar pedido, cambiar estado).

#### `controller/GlobalExceptionHandler.java`
Igual que en customer-service: captura errores y los devuelve como JSON formateado.

---

### eureka-server — Registro de servicios

#### `EurekaServerApplication.java`
La única clase del servicio. `@EnableEurekaServer` es lo que lo convierte en servidor de descubrimiento. Todos los demás servicios se registran aquí al arrancar, y se encuentran entre sí por nombre (ej. `"product-service"`) sin necesidad de IPs fijas.
**No necesita modificaciones.**


### CLOUDFLARE
Cuando levantes con docker compose up, el túnel arranca solo. Para ver la URL que te asignó Cloudflare:
docker compose logs cloudflared