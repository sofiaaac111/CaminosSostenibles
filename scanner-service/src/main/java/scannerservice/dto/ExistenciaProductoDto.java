package scannerservice.dto;

import java.math.BigDecimal;

public class ExistenciaProductoDto {

    private Long idExistencia;
    private Long idProducto;
    private BigDecimal cantidadTotal;

    public Long getIdExistencia() {
        return idExistencia;
    }

    public void setIdExistencia(Long idExistencia) {
        this.idExistencia = idExistencia;
    }

    public Long getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Long idProducto) {
        this.idProducto = idProducto;
    }

    public BigDecimal getCantidadTotal() {
        return cantidadTotal;
    }

    public void setCantidadTotal(BigDecimal cantidadTotal) {
        this.cantidadTotal = cantidadTotal;
    }
}