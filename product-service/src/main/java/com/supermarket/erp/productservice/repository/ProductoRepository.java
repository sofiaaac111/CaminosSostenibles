package com.supermarket.erp.productservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.supermarket.erp.productservice.entity.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigoProducto(String codigoProducto);

    java.util.List<Producto> findByNombreProductoContainingIgnoreCase(String nombreProducto);
}
