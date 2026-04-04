package com.supermarket.erp.scannerservice.client;

import java.math.BigDecimal;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.supermarket.erp.scannerservice.dto.ExistenciaProductoDto;

@FeignClient(name = "inventory-service")
public interface ClienteInventario {

    @GetMapping("/api/inventario/existencias/{idProducto}")
    ExistenciaProductoDto obtenerExistencia(@PathVariable("idProducto") Long idProducto);

    @PostMapping("/api/inventario/reducir-stock")
    ResponseEntity<String> reducirStock(@RequestParam Long idProducto, @RequestParam BigDecimal cantidad);
}
