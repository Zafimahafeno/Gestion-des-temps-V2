package tsirionantsoa.demo.dto;

import lombok.Data;

// DTO pour la réponse après connexion ou inscription réussie
@Data
public class AuthResponse {
    private Long id;
    private String nom;
    private String email;
    private String mot_de_passe;
    private String message;
    // Cet ID (id) est ce que nous utiliserons côté client pour faire les requêtes de tâche.

    // ⭐ AJOUT NÉCESSAIRE: Le rôle de l'utilisateur pour la redirection
    private String role; 

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public String getMot_de_passe() {
        return mot_de_passe;
    }

    public void setMot_de_passe(String mot_de_passe) {
        this.mot_de_passe = mot_de_passe;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    // ⭐ GETTER et SETTER pour le rôle (requis si Lombok @Data est utilisé avec des getters/setters manuels)
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}