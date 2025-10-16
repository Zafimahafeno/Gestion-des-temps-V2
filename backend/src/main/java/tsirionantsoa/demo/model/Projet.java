package tsirionantsoa.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "projet")
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_projet")
    private Long id;

    @Column(name = "nom_projet", nullable = false)
    private String nom;

    @Column(name = "description_projet", nullable = false)
    private String description;

    @Column(name = "datedebut_projet")
    private LocalDate dateDebut;

    @Column(name = "datefin_projet")
    private LocalDate dateFin;

    @Column(name = "datecreation_projet")
    private LocalDate dateCreation;

    @ManyToOne
    @JoinColumn(name = "id_users", nullable = false)
    private Utilisateur utilisateur;

    // ============= CONSTRUCTEURS =============
    public Projet() {
    }

    public Projet(String nom, String description, LocalDate dateDebut, LocalDate dateFin, Utilisateur utilisateur) {
        this.nom = nom;
        this.description = description;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.utilisateur = utilisateur;
    }

    // ============= GETTERS ET SETTERS =============
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    // ============= TOSTRING =============
        /*
    @Override
        public String toString() {
        return "Projet{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", description='" + description + '\'' +
                ", dateDebut=" + dateDebut +
                ", dateFin=" + dateFin +
                ", dateCreation=" + dateCreation +
                '}';
    }
     */

}