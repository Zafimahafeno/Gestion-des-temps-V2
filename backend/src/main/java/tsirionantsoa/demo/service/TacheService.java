package tsirionantsoa.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tsirionantsoa.demo.dto.TacheDTO;
import tsirionantsoa.demo.model.Projet;
import tsirionantsoa.demo.model.Tache;
import tsirionantsoa.demo.repository.ProjetRepository;
import tsirionantsoa.demo.repository.TacheRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TacheService {

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private ProjetRepository projetRepository;

    // Ajouter tache
    public Tache createTache(TacheDTO tacheDTO, Long projetId) {

        Optional<Projet> projetOpt = projetRepository.findById(projetId);
        if (projetOpt.isEmpty()) {
            throw new RuntimeException("Projet non trouvé avec l'ID: " + projetId);
        }

        Tache tache = new Tache();
        tache.setTitre(tacheDTO.getTitre());
        tache.setPriorite(tacheDTO.getPriorite());
        tache.setEcheance(tacheDTO.getEcheance());
        tache.setStatus(tacheDTO.getStatus());

        tache.setProjet(projetOpt.get());
        tache.setDateCreation(LocalDate.now());
        tache.setDateModification(LocalDate.now());

        return tacheRepository.save(tache);
    }

    // Détails sur un tache
    public Optional<Tache> findTacheById(Long id) {
        return tacheRepository.findById(id);
    }

    // Liste des taches par projet
    public List<Tache> findTachesByProjet(Long projetId) {
        return tacheRepository.findByProjetId(projetId);
    }

    // Mettre à jour une tâche
    public Tache updateTache(Long id, Tache tacheDetails) {
        return tacheRepository.findById(id)
                .map(tache -> {
                    tache.setTitre(tacheDetails.getTitre());
                    tache.setPriorite(tacheDetails.getPriorite());
                    tache.setEcheance(tacheDetails.getEcheance());
                    tache.setDateModification(LocalDate.now());

                    // Si vous voulez changer le projet ou l'utilisateur assigné,
                    // vous devez gérer la recherche et l'assignation ici.

                    return tacheRepository.save(tache);
                })
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée avec l'ID: " + id));
    }

    // DELETE (Supprimer une tâche)
    public void deleteTache(Long id) {
        if (!tacheRepository.existsById(id)) {
            throw new RuntimeException("Tâche non trouvée avec l'ID: " + id);
        }
        tacheRepository.deleteById(id);
    }

    // Affiche le nombre de tâches terminées.
    public long nbTachesTermineesParUtilisateur(Long utilisateurId) {
        // Remplacez "TERMINÉ" par la valeur exacte de votre statut.
        return tacheRepository.countByProjetUtilisateurIdAndStatus(utilisateurId, "TERMINÉ");
    }

    // Affiche le nombre de tâches en cours.
    public long nbTachesEnCoursParUtilisateur(Long utilisateurId) {
        // Remplacez "EN_COURS" par la valeur exacte de votre statut.
        return tacheRepository.countByProjetUtilisateurIdAndStatus(utilisateurId, "EN_COURS");
    }
}