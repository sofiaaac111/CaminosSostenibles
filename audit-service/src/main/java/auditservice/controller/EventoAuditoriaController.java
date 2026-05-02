package auditservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import auditservice.entity.EventoAuditoria;
import auditservice.service.EventoAuditoriaService;

@RestController
@RequestMapping("/api/auditoria")
@CrossOrigin(origins = "*")
public class EventoAuditoriaController {

    @Autowired
    private EventoAuditoriaService eventoAuditoriaService;

    @GetMapping("/eventos")
    public List<EventoAuditoria> obtenerTodosLosEventos() {
        return eventoAuditoriaService.obtenerTodosLosEventos();
    }

    @GetMapping("/eventos/agregado/{idAgregado}")
    public List<EventoAuditoria> obtenerEventosPorAgregado(@PathVariable String idAgregado) {
        return eventoAuditoriaService.obtenerEventosPorAgregado(idAgregado);
    }

    @GetMapping("/eventos/tipo/{tipoEvento}")
    public List<EventoAuditoria> obtenerEventosPorTipo(@PathVariable String tipoEvento) {
        return eventoAuditoriaService.obtenerEventosPorTipo(tipoEvento);
    }
}
