package tsirionantsoa.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import tsirionantsoa.demo.model.Utilisateur;
import tsirionantsoa.demo.repository.UtilisateurRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    // Injecter le PasswordEncoder
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // CREATE (Créer un nouvel utilisateur avec hachage) - Utilisé pour l'inscription
    public Utilisateur registerUtilisateur(Utilisateur utilisateur) {
        if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé: " + utilisateur.getEmail());
        }

        // 1. Hacher le mot de passe
        String hashedPassword = passwordEncoder.encode(utilisateur.getMotDePasse());
        utilisateur.setMotDePasse(hashedPassword);

        // 2. Définir les valeurs par défaut
        utilisateur.setDateCreation(LocalDate.now());
        if (utilisateur.getRole() == null || utilisateur.getRole().isEmpty()) {
             utilisateur.setRole("USER"); // Rôle par défaut
        }

        return utilisateurRepository.save(utilisateur);
    }

    // LOGIN (Vérifier les identifiants)
    public Optional<Utilisateur> loginUtilisateur(String email, String rawPassword) {
        Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            Utilisateur utilisateur = userOpt.get();
            // Comparer le mot de passe brut avec le mot de passe haché
            if (passwordEncoder.matches(rawPassword, utilisateur.getMotDePasse())) {
                return Optional.of(utilisateur);
            }
        }
        return Optional.empty(); // Échec de la connexion
    }
    
    // READ (Trouver tous les utilisateurs)
    public List<Utilisateur> findAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    // READ (Trouver un utilisateur par ID)
    public Optional<Utilisateur> findUtilisateurById(Long id) {
        return utilisateurRepository.findById(id);
    }

    //AFFICHER DASHBOARD
    public long nbUtilisateursTotal() {
        return utilisateurRepository.count();
    }
}
