package productservice.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import productservice.crud.CategoriaRepository;
import productservice.crud.ProductoRepository;
import productservice.models.Categoria;
import productservice.models.Producto;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

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
        resolverCategoria(producto);
        if (producto.getCategoria() != null) {
            producto.setCategoriaProducto(producto.getCategoria().getNombre());
        }
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
            producto.setPrecioProducto(datosProducto.getPrecioProducto());
            producto.setUnidadMedida(datosProducto.getUnidadMedida());
            producto.setImagenUrl(datosProducto.getImagenUrl());
            if (datosProducto.getActivo() != null) {
                producto.setActivo(datosProducto.getActivo());
            }
            // Actualizar categoría si viene en la petición
            if (datosProducto.getIdCategoria() != null) {
                resolverCategoria(datosProducto);
                producto.setCategoria(datosProducto.getCategoria());
                if (datosProducto.getCategoria() != null) {
                    producto.setCategoriaProducto(datosProducto.getCategoria().getNombre());
                }
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

    // Resuelve el idCategoria transitorio al objeto Categoria real
    private void resolverCategoria(Producto producto) {
        if (producto.getIdCategoria() != null) {
            Categoria cat = categoriaRepository.findById(producto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException(
                    "Categoría no encontrada con id: " + producto.getIdCategoria()));
            producto.setCategoria(cat);
        }
    }
}
