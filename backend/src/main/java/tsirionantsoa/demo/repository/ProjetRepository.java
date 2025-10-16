package tsirionantsoa.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tsirionantsoa.demo.model.Projet;
import java.util.List;

public interface ProjetRepository extends JpaRepository<Projet, Long> {
    // Trouver tous les projets créés par un utilisateur spécifique
    List<Projet> findByUtilisateurId(Long utilisateurId);
}