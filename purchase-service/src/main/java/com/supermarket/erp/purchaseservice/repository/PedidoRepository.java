package com.supermarket.erp.purchaseservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.supermarket.erp.purchaseservice.entity.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByIdClienteOrderByFechaCreacionDesc(Long idCliente);
}
