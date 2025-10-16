package tsirionantsoa.demo.config;

import tsirionantsoa.demo.model.Utilisateur;
import tsirionantsoa.demo.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder; // 1. Importez PasswordEncoder
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class Datainitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder; // 2. Déclarez PasswordEncoder

    // 3. Injectez PasswordEncoder dans le constructeur
    public Datainitializer(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder; 
    }

    @Override
    public void run(String... args) throws Exception {
        // Nous vérifions si un utilisateur avec l'email "admin@projet.com" existe, 
        // car l'ID auto-incrémenté 1 n'est pas toujours garanti.
        if (utilisateurRepository.findByEmail("admin@projet.com").isEmpty()) { 
            
            System.out.println("----------------------------------------");
            System.out.println("INITIALISATION : Création du compte ADMINISTRATEUR par défaut.");
            
            Utilisateur admin = new Utilisateur();
            admin.setNom("Admin Principal");
            admin.setEmail("admin@projet.com");
            
            // 4. HACHAGE du mot de passe AVANT de le définir
            String rawPassword = "1234";
            String hashedPassword = passwordEncoder.encode(rawPassword);
            admin.setMotDePasse(hashedPassword); 
            
            // ⭐ Mise à jour : Initialisation des autres champs
            admin.setDateCreation(LocalDate.now()); 
            admin.setRole("ADMIN"); // Définition du rôle
            
            utilisateurRepository.save(admin);
            
            System.out.println("Administrateur (ADMIN) créé avec succès.");
            System.out.println("Mot de passe par défaut: " + rawPassword + " (Haché: " + hashedPassword.substring(0, 15) + "...)");
            System.out.println("----------------------------------------");
        } else {
             System.out.println("----------------------------------------");
             System.out.println("INFO : Le compte Administrateur par défaut (admin@projet.com) existe déjà. Initialisation ignorée.");
             System.out.println("----------------------------------------");
        }
    }
}