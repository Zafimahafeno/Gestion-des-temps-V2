import React, { useState, useEffect, useCallback } from 'react';
import { 
    Plus, Edit, Trash2, Save, X, Loader2, AlertTriangle, CheckCircle, RefreshCw, 
    Calendar, FileText, User, ChevronLeft, ChevronRight 
} from 'lucide-react';

const App = () => {
    // --- Configuration et États initiaux ---
    const API_BASE_URL = 'http://localhost:8080/api/projets';
    const ACTIVE_USER_ID = 1;
    const PROJECTS_PER_PAGE = 5; // Nombre de projets par page

    const [projets, setProjets] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0); // Page actuelle (0-indexé)
    const [totalPages, setTotalPages] = useState(0);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Modals et Formulaires
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const [newProjet, setNewProjet] = useState({
        nom: '',
        description: '',
        dateDebut: '',
        dateFin: '',
    });

    const [editingProjet, setEditingProjet] = useState(null);
    const [projetToDelete, setProjetToDelete] = useState(null);

    // --- Fonctions Utilitaires ---

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
            if (isNaN(date)) return 'Date Invalide';
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return 'Date Invalide';
        }
    };

    const toInputDate = (dateString) => {
        if (!dateString) return '';
        try {
            return dateString.split('T')[0];
        } catch (e) {
            return '';
        }
    };

    // --- Logique de la Pagination (fetch) ---

    const fetchProjets = useCallback(async (page = currentPage, size = PROJECTS_PER_PAGE) => {
        setLoading(true);
        setError(null);
        try {
            // Utiliser les paramètres de pagination dans l'URL
            const response = await fetch(`${API_BASE_URL}?page=${page}&size=${size}`);
            
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            
            const pageData = await response.json();
            
            setProjets(pageData.content || []);
            setTotalElements(pageData.totalElements || 0);
            setTotalPages(pageData.totalPages || 0);
            setCurrentPage(pageData.number || 0);

        } catch (err) {
            setError(`Échec du chargement des projets. Détail: ${err.message}`);
            console.error("Erreur lors du chargement des projets:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage]); // Dépend de currentPage pour les futurs appels (Ajout/Suppression)

    useEffect(() => {
        fetchProjets(0); // Charge la première page au montage
    }, [fetchProjets]);


    // --- Logique CRUD ---

    const handleNewProjetChange = (e) => {
        const { name, value } = e.target;
        setNewProjet(prev => ({ ...prev, [name]: value }));
    };

    const handleEditProjetChange = (e) => {
        const { name, value } = e.target;
        setEditingProjet(prev => ({ ...prev, [name]: value }));
    };

    const addProjet = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        if (!newProjet.nom || !newProjet.description) {
            setError("Le nom et la description du projet sont requis.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                nom: newProjet.nom,
                description: newProjet.description,
                dateDebut: newProjet.dateDebut ? newProjet.dateDebut : null,
                dateFin: newProjet.dateFin ? newProjet.dateFin : null,
            };

            const response = await fetch(`${API_BASE_URL}?userId=${ACTIVE_USER_ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorText = await response.text();
                throw new Error(`Échec de la création (${response.status}): ${errorText || 'Erreur inconnue'}`);
            }

            setNewProjet({ nom: '', description: '', dateDebut: '', dateFin: '' });
            setShowAddModal(false);
            setSuccessMessage(`Projet "${newProjet.nom}" ajouté avec succès!`);
            // Après l'ajout, on revient à la première page ou on recharge la page actuelle
            fetchProjets(0); 
        } catch (err) {
            setError(`Erreur lors de l'ajout: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const updateProjet = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        if (!editingProjet) return;

        try {
            const payload = {
                nom: editingProjet.nom,
                description: editingProjet.description,
                dateDebut: editingProjet.dateDebut || null,
                dateFin: editingProjet.dateFin || null,
            };

            const response = await fetch(`${API_BASE_URL}/${editingProjet.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorText = await response.text();
                throw new Error(`Échec de la mise à jour (${response.status}): ${errorText || 'Erreur inconnue'}`);
            }

            setSuccessMessage(`Projet "${editingProjet.nom}" mis à jour avec succès!`);
            setEditingProjet(null);
            // Recharge la page actuelle pour mettre à jour la ligne
            fetchProjets(currentPage); 
        } catch (err) {
            setError(`Erreur lors de la mise à jour: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteProjet = async () => {
        if (!projetToDelete) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/${projetToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                let errorText = await response.text();
                throw new Error(`Échec de la suppression (${response.status}): ${errorText || 'Erreur inconnue'}`);
            }
            
            setSuccessMessage(`Projet "${projetToDelete.nom}" supprimé avec succès!`);
            
            // Logique pour s'assurer que nous restons sur une page valide après la suppression
            const newTotalElements = totalElements - 1;
            const newTotalPages = Math.ceil(newTotalElements / PROJECTS_PER_PAGE);
            let pageToFetch = currentPage;

            // Si la suppression était le seul élément de la dernière page, on recule d'une page
            if (projets.length === 1 && currentPage > 0) {
                pageToFetch = currentPage - 1;
            } else if (newTotalElements === 0) {
                pageToFetch = 0; // Aucun élément restant
            }

            fetchProjets(pageToFetch);

        } catch (err) {
            setError(`Erreur lors de la suppression: ${err.message}`);
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setProjetToDelete(null);
        }
    };

    // --- Fonctions d'Action du Tableau/Cartes ---

    const startEditing = (projet) => {
        setEditingProjet({
            ...projet,
            // Convertir la date du format API (ISO ou autre) au format input 'YYYY-MM-DD'
            dateDebut: toInputDate(projet.dateDebut),
            dateFin: toInputDate(projet.dateFin),
        });
    };

    const cancelEditing = () => {
        setEditingProjet(null);
    };

    const confirmDelete = (projet) => {
        setProjetToDelete(projet);
        setShowDeleteModal(true);
    };


    // --- Composants Modals ---

    const AddProjetModal = () => (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">Ajouter un nouveau Projet</h3>
                    <button 
                        className="text-gray-400 hover:text-red-500 transition-colors" 
                        onClick={() => setShowAddModal(false)}
                        aria-label="Fermer"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom du Projet *</label>
                        <input 
                            type="text" 
                            id="nom" 
                            name="nom"
                            value={newProjet.nom}
                            onChange={handleNewProjetChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                            placeholder="Ex: Refonte du site web"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea 
                            id="description" 
                            name="description"
                            value={newProjet.description}
                            onChange={handleNewProjetChange} 
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="Décrivez brièvement les objectifs du projet"
                        ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700">Date de Début</label>
                            <input 
                                type="date" 
                                id="dateDebut" 
                                name="dateDebut"
                                value={newProjet.dateDebut}
                                onChange={handleNewProjetChange} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700">Date de Fin</label>
                            <input 
                                type="date" 
                                id="dateFin" 
                                name="dateFin"
                                value={newProjet.dateFin}
                                onChange={handleNewProjetChange} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
                        >
                            Annuler
                        </button>
                        <button 
                            type="button" 
                            onClick={addProjet}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150 flex items-center"
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
                            Ajouter Projet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const DeleteConfirmationModal = () => (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center text-red-500 mb-4">
                    <AlertTriangle size={24} className="mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Confirmer la suppression</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer le projet 
                    <strong className="font-medium text-gray-900"> "{projetToDelete?.nom}"</strong> ?
                    Cette action est irréversible.
                </p>
                
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => {
                            setShowDeleteModal(false);
                            setProjetToDelete(null);
                        }} 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={deleteProjet} 
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-150 flex items-center"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Trash2 size={18} className="mr-2" />}
                        Confirmer la suppression
                    </button>
                </div>
            </div>
        </div>
    );

    // --- Rendu d'une Ligne de Projet (pour le mode Table Desktop) ---
    const renderProjetRow = (projet) => {
        const isEditing = editingProjet && editingProjet.id === projet.id;
        const managerName = projet.utilisateur 
            ? projet.utilisateur.nom || `ID: ${projet.utilisateur.id}` 
            : 'N/A';
        
        return (
            <tr key={projet.id} className="hover:bg-blue-50/50 transition duration-150">
                {isEditing ? (
                    // Ligne d'édition optimisée pour le desktop
                    <td colSpan="6" className="p-3 bg-blue-50/70 border-b border-blue-200">
                        <div className="flex flex-col xl:flex-row items-stretch xl:items-center space-y-2 xl:space-y-0 xl:space-x-3 w-full">
                            <input type="text" name="nom" value={editingProjet.nom} onChange={handleEditProjetChange} className="p-2 border border-blue-400 rounded-lg w-full xl:w-[20%] text-base font-semibold" placeholder="Nom" />
                            <textarea name="description" value={editingProjet.description} onChange={handleEditProjetChange} rows="1" className="p-2 border border-blue-400 rounded-lg w-full xl:w-[30%] text-base overflow-hidden resize-none" placeholder="Description" />
                            <input type="date" name="dateDebut" value={editingProjet.dateDebut} onChange={handleEditProjetChange} className="p-2 border border-blue-400 rounded-lg w-full xl:w-[15%] text-base" />
                            <input type="date" name="dateFin" value={editingProjet.dateFin} onChange={handleEditProjetChange} className="p-2 border border-blue-400 rounded-lg w-full xl:w-[15%] text-base" />
                            
                            <span className="p-2 text-base text-gray-600 w-full xl:w-[10%] truncate bg-gray-100 rounded-lg block xl:inline-block font-medium">{managerName}</span>

                            <div className="flex space-x-2 w-full xl:w-[10%] justify-end flex-shrink-0">
                                <button type="button" onClick={updateProjet} className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600 transition duration-150 shadow-md flex-shrink-0" aria-label="Sauvegarder" disabled={loading}>
                                    <Save size={20} />
                                </button>
                                <button type="button" onClick={cancelEditing} className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition duration-150 shadow-md flex-shrink-0" aria-label="Annuler">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </td>
                ) : (
                    <>
                        {/* Cellules de données avec boutons d'action */}
                        <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 max-w-[200px] truncate">{projet.nom}</td>
                        <td className="px-6 py-4 text-base text-gray-700 max-w-sm truncate">{projet.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-blue-600">{formatDate(projet.dateDebut)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-red-600">{formatDate(projet.dateFin)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 font-medium">
                            {managerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-base font-medium">
                            <div className="flex justify-center space-x-2">
                                <button 
                                    onClick={() => startEditing(projet)} 
                                    className="p-2 text-blue-600 hover:text-blue-800 transition duration-150 bg-blue-100 rounded-full shadow-md"
                                    aria-label={`Éditer ${projet.nom}`}
                                >
                                    <Edit size={20} />
                                </button>
                                <button 
                                    onClick={() => confirmDelete(projet)} 
                                    className="p-2 text-red-600 hover:text-red-800 transition duration-150 bg-red-100 rounded-full shadow-md"
                                    aria-label={`Supprimer ${projet.nom}`}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </td>
                    </>
                )}
            </tr>
        );
    };


    // --- Rendu des Cartes de Projet (pour le mode Mobile) ---
    const renderProjetCards = () => (
        <div className="grid grid-cols-1 gap-6 sm:hidden">
            {projets.map((projet) => {
                const isEditing = editingProjet && editingProjet.id === projet.id;
                const managerName = projet.utilisateur ? projet.utilisateur.nom || `ID: ${projet.utilisateur.id}` : 'N/A';

                return (
                    <div key={projet.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg space-y-4">
                        {isEditing ? (
                            <div className="space-y-3">
                                <input type="text" name="nom" value={editingProjet.nom} onChange={handleEditProjetChange} className="w-full p-2 border border-blue-400 rounded-md font-bold text-lg" placeholder="Nom" />
                                <textarea name="description" value={editingProjet.description} onChange={handleEditProjetChange} rows="2" className="w-full p-2 border border-blue-400 rounded-md text-sm" placeholder="Description" />
                                
                                <div className="flex space-x-2">
                                    <input type="date" name="dateDebut" value={editingProjet.dateDebut} onChange={handleEditProjetChange} className="w-1/2 p-2 border border-blue-400 rounded-md text-sm" />
                                    <input type="date" name="dateFin" value={editingProjet.dateFin} onChange={handleEditProjetChange} className="w-1/2 p-2 border border-blue-400 rounded-md text-sm" />
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-2">
                                    <button type="button" onClick={updateProjet} className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600 shadow-md" aria-label="Sauvegarder" disabled={loading}>
                                        <Save size={18} />
                                    </button>
                                    <button type="button" onClick={cancelEditing} className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600 shadow-md" aria-label="Annuler">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="text-xl font-extrabold text-blue-700 border-b pb-1">{projet.nom}</h3>
                                
                                <p className="text-gray-700 flex items-start">
                                    <FileText size={18} className="mr-2 mt-1 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm">{projet.description}</span>
                                </p>

                                <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                                    <p className="flex items-center text-green-600 font-medium">
                                        <Calendar size={14} className="mr-1" />
                                        Début: {formatDate(projet.dateDebut)}
                                    </p>
                                    <p className="flex items-center text-red-600 font-medium">
                                        <Calendar size={14} className="mr-1" />
                                        Fin: {formatDate(projet.dateFin)}
                                    </p>
                                </div>
                                
                                <p className="flex items-center text-sm text-gray-700 pt-1">
                                    <User size={16} className="mr-2 text-gray-500" />
                                    <strong className="font-semibold">Gérant:</strong> {managerName}
                                </p>

                                <div className="flex justify-end space-x-2 pt-2">
                                    <button 
                                        onClick={() => startEditing(projet)} 
                                        className="p-2 text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full shadow-sm"
                                        aria-label={`Éditer ${projet.nom}`}
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button 
                                        onClick={() => confirmDelete(projet)} 
                                        className="p-2 text-red-600 hover:text-red-800 bg-red-100 rounded-full shadow-sm"
                                        aria-label={`Supprimer ${projet.nom}`}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    // --- Rendu de la Pagination ---
    const PaginationControls = () => {
        if (totalPages <= 1) return null; // Ne rien afficher s'il n'y a qu'une page ou moins

        return (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                    Affichage de la page <strong className="font-bold">{currentPage + 1}</strong> sur <strong className="font-bold">{totalPages}</strong> ({totalElements} projets au total).
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => fetchProjets(currentPage - 1)}
                        disabled={currentPage === 0 || loading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 shadow-sm"
                        aria-label="Page précédente"
                    >
                        <ChevronLeft size={18} className="mr-1" /> Précédent
                    </button>
                    <button
                        onClick={() => fetchProjets(currentPage + 1)}
                        disabled={currentPage === totalPages - 1 || loading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 shadow-md"
                        aria-label="Page suivante"
                    >
                        Suivant <ChevronRight size={18} className="ml-1" />
                    </button>
                </div>
            </div>
        );
    };

    // --- Fonction de Rendu Principale du Tableau/Cartes ---
    const renderProjetContent = () => {
        if (loading && projets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    <p>Chargement des projets en cours...</p>
                </div>
            );
        }
        
        if (error && projets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertTriangle size={32} className="mb-4" />
                    <p className="font-semibold text-lg">Erreur de connexion</p>
                    <p className="text-sm text-center mt-1">{error}</p>
                </div>
            );
        }
        
        if (projets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-xl">
                    <CheckCircle size={32} className="text-green-500 mb-4" />
                    <p className="text-lg font-medium">Aucun projet trouvé.</p>
                    <p className="text-sm mt-1">Cliquez sur "Ajouter un projet" pour commencer !</p>
                </div>
            );
        }

        return (
            <>
                {/* 1. Vue Table (Desktop et plus) */}
                <div className="hidden sm:block overflow-x-auto rounded-xl shadow-2xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-blue-600/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-blue-800 uppercase tracking-wider">Nom du Projet</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-blue-800 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-blue-800 uppercase tracking-wider min-w-[150px]">Date de Début</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-blue-800 uppercase tracking-wider min-w-[150px]">Date de Fin</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-blue-800 uppercase tracking-wider min-w-[150px]">Gérant</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-blue-800 uppercase tracking-wider min-w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projets.map(renderProjetRow)}
                        </tbody>
                    </table>
                </div>

                {/* 2. Vue Cartes (Mobile) */}
                {renderProjetCards()}

                {/* 3. Contrôles de Pagination */}
                <PaginationControls />
            </>
        );
    };

    // --- Rendu Principal du Composant ---

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
            <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900 border-b-4 border-blue-500 pb-1">
                    Gestion des Projets
                </h1>
                
                <div className="flex space-x-3">
                    <button
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-xl shadow-lg hover:bg-gray-300 transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => fetchProjets(currentPage)}
                        disabled={loading}
                        aria-label="Rafraîchir les données"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
                    </button>

                    <button 
                        className="flex items-center space-x-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300" 
                        onClick={() => setShowAddModal(true)}
                        disabled={loading}
                    >
                        <Plus size={20} />
                        <span>Ajouter Projet</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {error && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 flex items-center shadow-md">
                        <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
                        <span className="font-medium">Erreur:</span> {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-100 flex items-center shadow-md">
                        <CheckCircle size={20} className="mr-3 flex-shrink-0" />
                        <span className="font-medium">Succès:</span> {successMessage}
                    </div>
                )}
                
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Liste des Projets</h2>
                    {renderProjetContent()}
                </div>
            </main>

            {showAddModal && <AddProjetModal />}
            {showDeleteModal && <DeleteConfirmationModal />}
        </div>
    );
};

export default App;