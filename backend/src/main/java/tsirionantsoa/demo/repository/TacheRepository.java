package tsirionantsoa.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tsirionantsoa.demo.model.Tache;
import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    // Trouver toutes les tâches appartenant à un projet spécifique
    List<Tache> findByProjetId(Long projetId);
}