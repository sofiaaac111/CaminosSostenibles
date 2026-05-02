package scannerservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import scannerservice.dto.ProductoResumenDto;

@FeignClient(name = "product-service")
public interface ClienteProductos {

    @GetMapping("/api/productos/codigo/{codigo}")
    ProductoResumenDto obtenerProductoPorCodigo(@PathVariable("codigo") String codigo);

    @PutMapping("/api/productos/{id}/estado")
    ProductoResumenDto cambiarEstado(@PathVariable("id") Long id, @RequestParam("activo") boolean activo);
}
