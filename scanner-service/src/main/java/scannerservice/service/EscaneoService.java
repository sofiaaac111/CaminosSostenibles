package scannerservice.service;

import java.math.BigDecimal;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import scannerservice.client.ClienteInventario;
import scannerservice.client.ClienteProductos;
import scannerservice.dto.ExistenciaProductoDto;
import scannerservice.dto.ProductoResumenDto;

@Service
public class EscaneoService {

    @Autowired
    private ClienteInventario clienteInventario;

    @Autowired
    private ClienteProductos clienteProductos;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public String procesarVentaOnline(Long idProducto, BigDecimal cantidad) {
        ResponseEntity<String> respuesta = clienteInventario.reducirStock(idProducto, cantidad);
        if (respuesta.getStatusCode().is2xxSuccessful()) {
            actualizarEstadoProductoSegunStock(idProducto);
            rabbitTemplate.convertAndSend("cola-auditoria",
                    "venta_realizada:" + idProducto + ":cantidad=" + cantidad + ",canal=online");
            return "Venta online procesada exitosamente";
        }
        return "Error al procesar venta online: " + respuesta.getBody();
    }

    public String procesarEscaneo(String codigoBarras, String operacion, BigDecimal cantidad) {
        ProductoResumenDto producto;
        try {
            producto = clienteProductos.obtenerProductoPorCodigo(codigoBarras);
        } catch (Exception ex) {
            return "No existe un producto con ese codigo de barras";
        }

        if (producto == null || producto.getIdProducto() == null) {
            return "No existe un producto con ese codigo de barras";
        }
        Long idProducto = producto.getIdProducto();

        if ("venta".equals(operacion)) {
            ResponseEntity<String> respuesta = clienteInventario.reducirStock(idProducto, cantidad);
            if (respuesta.getStatusCode().is2xxSuccessful()) {
                actualizarEstadoProductoSegunStock(idProducto);
                rabbitTemplate.convertAndSend("cola-auditoria",
                        "venta_realizada:" + idProducto + ":cantidad=" + cantidad);
                return "Venta procesada exitosamente";
            } else {
                return "Error al procesar venta: " + respuesta.getBody();
            }
        }
        return "Operación no soportada";
    }

    private void actualizarEstadoProductoSegunStock(Long idProducto) {
        try {
            ExistenciaProductoDto existencia = clienteInventario.obtenerExistencia(idProducto);
            if (existencia == null || existencia.getCantidadTotal() == null
                    || existencia.getCantidadTotal().compareTo(BigDecimal.ZERO) <= 0) {
                clienteProductos.cambiarEstado(idProducto, false);
            }
        } catch (Exception ex) {
            // La venta ya fue procesada; no interrumpir por falla de sincronizacion de estado.
        }
    }
}
