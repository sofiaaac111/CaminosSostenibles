package productservice.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import productservice.entity.Producto;
import productservice.repository.ProductoRepository;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> obtenerTodosLosProductos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerProductoPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Optional<Producto> obtenerProductoPorCodigo(String codigoProducto) {
        return productoRepository.findByCodigoProducto(codigoProducto);
    }

    public List<Producto> buscarProductosPorNombre(String nombreProducto) {
        return productoRepository.findByNombreProductoContainingIgnoreCase(nombreProducto);
    }

    public Producto crearProducto(Producto producto) {
        if (producto.getActivo() == null) {
            producto.setActivo(false);
        }
        return productoRepository.save(producto);
    }

    public Producto actualizarProducto(Long id, Producto datosProducto) {
        Optional<Producto> productoOpcional = productoRepository.findById(id);
        if (productoOpcional.isPresent()) {
            Producto producto = productoOpcional.get();
            producto.setCodigoProducto(datosProducto.getCodigoProducto());
            producto.setNombreProducto(datosProducto.getNombreProducto());
            producto.setDescripcionProducto(datosProducto.getDescripcionProducto());
            producto.setCategoriaProducto(datosProducto.getCategoriaProducto());
            producto.setPrecioProducto(datosProducto.getPrecioProducto());
            producto.setUnidadMedida(datosProducto.getUnidadMedida());
            producto.setImagenUrl(datosProducto.getImagenUrl());
            if (datosProducto.getActivo() != null) {
                producto.setActivo(datosProducto.getActivo());
            }
            return productoRepository.save(producto);
        }
        return null;
    }

    public Producto cambiarEstadoProducto(Long id, boolean activo) {
        Optional<Producto> productoOpcional = productoRepository.findById(id);
        if (productoOpcional.isPresent()) {
            Producto producto = productoOpcional.get();
            producto.setActivo(activo);
            return productoRepository.save(producto);
        }
        return null;
    }

    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }
}
