package com.supermarket.erp.purchaseservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.supermarket.erp.purchaseservice.dto.ProductoResumenDto;

@FeignClient(name = "product-service")
public interface ClienteProductos {

    @GetMapping("/api/productos/{id}")
    ProductoResumenDto obtenerProductoPorId(@PathVariable("id") Long id);
}
