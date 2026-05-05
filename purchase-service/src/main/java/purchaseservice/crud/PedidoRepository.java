package purchaseservice.crud;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import purchaseservice.models.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByIdClienteOrderByFechaCreacionDesc(Long idCliente);
}
