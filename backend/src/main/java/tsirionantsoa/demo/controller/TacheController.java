package tsirionantsoa.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tsirionantsoa.demo.dto.TacheDTO;
import tsirionantsoa.demo.model.Tache;
import tsirionantsoa.demo.service.TacheService;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/taches")
public class TacheController {

    @Autowired
    private TacheService tacheService;

    // POST /api/taches?projetId=1 => Ajouter une tache
    @PostMapping
    public ResponseEntity<?> createTache(@RequestBody TacheDTO tacheDTO, @RequestParam Long projetId) {
        try {
            System.out.println("Data tache => " + tacheDTO);
            Tache createdTache = tacheService.createTache(tacheDTO, projetId);
            return ResponseEntity.ok(createdTache);
        } catch (RuntimeException e) {
            e.printStackTrace();

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/taches/projet/1 => Liste des taches par projet
    @GetMapping("/projet/{projetId}")
    public List<Tache> getTachesByProjetId(@PathVariable Long projetId) {
        return tacheService.findTachesByProjet(projetId);
    }

    // GET /api/taches/1 => Details sur une tache
    @GetMapping("/{id}")
    public ResponseEntity<Tache> getTacheById(@PathVariable Long id) {
        return tacheService.findTacheById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/taches/1 => Modifier une tache
    @PutMapping("/{id}")
    public ResponseEntity<Tache> updateTache(@PathVariable Long id, @RequestBody Tache tacheDetails) {
        try {
            Tache updatedTache = tacheService.updateTache(id, tacheDetails);
            return ResponseEntity.ok(updatedTache);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/taches/1 => Supprimer un tache
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTache(@PathVariable Long id) {
        try {
            tacheService.deleteTache(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}