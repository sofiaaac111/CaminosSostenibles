package productservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import productservice.crud.CategoriaRepository;
import productservice.models.Categoria;

@Service
public class CategoriaService {

    private static final List<String> CATEGORIAS_INICIALES = List.of(
        "Frutas y verduras",
        "Lácteos y huevos",
        "Carnes y pescados",
        "Panadería y cereales",
        "Bebidas",
        "Limpieza y hogar",
        "Higiene personal",
        "Snacks y dulces",
        "Congelados",
        "Aceites y condimentos"
    );

    @Autowired
    private CategoriaRepository categoriaRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void sembrarCategorias() {
        for (String nombre : CATEGORIAS_INICIALES) {
            if (categoriaRepository.findByNombre(nombre).isEmpty()) {
                categoriaRepository.save(new Categoria(nombre));
            }
        }
    }

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }
}
