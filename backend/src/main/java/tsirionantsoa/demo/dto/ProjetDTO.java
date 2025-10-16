package tsirionantsoa.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data // Génère automatiquement les getters, setters, toString(), equals et hashCode
@NoArgsConstructor // Génère le constructeur sans argument (nécessaire pour la désérialisation JSON par Jackson)
@AllArgsConstructor // Génère le constructeur avec tous les arguments
public class ProjetDTO {
    
    private String nom;
    private String description;
    private String dateDebut;
    private String dateFin;

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

    public String getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(String dateDebut) {
        this.dateDebut = dateDebut;
    }

    public String getDateFin() {
        return dateFin;
    }

    public void setDateFin(String dateFin) {
        this.dateFin = dateFin;
    }
}