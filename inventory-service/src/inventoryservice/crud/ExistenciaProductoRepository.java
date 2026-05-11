package inventoryservice.crud;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import inventoryservice.models.ExistenciaProducto;
import jakarta.persistence.LockModeType;


@Repository
public interface ExistenciaProductoRepository extends JpaRepository<ExistenciaProducto, Long> {

    Optional<ExistenciaProducto> findByIdProducto(Long idProducto);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM ExistenciaProducto e WHERE e.idProducto = :idProducto")
    Optional<ExistenciaProducto> buscarConBloqueo(@Param("idProducto") Long idProducto);
}
