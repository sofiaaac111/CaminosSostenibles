package purchaseservice.schemas;

import java.math.BigDecimal;

public class ItemCompra {

    private Long idProducto;
    private BigDecimal cantidad;

    public Long getIdProducto() { return idProducto; }
    public void setIdProducto(Long idProducto) { this.idProducto = idProducto; }

    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
}
