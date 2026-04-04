package com.supermarket.erp.auditservice.service;

import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.supermarket.erp.auditservice.entity.EventoAuditoria;
import com.supermarket.erp.auditservice.repository.EventoAuditoriaRepository;

@Service
public class EventoAuditoriaService {

    @Autowired
    private EventoAuditoriaRepository eventoAuditoriaRepository;

    public List<EventoAuditoria> obtenerTodosLosEventos() {
        return eventoAuditoriaRepository.findAll();
    }

    public List<EventoAuditoria> obtenerEventosPorAgregado(String idAgregado) {
        return eventoAuditoriaRepository.findByIdAgregado(idAgregado);
    }

    public List<EventoAuditoria> obtenerEventosPorTipo(String tipoEvento) {
        return eventoAuditoriaRepository.findByTipoEvento(tipoEvento);
    }

    public EventoAuditoria guardarEvento(EventoAuditoria evento) {
        return eventoAuditoriaRepository.save(evento);
    }

    // Escucha mensajes de la cola de RabbitMQ con formato "tipoEvento:idAgregado:contenido"
    @RabbitListener(queues = "cola-auditoria")
    public void procesarMensaje(String mensaje) {
        String[] partes = mensaje.split(":", 3);
        if (partes.length == 3) {
            EventoAuditoria evento = new EventoAuditoria(partes[0], partes[1], partes[2]);
            guardarEvento(evento);
        }
    }
}
