package tsirionantsoa.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tsirionantsoa.demo.dto.AuthResponse;
import tsirionantsoa.demo.dto.LoginRequest;
import tsirionantsoa.demo.model.Utilisateur;
import tsirionantsoa.demo.service.UtilisateurService;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UtilisateurService utilisateurService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Utilisateur utilisateur) {
        try {

            //System.out.println("Data Utilisateur => " + utilisateur);

            Utilisateur newUser = utilisateurService.registerUtilisateur(utilisateur);
            
            AuthResponse response = new AuthResponse();
            response.setId(newUser.getId());
            response.setNom(newUser.getNom());
            response.setEmail(newUser.getEmail());
            response.setMot_de_passe(newUser.getMotDePasse());
            response.setMessage("Inscription réussie. Bienvenue !");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Email déjà utilisé
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<Utilisateur> userOpt = utilisateurService.loginUtilisateur(
            loginRequest.getEmail(), 
            loginRequest.getMotDePasse()
        );

        if (userOpt.isPresent()) {
            Utilisateur user = userOpt.get();
            System.out.println("Data Utilisateur ->" + user);
            AuthResponse response = new AuthResponse();
            response.setId(user.getId());
            response.setNom(user.getNom());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setMessage("Connexion réussie !");
           

            // Renvoie l'ID utilisateur ET le RÔLE au frontend
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
        }
    }
}