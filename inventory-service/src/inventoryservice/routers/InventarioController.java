package inventoryservice.routers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import inventoryservice.models.ExistenciaProducto;
import inventoryservice.models.Lote;
import inventoryservice.service.InventarioService;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    @GetMapping("/existencias")
    public List<ExistenciaProducto> obtenerTodasLasExistencias() {
        return inventarioService.obtenerTodasLasExistencias();
    }

    @GetMapping("/existencias/{idProducto}")
    public ResponseEntity<ExistenciaProducto> obtenerExistencia(@PathVariable Long idProducto) {
        return inventarioService.obtenerExistenciaPorProducto(idProducto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lotes/{idProducto}")
    public List<Lote> obtenerLotesPorProducto(@PathVariable Long idProducto) {
        return inventarioService.obtenerLotesPorProducto(idProducto);
    }

    @PostMapping("/agregar-stock")
    public ResponseEntity<ExistenciaProducto> agregarStock(
            @RequestParam Long idProducto,
            @RequestParam String numeroLote,
            @RequestParam BigDecimal cantidad,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaVencimiento) {
        ExistenciaProducto existencia = inventarioService.agregarStock(idProducto, numeroLote, cantidad,
                fechaVencimiento);
        return ResponseEntity.ok(existencia);
    }

    @PostMapping("/reducir-stock")
    public ResponseEntity<String> reducirStock(@RequestParam Long idProducto,
            @RequestParam BigDecimal cantidad) {
        boolean exitoso = inventarioService.reducirStock(idProducto, cantidad);
        if (exitoso) {
            return ResponseEntity.ok("Stock reducido exitosamente");
        }
        return ResponseEntity.badRequest().body("Stock insuficiente o producto no encontrado");
    }

    @GetMapping("/lotes-por-vencer")
    public List<Lote> obtenerLotesPorVencer(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaLimite) {
        return inventarioService.obtenerLotesPorVencer(fechaLimite);
    }

    @PostMapping("/reservar")
    public ResponseEntity<Long> reservarStock(
            @RequestParam Long idProducto,
            @RequestParam BigDecimal cantidad,
            @RequestParam Long idCliente) {
        try {
            Long idReserva = inventarioService.reservarStock(idProducto, cantidad, idCliente);
            return ResponseEntity.ok(idReserva);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/confirmar-reserva")
    public ResponseEntity<String> confirmarReserva(@RequestParam Long idReserva) {
        try {
            inventarioService.confirmarReserva(idReserva);
            return ResponseEntity.ok("Reserva confirmada y stock descontado");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
