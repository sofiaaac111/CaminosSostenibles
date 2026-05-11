package purchaseservice.schemas;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class DatosPedido {

    private Long idPedido;
    private Long idCliente;
    private String estado;
    private String metodoPago;
    private BigDecimal total;
    private String moneda;
    private LocalDateTime fechaCreacion;
    private List<ItemDatosPedido> items;

    public Long getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Long idPedido) {
        this.idPedido = idPedido;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<ItemDatosPedido> getItems() {
        return items;
    }

    public void setItems(List<ItemDatosPedido> items) {
        this.items = items;
    }
}
