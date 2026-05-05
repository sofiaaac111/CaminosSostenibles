package customerservice.routers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import customerservice.schemas.FormularioActualizacion;
import customerservice.schemas.FormularioRegistro;
import customerservice.schemas.DatosCliente;
import customerservice.schemas.FormularioLogin;
import customerservice.models.Cliente;
import customerservice.service.ClienteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping("/registro")
    public ResponseEntity<DatosCliente> registrar(@Valid @RequestBody FormularioRegistro request) {
        Cliente cliente = clienteService.registrar(request);
        return ResponseEntity.ok(DatosCliente.fromEntity(cliente));
    }

    @PostMapping("/login")
    public ResponseEntity<DatosCliente> login(@Valid @RequestBody FormularioLogin request) {
        Cliente cliente = clienteService.login(request);
        return ResponseEntity.ok(DatosCliente.fromEntity(cliente));
    }

    @GetMapping("/{idCliente}")
    public ResponseEntity<DatosCliente> obtenerPorId(@PathVariable Long idCliente) {
        return clienteService.obtenerPorId(idCliente)
                .map(DatosCliente::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{idCliente}")
    public ResponseEntity<DatosCliente> actualizarPerfil(@PathVariable Long idCliente,
                                                            @Valid @RequestBody FormularioActualizacion request) {
        Cliente cliente = clienteService.actualizarPerfil(idCliente, request);
        return ResponseEntity.ok(DatosCliente.fromEntity(cliente));
    }
}
