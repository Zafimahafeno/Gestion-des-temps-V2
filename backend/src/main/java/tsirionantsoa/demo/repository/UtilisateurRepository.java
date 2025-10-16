package tsirionantsoa.demo.repository;

import tsirionantsoa.demo.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    
    // ⭐ AJOUT : Permet de trouver un utilisateur par son email pour la vérification
    Optional<Utilisateur> findByEmail(String email);
}