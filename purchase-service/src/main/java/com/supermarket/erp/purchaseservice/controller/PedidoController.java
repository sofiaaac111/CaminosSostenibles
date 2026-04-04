package com.supermarket.erp.purchaseservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.erp.purchaseservice.dto.CheckoutRequest;
import com.supermarket.erp.purchaseservice.dto.PedidoResponse;
import com.supermarket.erp.purchaseservice.service.PedidoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<PedidoResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        PedidoResponse response = pedidoService.checkout(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<PedidoResponse>> listarPedidosCliente(@PathVariable Long idCliente) {
        return ResponseEntity.ok(pedidoService.listarPorCliente(idCliente));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }
}
