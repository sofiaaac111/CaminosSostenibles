package purchaseservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import purchaseservice.schemas.ResumenProducto;

@FeignClient(name = "product-service", url = "http://host.docker.internal:8081")
public interface ClienteProductos {

    @GetMapping("/api/productos/{id}")
    ResumenProducto obtenerProductoPorId(@PathVariable("id") Long id);
}
