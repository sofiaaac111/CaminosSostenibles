package productservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import productservice.crud.CategoriaRepository;
import productservice.models.Categoria;

@Service
public class CategoriaService {

    private static final List<String> CATEGORIAS = List.of(
        "Frutas y verduras",
        "Lácteos y huevos",
        "Carnes y embutidos",
        "Pollo, cerdo y pescado",
        "Bebidas y gaseosas",
        "Jugos e hidratantes",
        "Pasabocas y mecato",
        "Arroz y granos",
        "Aceites y vinagres",
        "Café y chocolate",
        "Cereales y granolas",
        "Pastas",
        "Salsas y condimentos",
        "Galletas",
        "Dulces y chocolatería",
        "Aseo del hogar",
        "Higiene personal",
        "Congelados",
        "Panadería y repostería",
        "Enlatados y conservas"
    );

    @Autowired
    private CategoriaRepository categoriaRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void sembrarCategorias() {
        for (String nombre : CATEGORIAS) {
            if (categoriaRepository.findByNombre(nombre).isEmpty()) {
                categoriaRepository.save(new Categoria(nombre));
            }
        }
    }

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public java.util.Optional<Categoria> buscarPorNombre(String nombre) {
        return categoriaRepository.findByNombre(nombre);
    }
}
