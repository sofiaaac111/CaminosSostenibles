package auditservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auditservice.entity.EventoAuditoria;

@Repository
public interface EventoAuditoriaRepository extends JpaRepository<EventoAuditoria, Long> {

    List<EventoAuditoria> findByIdAgregado(String idAgregado);

    List<EventoAuditoria> findByTipoEvento(String tipoEvento);
}
