# Guía de arranque — Arquitectura distribuida

El proyecto corre dividido entre **dos máquinas**:

| Máquina | Sistema operativo | Servicios |
|---|---|---|
| Tu Mac | macOS | frontend · customer-service · purchase-service |
| VM Ubuntu (Lima) | Ubuntu 22.04 | product-service · inventory-service |
| Railway (cloud) | Linux | 4 bases de datos MySQL |

---

## Orden de arranque

Siempre arranca primero Ubuntu, luego el Mac.

---

## 1. Arrancar Ubuntu (Lima)

### Abrir la VM

```bash
limactl start ubuntu-cs
limactl shell ubuntu-cs
```

### Iniciar Docker dentro de la VM

```bash
sudo service docker start
```

### Ir al proyecto y levantar los servicios

```bash
cd CaminosSostenibles
docker-compose up product-service inventory-service
```

Espera hasta ver estas dos líneas en los logs:
```
Started ProductServiceApplication in X seconds
Started InventoryServiceApplication in X seconds
```

> Deja esta terminal abierta con los logs corriendo.

---

## 2. Arrancar el Mac

Abre una **nueva terminal** en el Mac (sin cerrar la de Ubuntu).

### Ir al proyecto

```bash
cd /Users/sofiacorreales/Desktop/CaminosSostenibles-1
```

### Levantar los servicios del Mac

```bash
docker compose up frontend customer-service purchase-service
```

Espera hasta ver:
```
Started CustomerServiceApplication in X seconds
Started PurchaseServiceApplication in X seconds
```

### Abrir la aplicación

```
http://localhost:3000
```

---

## 3. Verificar que todo está corriendo

### En el Mac — confirmar sus servicios

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Debes ver: `frontend`, `customer-service`, `purchase-service`.

### En Ubuntu — confirmar sus servicios

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Debes ver: `product-service`, `inventory-service`.

### Prueba rápida desde el navegador

- El **catálogo** carga productos → `product-service` en Ubuntu responde ✓
- El **login** funciona → `customer-service` en Mac responde ✓

---

## 4. Si la VM cambia de IP

Los puertos 8081 y 8082 de la VM se reenvían al Mac a través de Lima automáticamente. El `nginx.conf` usa `host.docker.internal` para apuntar al Mac anfitrión, que luego reenvía a la VM — por eso no es necesario actualizar la IP manualmente.

Si algo falla, verifica que los puertos estén activos:

```bash
# En el Mac
curl http://localhost:8081/api/productos
curl http://localhost:8082/api/inventario/existencias
```

Si responden JSON, la comunicación entre máquinas está funcionando.

---

## 5. Apagar todo

### Primero el Mac

```bash
docker compose down
```

### Luego Ubuntu

```bash
# Dentro de la VM
docker-compose down

# Salir de la VM
exit

# Apagar la VM desde el Mac
limactl stop ubuntu-cs
```

---

## Cómo fluye una petición

```
Navegador
    │
    ▼
nginx (Docker · Mac · puerto 3000)
    ├── /api/clientes  ──► customer-service  (Docker · Mac · 8085)
    ├── /api/pedidos   ──► purchase-service  (Docker · Mac · 8086)
    ├── /api/productos ──► host.docker.internal:8081 ──► Lima ──► product-service   (Ubuntu · 8081)
    └── /api/inventario──► host.docker.internal:8082 ──► Lima ──► inventory-service (Ubuntu · 8082)
```
