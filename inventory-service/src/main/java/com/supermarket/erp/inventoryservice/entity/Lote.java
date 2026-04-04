package com.supermarket.erp.inventoryservice.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "lotes_producto")
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    private Long idLote;

    @NotBlank
    @Column(name = "numero_lote", unique = true)
    private String numeroLote;

    @NotNull
    @Column(name = "id_producto")
    private Long idProducto;

    @NotNull
    @Positive
    @Column(name = "cantidad_lote")
    private BigDecimal cantidadLote;

    @NotNull
    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @NotNull
    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    public Lote() {}

    public Lote(String numeroLote, Long idProducto, BigDecimal cantidadLote,
                LocalDate fechaVencimiento, LocalDate fechaIngreso) {
        this.numeroLote = numeroLote;
        this.idProducto = idProducto;
        this.cantidadLote = cantidadLote;
        this.fechaVencimiento = fechaVencimiento;
        this.fechaIngreso = fechaIngreso;
    }

    public Long getIdLote() { return idLote; }
    public void setIdLote(Long idLote) { this.idLote = idLote; }

    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

    public Long getIdProducto() { return idProducto; }
    public void setIdProducto(Long idProducto) { this.idProducto = idProducto; }

    public BigDecimal getCantidadLote() { return cantidadLote; }
    public void setCantidadLote(BigDecimal cantidadLote) { this.cantidadLote = cantidadLote; }

    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public LocalDate getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDate fechaIngreso) { this.fechaIngreso = fechaIngreso; }
}
