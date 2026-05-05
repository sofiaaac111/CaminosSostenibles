package customerservice.crud;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import customerservice.models.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByEmail(String email);
}
