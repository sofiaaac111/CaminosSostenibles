package inventoryservice.crud;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import inventoryservice.models.ReservaStock;

@Repository
public interface ReservaStockRepository extends JpaRepository<ReservaStock, Long> {

    @Query("SELECT COALESCE(SUM(r.cantidad), 0) FROM ReservaStock r " +
           "WHERE r.idProducto = :idProducto " +
           "AND r.confirmada = false " +
           "AND r.fechaExpiracion > :ahora")
    java.math.BigDecimal sumarCantidadReservada(@Param("idProducto") Long idProducto,
                                                @Param("ahora") LocalDateTime ahora);

    List<ReservaStock> findByConfirmadaFalseAndFechaExpiracionBefore(LocalDateTime ahora);
}