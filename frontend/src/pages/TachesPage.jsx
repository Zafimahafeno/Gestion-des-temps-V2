import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import './ProjetPages.css'; // Utilisation du même fichier CSS pour la cohérence

// Gère l'affichage des tâches dans un tableau de style Kanban, avec des colonnes pour chaque projet.
const TachesPages = () => {
  const [taches, setTaches] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false); // Ajout d'une modale pour l'ajout
  const [newTache, setNewTache] = useState({
    nomTache: '',
    descriptionTache: '',
    dateEcheance: '',
    idProjet: ''
  });
  const [editingTache, setEditingTache] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tacheToDelete, setTacheToDelete] = useState(null);

  const API_BASE_URL_TACHES = 'http://localhost:8080/api/taches';
  const API_BASE_URL_PROJETS = 'http://localhost:8080/api/projets';

  useEffect(() => {
    fetchData();
  }, []);

  // Fonction pour récupérer les projets et les tâches en parallèle.
  const fetchData = async () => {
    try {
      setLoading(true);
      const [projetsResponse, tachesResponse] = await Promise.all([
        fetch(API_BASE_URL_PROJETS),
        fetch(API_BASE_URL_TACHES),
      ]);

      if (!projetsResponse.ok) throw new Error(`Erreur HTTP projets: ${projetsResponse.status}`);
      if (!tachesResponse.ok) throw new Error(`Erreur HTTP tâches: ${tachesResponse.status}`);

      const projetsData = await projetsResponse.json();
      const tachesData = await tachesResponse.json();
      setProjets(projetsData);
      setTaches(tachesData);

      if (projetsData.length > 0) {
        setNewTache(prev => ({ ...prev, idProjet: projetsData[0].id }));
      }
    } catch (err) {
      setError(`Échec du chargement des données: ${err.message}`);
      console.error("Erreur lors du chargement des données:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTacheChange = (e) => {
    const { name, value } = e.target;
    setNewTache(prev => ({ ...prev, [name]: value }));
  };

  const handleEditTacheChange = (e) => {
    const { name, value } = e.target;
    setEditingTache(prev => ({ ...prev, [name]: value }));
  };

  const addTache = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...newTache,
        dateEcheance: newTache.dateEcheance ? new Date(newTache.dateEcheance) : null,
        idProjet: parseInt(newTache.idProjet, 10)
      };

      const response = await fetch(API_BASE_URL_TACHES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec de la création de la tâche: ${response.status} - ${errorText}`);
      }

      setNewTache({
        nomTache: '',
        descriptionTache: '',
        dateEcheance: '',
        idProjet: projets[0]?.id || ''
      });
      setShowAddModal(false); // Fermeture de la modale après l'ajout
      fetchData();
    } catch (err) {
      setError(`Erreur lors de l'ajout de la tâche: ${err.message}`);
      console.error("Erreur lors de l'ajout de la tâche:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTache = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL_TACHES}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Échec de la suppression de la tâche: ${response.status}`);
      }
      fetchData();
    } catch (err) {
      setError(`Erreur lors de la suppression de la tâche: ${err.message}`);
      console.error("Erreur lors de la suppression de la tâche:", err);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setTacheToDelete(null);
    }
  };

  const confirmDelete = (tache) => {
    setTacheToDelete(tache);
    setShowDeleteModal(true);
  };

  const startEditing = (tache) => {
    setEditingTache({
      ...tache,
      dateEcheance: tache.dateEcheance ? new Date(tache.dateEcheance).toISOString().split('T')[0] : '',
      idProjet: tache.projet ? tache.projet.id : ''
    });
  };

  const cancelEditing = () => {
    setEditingTache(null);
  };

  const updateTache = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...editingTache,
        dateEcheance: editingTache.dateEcheance ? new Date(editingTache.dateEcheance) : null,
        idProjet: parseInt(editingTache.idProjet, 10)
      };

      const response = await fetch(`${API_BASE_URL_TACHES}/${editingTache.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec de la mise à jour de la tâche: ${response.status} - ${errorText}`);
      }

      setEditingTache(null);
      fetchData();
    } catch (err) {
      setError(`Erreur lors de la mise à jour de la tâche: ${err.message}`);
      console.error("Erreur lors de la mise à jour de la tâche:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupedTasks = projets.reduce((acc, projet) => {
    acc[projet.id] = taches.filter(tache => tache.projet?.id === projet.id);
    return acc;
  }, {});

  return (

    <div className="projet-page-container">
      <h1 className="page-title">Tableau des Tâches</h1>

      {loading && <div className="loading-state">Chargement des données...</div>}
      {error && <div className="error-state">Erreur: {error}</div>}

      <div className="header-actions">
        <button className="btn-add-projet" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Ajouter une Tâche</span>
        </button>
      </div>

      {/* Tableau Kanban des tâches */}
      <div className="kanban-board">
        {projets.length === 0 ? (
          <p className="no-projects">Aucun projet trouvé. Créez-en un pour commencer !</p>
        ) : (
          projets.map((projet) => (
            <div key={projet.id} className="kanban-column">
              <h2 className="kanban-column-title">{projet.nomProjet}</h2>
              <div className="kanban-tasks">
                {(groupedTasks[projet.id] || []).length === 0 ? (
                  <p className="no-tasks-message">Aucune tâche</p>
                ) : (
                  (groupedTasks[projet.id] || []).map((tache) => (
                    <div key={tache.id} className="kanban-task-card">
                      {editingTache && editingTache.id === tache.id ? (
                        <form onSubmit={updateTache} className="projet-edit-form">
                          <div className="form-group">
                            <label className="form-label">Nom</label>
                            <input type="text" name="nomTache" value={editingTache.nomTache} onChange={handleEditTacheChange} required className="form-input" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea name="descriptionTache" value={editingTache.descriptionTache} onChange={handleEditTacheChange} rows="2" className="form-input"></textarea>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Échéance</label>
                            <input type="date" name="dateEcheance" value={editingTache.dateEcheance} onChange={handleEditTacheChange} className="form-input" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Projet</label>
                            <select name="idProjet" value={editingTache.idProjet} onChange={handleEditTacheChange} required className="form-input">
                              {projets.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.nomProjet}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="edit-actions">
                            <button type="submit" className="btn-update">
                              <Save size={18} />
                            </button>
                            <button type="button" onClick={cancelEditing} className="btn-cancel">
                              <X size={18} />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <h3 className="task-title">{tache.nomTache}</h3>
                          <p className="task-description">{tache.descriptionTache}</p>
                          <p className="task-date">
                            Échéance: {tache.dateEcheance ? new Date(tache.dateEcheance).toLocaleDateString() : 'N/A'}
                          </p>
                          <div className="kanban-task-actions">
                            <button onClick={() => startEditing(tache)} className="btn-edit">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => confirmDelete(tache)} className="btn-delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modale d'ajout de tâche */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Ajouter une nouvelle Tâche</h3>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>
              <X size={24} />
            </button>
            <form onSubmit={addTache} className="projet-form-grid">
              <div className="form-group">
                <label htmlFor="nomTache" className="form-label">Nom de la Tâche</label>
                <input type="text" id="nomTache" name="nomTache" value={newTache.nomTache} onChange={handleNewTacheChange} required className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="descriptionTache" className="form-label">Description</label>
                <input type="texte" id="descriptionTache" name="descriptionTache" value={newTache.descriptionTache} onChange={handleNewTacheChange} rows="2" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="dateEcheance" className="form-label">Date d'échéance</label>
                <input type="date" id="dateEcheance" name="dateEcheance" value={newTache.dateEcheance} onChange={handleNewTacheChange} className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="idProjet" className="form-label">Projet</label>
                <select id="idProjet" name="idProjet" value={newTache.idProjet} onChange={handleNewTacheChange} required className="form-input">
                  {projets.map(projet => (
                    <option key={projet.id} value={projet.id}>
                      {projet.nomProjet}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-submit">
                  <Plus size={18} />
                  <span>Ajouter Tâche</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirmer la suppression</h3>
            <p className="modal-message">Êtes-vous sûr de vouloir supprimer la tâche <strong>"{tacheToDelete.nomTache}"</strong> ?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="modal-btn-cancel">Annuler</button>
              <button onClick={() => deleteTache(tacheToDelete.id)} className="modal-btn-confirm">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TachesPages;
