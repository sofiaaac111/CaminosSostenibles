package purchaseservice.client;

import java.math.BigDecimal;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-service", url = "${inventory-service.url}")
public interface ClienteInventario {

    @PostMapping("/api/inventario/reducir-stock")
    ResponseEntity<String> reducirStock(@RequestParam Long idProducto,
                                        @RequestParam BigDecimal cantidad);

    @PostMapping("/api/inventario/reservar")
    Long reservarStock(@RequestParam Long idProducto,
                       @RequestParam BigDecimal cantidad,
                       @RequestParam Long idCliente);

    @PostMapping("/api/inventario/confirmar-reserva")
    ResponseEntity<String> confirmarReserva(@RequestParam Long idReserva);
}