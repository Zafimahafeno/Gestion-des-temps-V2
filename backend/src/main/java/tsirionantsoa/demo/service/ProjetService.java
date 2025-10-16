package tsirionantsoa.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import tsirionantsoa.demo.dto.ProjetDTO;
import tsirionantsoa.demo.model.Projet;
import tsirionantsoa.demo.model.Utilisateur;
import tsirionantsoa.demo.repository.ProjetRepository;
import tsirionantsoa.demo.repository.UtilisateurRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ProjetService {

@Autowired
private ProjetRepository projetRepository;

@Autowired
private UtilisateurRepository utilisateurRepository;

//Ajouter un projet
public Projet createProjet(ProjetDTO projetDTO, Long userId) {
    System.out.println("=== DEBUG CREATE PROJET ===");
    System.out.println("DTO reçu: " + projetDTO);
    System.out.println("Nom: " + projetDTO.getNom());
    System.out.println("Description: " + projetDTO.getDescription());
    System.out.println("DateDebut: " + projetDTO.getDateDebut());
    System.out.println("DateFin: " + projetDTO.getDateFin());
    System.out.println("UserId: " + userId);
    if (projetDTO.getNom() == null || projetDTO.getNom().trim().isEmpty()) {
    throw new RuntimeException("Le nom du projet est requis");
    }
    if (projetDTO.getDescription() == null || projetDTO.getDescription().trim().isEmpty()) {
    throw new RuntimeException("La description du projet est requise");
    }
    Utilisateur utilisateur = utilisateurRepository.findById(userId)
    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'ID: " + userId));
    System.out.println("Utilisateur trouvé: " + utilisateur.getNom());
    Projet projet = new Projet();
    projet.setNom(projetDTO.getNom());
    projet.setDescription(projetDTO.getDescription());
    if (projetDTO.getDateDebut() != null && !projetDTO.getDateDebut().isEmpty()) {
    projet.setDateDebut(LocalDate.parse(projetDTO.getDateDebut()));
    } else {
        projet.setDateDebut(null);
    }
    if (projetDTO.getDateFin() != null && !projetDTO.getDateFin().isEmpty()) {
    projet.setDateFin(LocalDate.parse(projetDTO.getDateFin()));
    } else {
        projet.setDateFin(null);
    }
    projet.setUtilisateur(utilisateur);
    projet.setDateCreation(LocalDate.now());
    System.out.println("Projet avant sauvegarde: " + projet);
    Projet savedProjet = projetRepository.save(projet);
    System.out.println("Projet sauvegardé avec ID: " + savedProjet.getId());
    System.out.println("=== FIN DEBUG ===");
    return savedProjet;
}

// Liste de projet créer par un utilisateur
public List<Projet> listeProjetByUtilisateur(Long id){
    return projetRepository.findByUtilisateurId(id);
}

// Détail du projet
public Optional<Projet> findProjetById(Long id) {
    return projetRepository.findById(id);
}

// Modifier du projet
public Projet updateProjet(Long id, ProjetDTO projetDTO) {
    System.out.println("=== DEBUG UPDATE PROJET ===");
    System.out.println("DTO reçu: " + projetDTO);
    Projet projet = projetRepository.findById(id)
    .orElseThrow(() -> new RuntimeException("Projet introuvable avec l'ID: " + id));
    if (projetDTO.getNom() != null && !projetDTO.getNom().trim().isEmpty()) {
    projet.setNom(projetDTO.getNom());}
    if (projetDTO.getDescription() != null && !projetDTO.getDescription().trim().isEmpty()) {
    projet.setDescription(projetDTO.getDescription());
    }
    if (projetDTO.getDateDebut() != null && !projetDTO.getDateDebut().isEmpty()) {
    projet.setDateDebut(LocalDate.parse(projetDTO.getDateDebut()));
    } else {
        projet.setDateDebut(null);
    }
    if (projetDTO.getDateFin() != null && !projetDTO.getDateFin().isEmpty()) {
    projet.setDateFin(LocalDate.parse(projetDTO.getDateFin()));
    } else {
        projet.setDateFin(null);
    }
    System.out.println("Projet après modification: " + projet);
    return projetRepository.save(projet);
}

// Supprimer projet
public void deleteProjet(Long id) {
if (!projetRepository.existsById(id)) {
throw new RuntimeException("Projet introuvable avec l'ID: " + id);
}
projetRepository.deleteById(id);
}
}