package com.supermarket.erp.inventoryservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.erp.inventoryservice.entity.Lote;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findByIdProductoOrderByFechaIngresoAsc(Long idProducto);

    @Query("SELECT l FROM Lote l WHERE l.idProducto = :idProducto AND l.cantidadLote > 0 ORDER BY l.fechaIngreso ASC")
    List<Lote> encontrarLotesDisponiblesPorProducto(@Param("idProducto") Long idProducto);
}
