package purchaseservice.client;

import java.math.BigDecimal;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "scanner-service")
public interface ClienteEscaneo {

    @PostMapping("/api/escaneo/ventas/online")
    String venderOnline(@RequestParam("idProducto") Long idProducto,
                        @RequestParam("cantidad") BigDecimal cantidad);
}
