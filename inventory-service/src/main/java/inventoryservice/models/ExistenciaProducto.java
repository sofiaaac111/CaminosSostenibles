package inventoryservice.models;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Table(name = "existencias_producto")
public class ExistenciaProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_existencia")
    private Long idExistencia;

    @NotNull
    @Column(name = "id_producto", unique = true)
    private Long idProducto;

    @NotNull
    @PositiveOrZero
    @Column(name = "cantidad_total")
    private BigDecimal cantidadTotal;

    public ExistenciaProducto() {}

    public ExistenciaProducto(Long idProducto, BigDecimal cantidadTotal) {
        this.idProducto = idProducto;
        this.cantidadTotal = cantidadTotal;
    }

    public Long getIdExistencia() { return idExistencia; }
    public void setIdExistencia(Long idExistencia) { this.idExistencia = idExistencia; }

    public Long getIdProducto() { return idProducto; }
    public void setIdProducto(Long idProducto) { this.idProducto = idProducto; }

    public BigDecimal getCantidadTotal() { return cantidadTotal; }
    public void setCantidadTotal(BigDecimal cantidadTotal) { this.cantidadTotal = cantidadTotal; }
}
