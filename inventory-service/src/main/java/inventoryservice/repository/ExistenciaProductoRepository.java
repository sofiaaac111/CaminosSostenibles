package inventoryservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import inventoryservice.entity.ExistenciaProducto;

@Repository
public interface ExistenciaProductoRepository extends JpaRepository<ExistenciaProducto, Long> {

    Optional<ExistenciaProducto> findByIdProducto(Long idProducto);
}
