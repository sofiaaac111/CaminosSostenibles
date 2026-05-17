package purchaseservice.routers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import purchaseservice.schemas.FormularioCompra;
import purchaseservice.schemas.DatosPedido;
import purchaseservice.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<DatosPedido> checkout(@RequestBody FormularioCompra request) {
        DatosPedido response = pedidoService.checkout(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<DatosPedido>> listarPedidosCliente(@PathVariable Long idCliente) {
        return ResponseEntity.ok(pedidoService.listarPorCliente(idCliente));
    }

    @GetMapping
    public ResponseEntity<List<DatosPedido>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }
}
