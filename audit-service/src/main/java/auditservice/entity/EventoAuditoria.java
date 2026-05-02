package auditservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "eventos_auditoria")
public class EventoAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Long idEvento;

    @NotBlank
    @Column(name = "tipo_evento")
    private String tipoEvento;

    @NotBlank
    @Column(name = "id_agregado")
    private String idAgregado;

    @NotBlank
    @Column(name = "contenido_evento", columnDefinition = "TEXT")
    private String contenidoEvento;

    @NotNull
    @Column(name = "fecha_hora_evento")
    private LocalDateTime fechaHoraEvento;

    public EventoAuditoria() {}

    public EventoAuditoria(String tipoEvento, String idAgregado, String contenidoEvento) {
        this.tipoEvento = tipoEvento;
        this.idAgregado = idAgregado;
        this.contenidoEvento = contenidoEvento;
        this.fechaHoraEvento = LocalDateTime.now();
    }

    public Long getIdEvento() { return idEvento; }
    public void setIdEvento(Long idEvento) { this.idEvento = idEvento; }

    public String getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(String tipoEvento) { this.tipoEvento = tipoEvento; }

    public String getIdAgregado() { return idAgregado; }
    public void setIdAgregado(String idAgregado) { this.idAgregado = idAgregado; }

    public String getContenidoEvento() { return contenidoEvento; }
    public void setContenidoEvento(String contenidoEvento) { this.contenidoEvento = contenidoEvento; }

    public LocalDateTime getFechaHoraEvento() { return fechaHoraEvento; }
    public void setFechaHoraEvento(LocalDateTime fechaHoraEvento) { this.fechaHoraEvento = fechaHoraEvento; }
}
