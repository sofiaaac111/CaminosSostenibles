package customerservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import customerservice.dto.ClienteActualizarRequest;
import customerservice.dto.ClienteRegistroRequest;
import customerservice.dto.ClienteResponse;
import customerservice.dto.LoginRequest;
import customerservice.entity.Cliente;
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
    public ResponseEntity<ClienteResponse> registrar(@Valid @RequestBody ClienteRegistroRequest request) {
        Cliente cliente = clienteService.registrar(request);
        return ResponseEntity.ok(ClienteResponse.fromEntity(cliente));
    }

    @PostMapping("/login")
    public ResponseEntity<ClienteResponse> login(@Valid @RequestBody LoginRequest request) {
        Cliente cliente = clienteService.login(request);
        return ResponseEntity.ok(ClienteResponse.fromEntity(cliente));
    }

    @GetMapping("/{idCliente}")
    public ResponseEntity<ClienteResponse> obtenerPorId(@PathVariable Long idCliente) {
        return clienteService.obtenerPorId(idCliente)
                .map(ClienteResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{idCliente}")
    public ResponseEntity<ClienteResponse> actualizarPerfil(@PathVariable Long idCliente,
                                                            @Valid @RequestBody ClienteActualizarRequest request) {
        Cliente cliente = clienteService.actualizarPerfil(idCliente, request);
        return ResponseEntity.ok(ClienteResponse.fromEntity(cliente));
    }
}
