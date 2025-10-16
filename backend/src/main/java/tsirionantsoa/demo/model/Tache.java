package tsirionantsoa.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "tache")
@Data
public class Tache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_task")
    private Long id;

    @Column(name = "titre_task", nullable = false)
    private String titre;

    @Column(name = "priorite_task")
    private String priorite; // Peut être un Enum si vous voulez plus de contrôle

    @Column(name = "echeance_task")
    private LocalDate echeance;

    @Column(name = "status")
    private String status; // Nouveau champ

    @Column(name = "datecreation_task", nullable = false)
    private LocalDate dateCreation;

    @Column(name = "datemodification_task")
    private LocalDate dateModification;

    // Relation Many-to-One: Une tâche appartient à un seul projet
    @ManyToOne
    @JoinColumn(name = "id_projets", nullable = false)
    private Projet projet;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getPriorite() {
        return priorite;
    }

    public void setPriorite(String priorite) {
        this.priorite = priorite;
    }

    public LocalDate getEcheance() {
        return echeance;
    }

    public void setEcheance(LocalDate echeance) {
        this.echeance = echeance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDate getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDate dateModification) {
        this.dateModification = dateModification;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }
}
