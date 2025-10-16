// Composant TaskCard
import React, { useState, useEffect, useCallback } from "react";
import './Dashboard.css'
import {
    Folder,
    CheckSquare,
    Bell,
    PlusCircle,
    LayoutDashboard,
    User,
    LogOut,
    Clock,
    RefreshCw,
    Edit2,
    Trash2,
    X,
    Save,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = "http://localhost:8080/api";
const USER_ID_CONNECTE = 1;

const StatCard = ({ icon, title, count, color }) => (
    <div className="col-lg-3 col-md-6 col-sm-12">
        <div className="glass-card d-flex align-items-center gap-4">
            <div className={`stat-icon bg-${color}`}>
                {icon}
            </div>
            <div>
                <p className="mb-1 text-muted small">{title}</p>
                <h4 className={`text-${color} mb-0 fw-bold`}>{count}</h4>
            </div>
        </div>
    </div>
);

const UserDashboard = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [notifications] = useState([
        { id: 1, message: "Nouvelle tâche assignée", time: "9:30 AM" },
        { id: 2, message: "Projet Beta mis à jour", time: "10:00 AM" },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // États pour la pagination des projets
    const [projectPage, setProjectPage] = useState(0);
    const [projectTotalPages, setProjectTotalPages] = useState(1);
    const [projectPageSize] = useState(6);

    // États pour la pagination des tâches
    const [taskPage, setTaskPage] = useState(0);
    const [taskTotalPages, setTaskTotalPages] = useState(1);
    const [taskPageSize] = useState(8);

    // États pour l'édition
    const [editingProject, setEditingProject] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    const today = new Date().toISOString().split('T')[0];
    const [newProject, setNewProject] = useState({
        name: "",
        startDate: today,
        endDate: "",
        description: "",
    });

    const [newTache, setNewTask] = useState({
        titre: "",
        priorite: "MOYENNE",
        echeance: "",
        idProjet: "",
    });

    const statusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "terminé":
            case "termine":
                return "success";
            case "en cours":
                return "warning";
            default:
                return "secondary";
        }
    };

    const priorityColor = (priority) => {
        switch (priority?.toUpperCase()) {
            case "HAUTE":
                return "danger";
            case "MOYENNE":
                return "warning";
            case "BASSE":
                return "info";
            default:
                return "secondary";
        }
    };

    // ===================================
    // FONCTIONS DE RÉCUPÉRATION (GET)
    // ===================================

    const fetchProjects = useCallback(async (page = projectPage) => {
        setIsLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}/projets?page=${page}&size=${projectPageSize}&sortBy=id`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();

            setProjects(data.content.map((p) => ({
                id: p.id,
                name: p.nom || p.name,
                progress: p.progress || 0,
                startDate: p.dateDebut || p.startDate,
                endDate: p.dateFin || p.endDate,
                description: p.description || "",
            })));
            
            setProjectTotalPages(data.totalPages);
            setProjectPage(data.number);

        } catch (err) {
            console.error("Erreur de chargement des projets:", err);
            setError(`Erreur de chargement des projets: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [projectPage, projectPageSize]);

    const fetchTasks = useCallback(async (page = taskPage) => {
        setIsLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}/taches?page=${page}&size=${taskPageSize}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();

            // Adapter selon votre structure de table
            const mappedTasks = Array.isArray(data) ? data : (data.content || []);
            
            setTasks(mappedTasks.map((t) => ({
                id: t.id_task || t.id,
                titre: t.titre_task || t.titre,
                priorite: t.priorite_task || t.priorite || "MOYENNE",
                echeance: t.echeance_task || t.echeance,
                datecreation: t.datecreation_task || t.datecreation,
                datemodification: t.datemodification_task || t.datemodification,
                idProjet: t.id_projet || t.idProjet,
                idUsers: t.id_users || t.idUsers,
                status: t.status || "EN_COURS",
            })));

            if (data.totalPages) {
                setTaskTotalPages(data.totalPages);
                setTaskPage(data.number);
            }

        } catch (err) {
            console.error("Erreur de chargement des tâches:", err);
            setError(`Erreur de chargement des tâches: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [taskPage, taskPageSize]);

    // ===================================
    // FONCTIONS D'AJOUT (POST)
    // ===================================

    const addProject = async (e) => {
        e.preventDefault();
        if (!newProject.name.trim() || !newProject.startDate || !newProject.endDate) {
            alert("Veuillez remplir le nom et les dates du projet.");
            return;
        }

        try {
            const payload = {
                nom: newProject.name,
                description: newProject.description,
                dateDebut: newProject.startDate,
                dateFin: newProject.endDate,
            };

            const url = `${API_BASE_URL}/projets?userId=${USER_ID_CONNECTE}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Échec: ${errorText}`);
            }

            alert("✅ Projet ajouté avec succès !");
            setNewProject({ name: "", startDate: today, endDate: "", description: "" });
            fetchProjects(0);
            setActivePage("projects");

        } catch (err) {
            alert("❌ Erreur: " + err.message);
        }
    };

    const addTache = async (e) => {
        e.preventDefault();
        if (!newTache.titre.trim() || !newTache.idProjet) {
            alert("Veuillez remplir le titre et sélectionner un projet.");
            return;
        }
        
        try {
            const payload = {
                titre_task: newTache.titre,
                priorite_task: newTache.priorite,
                echeance_task: newTache.echeance || null,
                status: newTache.status,
                id_users: USER_ID_CONNECTE,
            };

            // Ajout de projetId comme paramètre d'URL
            const response = await fetch(`${API_BASE_URL}/taches?projetId=${newTache.idProjet}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Échec: ${errorText}`);
            }

            alert("✅ Tâche ajoutée avec succès !");
            setNewTask({ titre: "", priorite: "MOYENNE", echeance: "", status: "EN_COURS", idProjet: "" });
            fetchTasks(0);
            setActivePage("tasks");

        } catch (err) {
            alert("❌ Erreur: " + err.message);
        }
    };

    // ===================================
    // FONCTIONS DE MODIFICATION (PUT)
    // ===================================

    const updateProject = async (projectId, updatedData) => {
        try {
            const payload = {
                nom: updatedData.name,
                description: updatedData.description,
                dateDebut: updatedData.startDate,
                dateFin: updatedData.endDate,
            };

            const response = await fetch(`${API_BASE_URL}/projets/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Échec de la modification");
            }

            alert("✅ Projet modifié avec succès !");
            setEditingProject(null);
            fetchProjects(projectPage);

        } catch (err) {
            alert("❌ Erreur: " + err.message);
        }
    };

    const updateTask = async (taskId, updatedData) => {
        try {
            const payload = {
                titre_task: updatedData.titre,
                priorite_task: updatedData.priorite,
                echeance_task: updatedData.echeance || null,
                status: updatedData.status,
                id_users: USER_ID_CONNECTE,
            };

            // Ajout de projetId comme paramètre d'URL pour la mise à jour
            const response = await fetch(`${API_BASE_URL}/taches/${taskId}?projetId=${updatedData.idProjet}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Échec de la modification");
            }

            alert("✅ Tâche modifiée avec succès !");
            setEditingTask(null);
            fetchTasks(taskPage);

        } catch (err) {
            alert("❌ Erreur: " + err.message);
        }
    };

    // ===================================
    // FONCTIONS DE SUPPRESSION (DELETE)
    // ===================================

    const deleteProject = async (projectId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/projets/${projectId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Échec de la suppression");
            }

            alert("✅ Projet supprimé avec succès !");
            fetchProjects(projectPage);

        } catch (err) {
            alert("❌ Erreur: " + err.message);
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/taches/${taskId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Échec de la suppression");
            }

            alert("✅ Tâche supprimée avec succès !");
            fetchTasks(taskPage);

        } catch (err) {
            alert("❌ Erreur: " + err.message);
        }
    };

    // ===================================
    // EFFECT HOOK
    // ===================================

    useEffect(() => {
        if (activePage === "dashboard") {
            fetchProjects(0);
            fetchTasks(0);
        } else if (activePage === "projects") {
            fetchProjects();
        } else if (activePage === "tasks") {
            fetchTasks();
        }
    }, [activePage, fetchProjects, fetchTasks]);

    // ===================================
    // PAGINATION
    // ===================================

    const renderProjectPagination = () => (
        <div className="d-flex justify-content-center gap-3 mt-4">
            <button
                className="btn btn-outline-primary"
                onClick={() => fetchProjects(projectPage - 1)}
                disabled={projectPage === 0 || isLoading}
            >
                Précédent
            </button>
            <span className="align-self-center text-muted">
                Page {projectPage + 1} sur {projectTotalPages}
            </span>
            <button
                className="btn btn-primary"
                onClick={() => fetchProjects(projectPage + 1)}
                disabled={projectPage >= projectTotalPages - 1 || isLoading}
            >
                Suivant
            </button>
        </div>
    );

    const renderTaskPagination = () => (
        <div className="d-flex justify-content-center gap-3 mt-4">
            <button
                className="btn btn-outline-primary"
                onClick={() => fetchTasks(taskPage - 1)}
                disabled={taskPage === 0 || isLoading}
            >
                Précédent
            </button>
            <span className="align-self-center text-muted">
                Page {taskPage + 1} sur {taskTotalPages}
            </span>
            <button
                className="btn btn-primary"
                onClick={() => fetchTasks(taskPage + 1)}
                disabled={taskPage >= taskTotalPages - 1 || isLoading}
            >
                Suivant
            </button>
        </div>
    );

    // ===================================
    // RENDER PRINCIPAL
    // ===================================

    return (
        <>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
            <div style={{
                display: "flex",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f0f4ff, #e0e8f0)",
            }}>
                {/* Sidebar */}
                <aside className="sidebar">
                    <h2 className="sidebar-title">Mon Dashboard 🚀</h2>
                    <button
                        className={`sidebar-btn ${activePage === "dashboard" ? "active" : ""}`}
                        onClick={() => setActivePage("dashboard")}
                    >
                        <LayoutDashboard size={20} /> Accueil
                    </button>
                    <button
                        className={`sidebar-btn ${activePage === "projects" ? "active" : ""}`}
                        onClick={() => setActivePage("projects")}
                    >
                        <Folder size={20} /> Projets
                    </button>
                    <button
                        className={`sidebar-btn ${activePage === "tasks" ? "active" : ""}`}
                        onClick={() => setActivePage("tasks")}
                    >
                        <CheckSquare size={20} /> Tâches
                    </button>
                    <button
                        className={`sidebar-btn ${activePage === "notifications" ? "active" : ""}`}
                        onClick={() => setActivePage("notifications")}
                    >
                        <Bell size={20} /> Notifications
                    </button>
                    <button
                        className={`sidebar-btn ${activePage === "profile" ? "active" : ""}`}
                        onClick={() => setActivePage("profile")}
                    >
                        <User size={20} /> Profil
                    </button>
                    <div style={{ flexGrow: 1 }}></div>
                    <button className="sidebar-btn text-danger">
                        <LogOut size={20} /> Déconnexion
                    </button>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    <h1 className="fw-bold mb-4">Bienvenue, Utilisateur 👋</h1>
                    
                    {error && <div className="alert alert-danger">{error}</div>}
                    {isLoading && (
                        <div className="d-flex align-items-center mb-3 text-primary">
                            <RefreshCw size={18} className="me-2" style={{animation: "spin 1s linear infinite"}} />
                            Chargement...
                        </div>
                    )}
                    
                    {/* Dashboard */}
                    {activePage === "dashboard" && (
                        <>
                            <div className="row g-4 mb-5">
                                <StatCard
                                    icon={<Folder size={24} />}
                                    title="Projets"
                                    count={projects.length}
                                    color="primary"
                                />
                                <StatCard
                                    icon={<Clock size={24} />}
                                    title="Tâches en cours"
                                    count={tasks.filter(t => t.status?.toUpperCase() === "EN_COURS").length}
                                    color="warning"
                                />
                                <StatCard
                                    icon={<CheckSquare size={24} />}
                                    title="Tâches terminées"
                                    count={tasks.filter(t => t.status?.toUpperCase() === "TERMINE").length}
                                    color="success"
                                />
                                <StatCard
                                    icon={<Bell size={24} />}
                                    title="Notifications"
                                    count={notifications.length}
                                    color="danger"
                                />
                            </div>

                            <h2 className="fs-5 fw-bold mb-3">Projets récents</h2>
                            <div className="row g-4 mb-5">
                                {projects.slice(0, 3).map(p => (
                                    <div key={p.id} className="col-lg-4 col-md-6">
                                        <ProjectCard project={p} />
                                    </div>
                                ))}
                                {projects.length === 0 && !isLoading && (
                                    <p className="text-muted ms-3">Aucun projet disponible.</p>
                                )}
                            </div>

                            <h2 className="fs-5 fw-bold mb-3">Tâches en attente</h2>
                            <div className="row g-4">
                                {tasks.filter(t => t.status?.toUpperCase() === "EN_COURS").slice(0, 4).map(t => (
                                    <div key={t.id} className="col-lg-3 col-md-6">
                                        <TaskCard task={t} priorityColor={priorityColor} />
                                    </div>
                                ))}
                                {tasks.filter(t => t.status?.toUpperCase() === "EN_COURS").length === 0 && !isLoading && (
                                    <p className="text-muted ms-3">Toutes les tâches sont terminées ! 🎉</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Projects Page */}
                    {activePage === "projects" && (
                        <>
                            <h2 className="fs-5 fw-bold mb-3">Ajouter un nouveau Projet</h2>
                            <form onSubmit={addProject} className="glass-card mb-4">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nom du projet"
                                            value={newProject.name}
                                            onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={newProject.startDate}
                                            onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={newProject.endDate}
                                            onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Description"
                                            value={newProject.description}
                                            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <button type="submit" className="btn btn-primary w-100">
                                            <PlusCircle size={18} /> Ajouter
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <h2 className="fs-5 fw-bold mb-3">Liste des Projets</h2>
                            <div className="row g-4">
                                {projects.map(p => (
                                    <div key={p.id} className="col-lg-4 col-md-6">
                                        {editingProject?.id === p.id ? (
                                            <div className="glass-card">
                                                <h5 className="mb-3">Modifier le projet</h5>
                                                <input
                                                    type="text"
                                                    className="form-control mb-2"
                                                    value={editingProject.name}
                                                    onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                                                />
                                                <input
                                                    type="date"
                                                    className="form-control mb-2"
                                                    value={editingProject.startDate}
                                                    onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})}
                                                />
                                                <input
                                                    type="date"
                                                    className="form-control mb-2"
                                                    value={editingProject.endDate}
                                                    onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})}
                                                />
                                                <textarea
                                                    className="form-control mb-3"
                                                    value={editingProject.description}
                                                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                                                />
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-success btn-sm flex-grow-1"
                                                        onClick={() => updateProject(p.id, editingProject)}
                                                    >
                                                        <Save size={16} /> Sauvegarder
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setEditingProject(null)}
                                                    >
                                                        <X size={16} /> Annuler
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="glass-card">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h5 className="fw-bold text-primary mb-0">{p.name}</h5>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="action-btn btn-edit"
                                                            onClick={() => setEditingProject(p)}
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            className="action-btn btn-delete"
                                                            onClick={() => deleteProject(p.id)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-muted small mb-3">{p.description || "Pas de description"}</p>
                                                <p className="small mb-2">
                                                    <strong>Période:</strong> {p.startDate} → {p.endDate}
                                                </p>
                                                <div className="progress" style={{height: "8px"}}>
                                                    <div
                                                        className="progress-bar bg-primary"
                                                        style={{width: `${p.progress}%`}}
                                                    ></div>
                                                </div>
                                                <small className="text-muted">{p.progress}% complété</small>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {projectTotalPages > 1 && renderProjectPagination()}
                        </>
                    )}

                    {/* Tasks Page */}
                    {activePage === "tasks" && (
                        <>
                            <h2 className="fs-5 fw-bold mb-3">Ajouter une nouvelle Tâche</h2>
                            <form onSubmit={addTache} className="glass-card mb-4">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label small text-muted">Titre *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Titre de la tâche"
                                            value={newTache.titre}
                                            onChange={(e) => setNewTask({...newTache, titre: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small text-muted">Priorité</label>
                                        <select
                                            className="form-select"
                                            value={newTache.priorite}
                                            onChange={(e) => setNewTask({...newTache, priorite: e.target.value})}
                                        >
                                            <option value="BASSE">Basse</option>
                                            <option value="MOYENNE">Moyenne</option>
                                            <option value="HAUTE">Haute</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small text-muted">Statut</label>
                                        <select
                                            className="form-select"
                                            value={newTache.status}
                                            onChange={(e) => setNewTask({...newTache, status: e.target.value})}
                                        >
                                            <option value="EN_COURS">En cours</option>
                                            <option value="TERMINE">Terminé</option>
                                            <option value="EN_ATTENTE">En attente</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small text-muted">Échéance</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={newTache.echeance}
                                            onChange={(e) => setNewTask({...newTache, echeance: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small text-muted">Projet *</label>
                                        <select
                                            className="form-select"
                                            value={newTache.idProjet}
                                            onChange={(e) => setNewTask({...newTache, idProjet: e.target.value})}
                                            required
                                        >
                                            <option value="">Sélectionner</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-1 d-flex align-items-end">
                                        <button type="submit" className="btn btn-primary w-100">
                                            <PlusCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <h2 className="fs-5 fw-bold mb-3">Liste des Tâches</h2>
                            <div className="row g-4">
                                {tasks.map(t => (
                                    <div key={t.id} className="col-lg-3 col-md-6">
                                        {editingTask?.id === t.id ? (
                                            <div className="glass-card">
                                                <h6 className="mb-3">Modifier la tâche</h6>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm mb-2"
                                                    placeholder="Titre"
                                                    value={editingTask.titre}
                                                    onChange={(e) => setEditingTask({...editingTask, titre: e.target.value})}
                                                />
                                                <select
                                                    className="form-select form-select-sm mb-2"
                                                    value={editingTask.priorite}
                                                    onChange={(e) => setEditingTask({...editingTask, priorite: e.target.value})}
                                                >
                                                    <option value="BASSE">Basse</option>
                                                    <option value="MOYENNE">Moyenne</option>
                                                    <option value="HAUTE">Haute</option>
                                                </select>
                                                <select
                                                    className="form-select form-select-sm mb-2"
                                                    value={editingTask.status}
                                                    onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                                                >
                                                    <option value="EN_COURS">En cours</option>
                                                    <option value="TERMINE">Terminé</option>
                                                    <option value="EN_ATTENTE">En attente</option>
                                                </select>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm mb-2"
                                                    value={editingTask.echeance || ""}
                                                    onChange={(e) => setEditingTask({...editingTask, echeance: e.target.value})}
                                                />
                                                <select
                                                    className="form-select form-select-sm mb-3"
                                                    value={editingTask.idProjet}
                                                    onChange={(e) => setEditingTask({...editingTask, idProjet: e.target.value})}
                                                >
                                                    {projects.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-success btn-sm flex-grow-1"
                                                        onClick={() => updateTask(t.id, editingTask)}
                                                    >
                                                        <Save size={14} /> Sauvegarder
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setEditingTask(null)}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="glass-card">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="fw-bold mb-0">{t.titre}</h6>
                                                    <div className="d-flex gap-1">
                                                        <button
                                                            className="action-btn btn-edit"
                                                            onClick={() => setEditingTask(t)}
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            className="action-btn btn-delete"
                                                            onClick={() => deleteTask(t.id)}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <span className={`badge bg-${priorityColor(t.priorite)} me-2`}>
                                                        {t.priorite}
                                                    </span>
                                                    <span className={`badge bg-${t.status === "TERMINE" ? "success" : t.status === "EN_COURS" ? "warning" : "secondary"}`}>
                                                        {t.status === "EN_COURS" ? "En cours" : t.status === "TERMINE" ? "Terminé" : "En attente"}
                                                    </span>
                                                </div>
                                                {t.echeance && (
                                                    <p className="small mb-1">
                                                        <Clock size={12} className="me-1" />
                                                        <strong>Échéance:</strong> {t.echeance}
                                                    </p>
                                                )}
                                                {t.datecreation && (
                                                    <p className="small text-muted mb-1">
                                                        <strong>Créé le:</strong> {new Date(t.datecreation).toLocaleDateString()}
                                                    </p>
                                                )}
                                                <p className="small text-muted mb-0">
                                                    <strong>Projet:</strong> {projects.find(p => p.id === t.idProjet)?.name || "Non assigné"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {tasks.length === 0 && !isLoading && (
                                    <p className="text-muted ms-3">Aucune tâche disponible.</p>
                                )}
                            </div>
                            {taskTotalPages > 1 && renderTaskPagination()}
                        </>
                    )}

                    {/* Notifications */}
                    {activePage === "notifications" && (
                        <>
                            <h2 className="fs-5 fw-bold mb-3">Notifications</h2>
                            <div className="d-flex flex-column gap-3">
                                {notifications.map(n => (
                                    <div key={n.id} className="glass-card d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <Bell size={20} className="text-secondary me-3" />
                                            <p className="mb-0 fw-medium">{n.message}</p>
                                        </div>
                                        <small className="text-muted">{n.time}</small>
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <p className="text-muted">Aucune nouvelle notification.</p>
                                )}
                            </div>
                        </>
                    )}
                    
                    {/* Profile */}
                    {activePage === "profile" && (
                        <div className="glass-card p-5 text-center">
                            <h2 className="fw-bold mb-4 text-primary">Mon Profil</h2>
                            <User size={60} className="text-primary mb-3" />
                            <p className="text-muted">Vous êtes actuellement connecté en tant qu'utilisateur standard.</p>
                            <p className="small text-secondary">Utilisez cette page pour gérer vos paramètres de compte.</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

// Composant ProjectCard
const ProjectCard = ({ project }) => (
    <div className="glass-card h-100">
        <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="fw-bold text-primary">{project.name}</h5>
            <Folder size={24} className="text-secondary" />
        </div>
        <p className="text-muted small mb-3">{project.description || "Pas de description"}</p>
        <p className="small mb-2">
            <strong>Période:</strong> {project.startDate} → {project.endDate}
        </p>
        <div className="progress" style={{height: "8px"}}>
            <div
                className="progress-bar bg-primary"
                style={{width: `${project.progress}%`}}
            ></div>
        </div>
        <small className="text-muted">{project.progress}% complété</small>
    </div>
);

// Composant TaskCard
const TaskCard = ({ task, priorityColor }) => (
    <div className="glass-card h-100">
        <h6 className="fw-bold mb-2">{task.titre}</h6>
        <div className="mb-2">
            <span className={`badge bg-${priorityColor(task.priorite)}`}>
                {task.priorite}
            </span>
        </div>
        {task.echeance && (
            <p className="small mb-1">
                <Clock size={12} className="me-1" />
                <strong>Échéance:</strong> {task.echeance}
            </p>
        )}
        <p className="small text-muted mb-0">
            <strong>Statut:</strong> {task.statut}
        </p>
    </div>
);

export default UserDashboard;