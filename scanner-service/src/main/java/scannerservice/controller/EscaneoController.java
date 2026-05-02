package scannerservice.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import scannerservice.service.EscaneoService;

@RestController
@RequestMapping("/api/escaneo")
@CrossOrigin(origins = "*")
public class EscaneoController {

    @Autowired
    private EscaneoService escaneoService;

    @PostMapping
    public String escanear(@RequestParam String codigoBarras,
                           @RequestParam String operacion,
                           @RequestParam BigDecimal cantidad) {
        return escaneoService.procesarEscaneo(codigoBarras, operacion, cantidad);
    }

    @PostMapping("/ventas/online")
    public String venderOnline(@RequestParam Long idProducto,
                               @RequestParam BigDecimal cantidad) {
        return escaneoService.procesarVentaOnline(idProducto, cantidad);
    }
}
