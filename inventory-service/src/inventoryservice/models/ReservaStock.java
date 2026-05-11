package inventoryservice.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "reservas_stock")
public class ReservaStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Long idReserva;

    @NotNull
    @Column(name = "id_producto")
    private Long idProducto;

    @NotNull
    @Column(name = "cantidad")
    private BigDecimal cantidad;

    @NotNull
    @Column(name = "id_cliente")
    private Long idCliente;

    @NotNull
    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    @Column(name = "confirmada", nullable = false)
    private Boolean confirmada = false;

    public ReservaStock() {}

    public ReservaStock(Long idProducto, BigDecimal cantidad, Long idCliente, LocalDateTime fechaExpiracion) {
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.idCliente = idCliente;
        this.fechaExpiracion = fechaExpiracion;
        this.confirmada = false;
    }

    public Long getIdReserva() { return idReserva; }
    public Long getIdProducto() { return idProducto; }
    public BigDecimal getCantidad() { return cantidad; }
    public Long getIdCliente() { return idCliente; }
    public LocalDateTime getFechaExpiracion() { return fechaExpiracion; }
    public Boolean getConfirmada() { return confirmada; }
    public void setConfirmada(Boolean confirmada) { this.confirmada = confirmada; }
}