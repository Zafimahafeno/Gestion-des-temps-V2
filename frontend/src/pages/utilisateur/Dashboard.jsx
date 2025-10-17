// ============================================
    // 🎯 EFFECT - CHARGEMENT INITIAL
    // ============================================
import React, { useState, useEffect, useCallback } from "react";
import {
    Folder, CheckSquare, Bell, PlusCircle, LayoutDashboard, User, LogOut,
    Clock, RefreshCw, Edit2, Trash2, X, Save, Calendar, TrendingUp,
    AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

// ============================================
// 🔧 CONFIGURATION API - ADAPTÉE À VOS CONTRÔLEURS
// ============================================
const API_CONFIG = {
    BASE_URL: "http://localhost:8080/api", // ✅ Correspond à votre backend
    
    // Endpoints des projets (selon ProjetController)
    PROJECTS: {
        GET_ALL: "/projets/liste",      // GET /api/projets/liste/{userId}
        CREATE: "/projets",              // POST /api/projets?userId={userId}
        GET_DETAIL: "/projets/detail",   // GET /api/projets/detail/{id}
        UPDATE: "/projets",              // PUT /api/projets/{id}
        DELETE: "/projets",              // DELETE /api/projets/{id}
    },
    
    // Endpoints des tâches (selon TacheController)
    TASKS: {
        GET_BY_PROJECT: "/taches/projet", // GET /api/taches/projet/{projetId}
        CREATE: "/taches",                 // POST /api/taches?projetId={projetId}
        GET_DETAIL: "/taches",             // GET /api/taches/{id}
        UPDATE: "/taches",                 // PUT /api/taches/{id}
        DELETE: "/taches",                 // DELETE /api/taches/{id}
    }
};

// ============================================
// 👤 FONCTION POUR RÉCUPÉRER L'ID DE L'UTILISATEUR CONNECTÉ
// ============================================
// 🔹 Option 1: Depuis le localStorage (après login) - RECOMMANDÉ
const getUserId = () => {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : 1; // Fallback temporaire pour tests
};

// 🔹 Option 2: Depuis un token JWT décodé
// const getUserId = () => {
//     const token = localStorage.getItem('authToken');
//     if (!token) return null;
//     try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         return payload.userId || payload.id;
//     } catch (e) {
//         return null;
//     }
// };

// 🔹 Pour stocker l'ID au login, utilisez:
// localStorage.setItem('userId', response.data.id);

// ============================================
// 📊 COMPOSANT STAT CARD
// ============================================
const StatCard = ({ icon, title, count, color, trend }) => (
    <div className="col-lg-3 col-md-6 col-sm-12">
        <div className="stat-card">
            <div className="stat-header">
                <div className={`stat-icon-wrapper stat-${color}`}>{icon}</div>
                {trend && (
                    <div className="stat-trend">
                        <TrendingUp size={14} /><span>+{trend}%</span>
                    </div>
                )}
            </div>
            <div className="stat-body">
                <p className="stat-title">{title}</p>
                <h3 className="stat-count">{count}</h3>
            </div>
        </div>
    </div>
);

// ============================================
// 📁 COMPOSANT PROJECT CARD
// ============================================
const ProjectCard = ({ project, onEdit, onDelete }) => (
    <div className="glass-card project-card">
        <div className="project-header">
            <h5 className="project-title">{project.name}</h5>
            <div className="project-actions">
                <button className="action-btn btn-edit" onClick={() => onEdit(project)}>
                    <Edit2 size={14} />
                </button>
                <button className="action-btn btn-delete" onClick={() => onDelete(project.id)}>
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
        <p className="project-description">{project.description || "Aucune description"}</p>
        <div className="project-dates">
            <Calendar size={14} />
            <span>{project.startDate} → {project.endDate}</span>
        </div>
        <div className="progress-container">
            <div className="progress">
                <div className="progress-bar" style={{ width: `${project.progress || 0}%` }}></div>
            </div>
            <span className="progress-text">{project.progress || 0}% complété</span>
        </div>
    </div>
);

// ============================================
// ✅ COMPOSANT TASK CARD
// ============================================
const TaskCard = ({ task, onEdit, onDelete, projects }) => {
    const statusConfig = {
        TERMINE: { color: "success", label: "Terminé", icon: <CheckCircle2 size={14} /> },
        EN_COURS: { color: "primary", label: "En cours", icon: <Clock size={14} /> },
        EN_ATTENTE: { color: "warning", label: "En attente", icon: <AlertCircle size={14} /> },
    };
    
    const priorityColors = { HAUTE: "danger", MOYENNE: "warning", BASSE: "info" };
    const status = statusConfig[task.status] || statusConfig.EN_COURS;
    const priorityColor = priorityColors[task.priorite] || "secondary";

    return (
        <div className="glass-card task-card">
            <div className="task-header">
                <h6 className="task-title">{task.titre}</h6>
                <div className="d-flex gap-1">
                    <button className="action-btn btn-edit" onClick={() => onEdit(task)}>
                        <Edit2 size={12} />
                    </button>
                    <button className="action-btn btn-delete" onClick={() => onDelete(task.id)}>
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
            <div className="task-badges">
                <span className={`badge bg-${priorityColor}`}>{task.priorite}</span>
                <span className={`badge bg-${status.color}`}>{status.icon} {status.label}</span>
            </div>
            <div className="task-info">
                {task.echeance && (
                    <div><Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                    <strong>Échéance:</strong> {task.echeance}</div>
                )}
                <div><strong>Projet:</strong> {projects.find(p => p.id === task.idProjet)?.name || "Non assigné"}</div>
            </div>
        </div>
    );
};

// ============================================
// 📄 COMPOSANT PAGINATION
// ============================================
const Pagination = ({ page, totalPages, onPageChange, disabled }) => (
    <div className="pagination-container">
        <button className="pagination-btn" onClick={() => onPageChange(page - 1)} 
                disabled={page === 0 || disabled}>
            <ChevronLeft size={18} /> Précédent
        </button>
        <span className="pagination-info">
            Page <strong>{page + 1}</strong> sur <strong>{totalPages}</strong>
        </span>
        <button className="pagination-btn" onClick={() => onPageChange(page + 1)} 
                disabled={page >= totalPages - 1 || disabled}>
            Suivant <ChevronRight size={18} />
        </button>
    </div>
);

// ============================================
// 🏠 COMPOSANT PRINCIPAL DASHBOARD
// ============================================
const UserDashboard = () => {
    // ============================================
    // 👤 RÉCUPÉRATION DE L'ID UTILISATEUR CONNECTÉ
    // ============================================
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Récupérer l'ID de l'utilisateur au chargement du composant
        const id = getUserId();
        if (!id) {
            // Si pas d'utilisateur connecté, rediriger vers login
            alert("⚠️ Veuillez vous connecter");
            // window.location.href = "/login"; // Décommentez pour rediriger
            return;
        }
        setUserId(id);
    }, []);

    // États de navigation
    const [activePage, setActivePage] = useState("dashboard");
    
    // États de données
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [notifications] = useState([
        { id: 1, message: "Nouvelle tâche assignée", time: "Il y a 2h", type: "info" },
        { id: 2, message: "Projet Beta mis à jour", time: "Il y a 3h", type: "success" },
        { id: 3, message: "Échéance proche", time: "Il y a 5h", type: "warning" },
    ]);
    
    // États de chargement et erreurs
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // États de pagination
    const [projectPage, setProjectPage] = useState(0);
    const [projectTotalPages, setProjectTotalPages] = useState(1);
    const [taskPage, setTaskPage] = useState(0);
    const [taskTotalPages, setTaskTotalPages] = useState(1);

    // États d'édition
    const [editingProject, setEditingProject] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    // Formulaires
    const today = new Date().toISOString().split('T')[0];
    const [newProject, setNewProject] = useState({
        name: "", startDate: today, endDate: "", description: "",
    });
    const [newTask, setNewTask] = useState({
        titre: "", priorite: "MOYENNE", echeance: "", status: "EN_COURS", idProjet: "",
    });

    // ============================================
    // 🔄 API - RÉCUPÉRATION DES PROJETS PAR UTILISATEUR
    // ============================================
    const fetchProjects = useCallback(async () => {
        if (!userId) return;
        
        setIsLoading(true);
        setError(null);
        try {
            // ✅ GET /api/projets/liste/{userId}
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECTS.GET_ALL}/${userId}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            // 🔄 data est directement un tableau selon votre API
            setProjects(data.map((p) => ({
                id: p.id,
                name: p.nom,
                progress: p.progress || 0,
                startDate: p.dateDebut,
                endDate: p.dateFin,
                description: p.description || "",
            })));

        } catch (err) {
            console.error("❌ Erreur chargement projets:", err);
            setError(`Erreur de chargement des projets: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // ============================================
    // ➕ API - AJOUT D'UN PROJET
    // ============================================
    const addProject = async (e) => {
        e.preventDefault();
        
        if (!userId) {
            alert("⚠️ Erreur: Utilisateur non connecté");
            return;
        }
        
        if (!newProject.name.trim() || !newProject.startDate || !newProject.endDate) {
            alert("⚠️ Veuillez remplir tous les champs obligatoires");
            return;
        }

        setIsLoading(true);
        try {
            // ✅ Payload selon votre ProjetDTO
            const payload = {
                nom: newProject.name,
                description: newProject.description,
                dateDebut: newProject.startDate,
                dateFin: newProject.endDate,
            };

            // ✅ POST /api/projets?userId={userId}
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECTS.CREATE}?userId=${userId}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert("✅ Projet ajouté avec succès !");
            setNewProject({ name: "", startDate: today, endDate: "", description: "" });
            fetchProjects();
            setActivePage("projects");
        } catch (err) {
            alert("❌ Erreur: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // ✏️ API - MODIFICATION D'UN PROJET
    // ============================================
    const updateProject = async (projectId, updatedData) => {
        setIsLoading(true);
        try {
            // ✅ Payload selon votre ProjetDTO
            const payload = {
                nom: updatedData.name,
                description: updatedData.description,
                dateDebut: updatedData.startDate,
                dateFin: updatedData.endDate,
            };

            // ✅ PUT /api/projets/{id}
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECTS.UPDATE}/${projectId}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert("✅ Projet modifié avec succès !");
            setEditingProject(null);
            fetchProjects();
        } catch (err) {
            alert("❌ Erreur: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // 🗑️ API - SUPPRESSION D'UN PROJET
    // ============================================
    const deleteProject = async (projectId) => {
        if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce projet ?")) return;

        setIsLoading(true);
        try {
            // ✅ DELETE /api/projets/{id}
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PROJECTS.DELETE}/${projectId}`;
            const response = await fetch(url, { method: "DELETE" });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert("✅ Projet supprimé avec succès !");
            fetchProjects();
        } catch (err) {
            alert("❌ Erreur: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // 🔄 API - RÉCUPÉRATION DES TÂCHES (TOUTES OU PAR PROJET)
    // ============================================
    const fetchTasks = useCallback(async (projetId = null) => {
        setIsLoading(true);
        setError(null);
        try {
            let url;
            if (projetId) {
                // ✅ GET /api/taches/projet/{projetId}
                url = `${API_CONFIG.BASE_URL}${API_CONFIG.TASKS.GET_BY_PROJECT}/${projetId}`;
            } else {
                // Pour récupérer toutes les tâches, on peut les récupérer projet par projet
                // Ou vous pouvez ajouter un endpoint dans votre backend
                // Pour l'instant, on récupère les tâches du premier projet
                if (projects.length > 0) {
                    url = `${API_CONFIG.BASE_URL}${API_CONFIG.TASKS.GET_BY_PROJECT}/${projects[0].id}`;
                } else {
                    setTasks([]);
                    setIsLoading(false);
                    return;
                }
            }
            
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            // 🔄 data est directement un tableau selon votre API
            setTasks(data.map((t) => ({
                id: t.id_task,
                titre: t.titre_task,
                priorite: t.priorite_task || "MOYENNE",
                echeance: t.echeance_task,
                datecreation: t.datecreation_task,
                idProjet: t.id_projet,
                idUsers: t.id_users,
                status: t.status || "EN_COURS",
            })));

        } catch (err) {
            console.error("❌ Erreur chargement tâches:", err);
            setError(`Erreur de chargement des tâches: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [projects]);

    // ============================================
    // ➕ API - AJOUT D'UNE TÂCHE
    // ============================================
    const addTask = async (e) => {
        e.preventDefault();
        
        if (!userId) {
            alert("⚠️ Erreur: Utilisateur non connecté");
            return;
        }
        
        if (!newTask.titre.trim() || !newTask.idProjet) {
            alert("⚠️ Veuillez remplir tous les champs obligatoires");
            return;
        }

        setIsLoading(true);
        try {
            // ✅ Payload selon votre TacheDTO
            const payload = {
                titre: newTask.titre,
                priorite: newTask.priorite,
                echeance: newTask.echeance || null,
                status: newTask.status,
                id_users: userId,
            };

            // ✅ POST /api/taches?projetId={projetId}
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.TASKS.CREATE}?projetId=${newTask.idProjet}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert("✅ Tâche ajoutée avec succès !");
            setNewTask({ titre: "", priorite: "MOYENNE", echeance: "", status: "EN_COURS", idProjet: "" });
            fetchTasks(newTask.idProjet);
            setActivePage("tasks");
        } catch (err) {
            alert("❌ Erreur: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // ✏️ API - MODIFICATION D'UNE TÂCHE
    // ============================================
    const updateTask = async (taskId, updatedData) => {
        setIsLoading(true);
        try {
            // ✅ Selon votre TacheController, vous envoyez un objet Tache complet
            const payload = {
                titre: updatedData.titre,
                priorite: updatedData.priorite,
                echeance: updatedData.echeance || null,
                status: updatedData.status,
                id_users: userId,
                id_projet: updatedData.idProjet,
            };

            // ✅ PUT /api/taches/{id}
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.TASKS.UPDATE}/${taskId}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert("✅ Tâche modifiée avec succès !");
            setEditingTask(null);
            fetchTasks(updatedData.idProjet);
        } catch (err) {
            alert("❌ Erreur: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // 🗑️ API - SUPPRESSION D'UNE TÂCHE
    // ============================================
    const deleteTask = async (taskId, projetId) => {
        if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

        setIsLoading(true);
        try {
            // ✅ DELETE /api/taches/{id}
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.TASKS.DELETE}/${taskId}`;
            const response = await fetch(url, { method: "DELETE" });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert("✅ Tâche supprimée avec succès !");
            fetchTasks(projetId);
        } catch (err) {
            alert("❌ Erreur: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // 🎯 EFFECT - CHARGEMENT INITIAL
    // ============================================
    useEffect(() => {
        if (activePage === "dashboard") {
            fetchProjects(0);
            fetchTasks(0);
        } else if (activePage === "projects") {
            fetchProjects(projectPage);
        } else if (activePage === "tasks") {
            fetchTasks(taskPage);
        }
    }, [activePage]);

    // ============================================
    // 🎨 RENDER
    // ============================================
    return (
        <>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
                    -webkit-font-smoothing: antialiased;
                }
                
                /* Sidebar */
                .sidebar {
                    width: 260px;
                    background: rgba(249, 250, 251, 0.85);
                    backdrop-filter: blur(40px);
                    border-right: 0.5px solid rgba(229, 231, 235, 0.6);
                    display: flex;
                    flex-direction: column;
                    padding: 24px 12px;
                    position: fixed;
                    height: 100vh;
                    z-index: 100;
                    overflow-y: auto;
                }
                .sidebar-title {
                    font-weight: 700;
                    font-size: 20px;
                    margin-bottom: 28px;
                    color: #111827;
                    padding: 0 12px;
                }
                .sidebar-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border: none;
                    background: transparent;
                    color: #6B7280;
                    font-weight: 500;
                    font-size: 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    width: 100%;
                    text-align: left;
                    margin-bottom: 2px;
                }
                .sidebar-btn:hover {
                    background: rgba(107, 114, 128, 0.08);
                    color: #374151;
                }
                .sidebar-btn.active {
                    background: rgba(59, 130, 246, 0.12);
                    color: #2563EB;
                    font-weight: 600;
                }
                
                /* Main Content */
                .main-content {
                    margin-left: 260px;
                    padding: 32px 40px;
                    width: calc(100% - 260px);
                    min-height: 100vh;
                }
                .page-header {
                    margin-bottom: 32px;
                }
                .page-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 6px;
                }
                .page-subtitle {
                    font-size: 15px;
                    color: #6B7280;
                }
                
                /* Stat Cards */
                .stat-card {
                    background: rgba(255, 255, 255, 0.9);
                    border: 0.5px solid rgba(229, 231, 235, 0.5);
                    border-radius: 16px;
                    padding: 20px;
                    transition: all 0.2s;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    height: 100%;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
                }
                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }
                .stat-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .stat-primary { background: linear-gradient(135deg, #3B82F6, #2563EB); }
                .stat-success { background: linear-gradient(135deg, #10B981, #059669); }
                .stat-warning { background: linear-gradient(135deg, #F59E0B, #D97706); }
                .stat-danger { background: linear-gradient(135deg, #EF4444, #DC2626); }
                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #10B981;
                    font-size: 12px;
                    font-weight: 600;
                }
                .stat-title {
                    font-size: 13px;
                    color: #6B7280;
                    margin-bottom: 4px;
                }
                .stat-count {
                    font-size: 28px;
                    font-weight: 700;
                    color: #111827;
                }
                
                /* Glass Cards */
                .glass-card {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    border: 0.5px solid rgba(229, 231, 235, 0.5);
                    border-radius: 14px;
                    padding: 20px;
                    transition: all 0.2s;
                    margin-bottom: 16px;
                }
                .glass-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
                }
                
                /* Project Cards */
                .project-card { height: 100%; }
                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 12px;
                }
                .project-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #111827;
                }
                .project-actions {
                    display: flex;
                    gap: 6px;
                }
                .project-description {
                    font-size: 13px;
                    color: #6B7280;
                    margin-bottom: 16px;
                }
                .project-dates {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #6B7280;
                    margin-bottom: 16px;
                }
                .progress {
                    height: 6px;
                    background: rgba(229, 231, 235, 0.6);
                    border-radius: 10px;
                    margin-bottom: 8px;
                }
                .progress-bar {
                    background: linear-gradient(90deg, #3B82F6, #2563EB);
                    height: 100%;
                    transition: width 0.6s;
                }
                .progress-text {
                    font-size: 12px;
                    color: #6B7280;
                    font-weight: 600;
                }
                
                /* Task Cards */
                .task-card { height: 100%; }
                .task-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 12px;
                }
                .task-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #111827;
                }
                .task-badges {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }
                .task-info {
                    font-size: 12px;
                    color: #6B7280;
                    line-height: 1.8;
                }
                
                /* Badges */
                .badge {
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 11px;
                    text-transform: uppercase;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .bg-primary { background: #3B82F6; color: white; }
                .bg-success { background: #10B981; color: white; }
                .bg-warning { background: #F59E0B; color: white; }
                .bg-danger { background: #EF4444; color: white; }
                .bg-info { background: #06B6D4; color: white; }
                .bg-secondary { background: #6B7280; color: white; }
                
                /* Action Buttons */
                .action-btn {
                    padding: 8px 10px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .btn-edit {
                    background: rgba(59, 130, 246, 0.1);
                    color: #2563EB;
                }
                .btn-edit:hover {
                    background: rgba(59, 130, 246, 0.2);
                }
                .btn-delete {
                    background: rgba(239, 68, 68, 0.1);
                    color: #DC2626;
                }
                .btn-delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                }
                
                /* Primary Button */
                .btn-primary {
                    background: linear-gradient(135deg, #3B82F6, #2563EB);
                    border: none;
                    border-radius: 10px;
                    padding: 11px 24px;
                    font-weight: 600;
                    color: white;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
                }
                .btn-success {
                    background: linear-gradient(135deg, #10B981, #059669);
                    border: none;
                    color: white;
                    font-weight: 600;
                }
                .btn-secondary {
                    background: #6B7280;
                    border: none;
                    color: white;
                }
                
                /* Forms */
                .form-control, .form-select {
                    border: 1.5px solid rgba(229, 231, 235, 0.8);
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 14px;
                    transition: all 0.15s;
                    background: white;
                }
                .form-control:focus, .form-select:focus {
                    border-color: #3B82F6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    outline: none;
                }
                .form-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 6px;
                }
                
                /* Section Headers */
                .section-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 20px;
                }
                
                /* Pagination */
                .pagination-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    margin-top: 32px;
                }
                .pagination-btn {
                    padding: 10px 20px;
                    border: 1.5px solid #E5E7EB;
                    background: white;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .pagination-btn:hover:not(:disabled) {
                    border-color: #3B82F6;
                    color: #2563EB;
                }
                .pagination-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .pagination-info {
                    font-size: 14px;
                    color: #6B7280;
                }
                
                /* Notifications */
                .notification-item {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    background: white;
                    border: 0.5px solid #E5E7EB;
                    border-radius: 12px;
                    margin-bottom: 12px;
                    transition: all 0.2s;
                }
                .notification-item:hover {
                    border-color: #3B82F6;
                    transform: translateX(4px);
                }
                .notification-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .notification-icon.info { background: rgba(59, 130, 246, 0.1); color: #2563EB; }
                .notification-icon.success { background: rgba(16, 185, 129, 0.1); color: #059669; }
                .notification-icon.warning { background: rgba(245, 158, 11, 0.1); color: #D97706; }
                .notification-content {
                    flex: 1;
                }
                .notification-message {
                    font-size: 14px;
                    font-weight: 500;
                    color: #111827;
                    margin-bottom: 2px;
                }
                .notification-time {
                    font-size: 12px;
                    color: #6B7280;
                }
                
                /* Alert */
                .alert {
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }
                .alert-danger {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #DC2626;
                }
                
                /* Loading */
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                /* Responsive */
                @media (max-width: 992px) {
                    .sidebar {
                        width: 100%;
                        height: auto;
                        position: relative;
                        border-right: none;
                        border-bottom: 0.5px solid rgba(229, 231, 235, 0.6);
                    }
                    .sidebar-title { display: none; }
                    .main-content {
                        margin-left: 0;
                        width: 100%;
                        padding: 20px 16px;
                    }
                }
            `}</style>
            
            <div style={{
                display: "flex",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #F9FAFB 0%, #EFF6FF 50%, #F3F4F6 100%)",
            }}>
                {/* ============================================ */}
                {/* SIDEBAR */}
                {/* ============================================ */}
                <aside className="sidebar">
                    <h2 className="sidebar-title">Dashboard</h2>
                    <button className={`sidebar-btn ${activePage === "dashboard" ? "active" : ""}`}
                            onClick={() => setActivePage("dashboard")}>
                        <LayoutDashboard size={18} /> Accueil
                    </button>
                    <button className={`sidebar-btn ${activePage === "projects" ? "active" : ""}`}
                            onClick={() => setActivePage("projects")}>
                        <Folder size={18} /> Projets
                    </button>
                    <button className={`sidebar-btn ${activePage === "tasks" ? "active" : ""}`}
                            onClick={() => setActivePage("tasks")}>
                        <CheckSquare size={18} /> Tâches
                    </button>
                    <button className={`sidebar-btn ${activePage === "notifications" ? "active" : ""}`}
                            onClick={() => setActivePage("notifications")}>
                        <Bell size={18} /> Notifications
                    </button>
                    <button className={`sidebar-btn ${activePage === "profile" ? "active" : ""}`}
                            onClick={() => setActivePage("profile")}>
                        <User size={18} /> Profil
                    </button>
                    <div style={{ flexGrow: 1 }}></div>
                    <button className="sidebar-btn" style={{color: "#DC2626"}}>
                        <LogOut size={18} /> Déconnexion
                    </button>
                </aside>

                {/* ============================================ */}
                {/* MAIN CONTENT */}
                {/* ============================================ */}
                <main className="main-content">
                    <div className="page-header">
                        <h1 className="page-title">Bienvenue 👋</h1>
                        <p className="page-subtitle">Gérez vos projets et tâches en toute simplicité</p>
                    </div>
                    
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    {isLoading && (
                        <div className="d-flex align-items-center mb-3 text-primary">
                            <RefreshCw size={16} className="me-2" style={{animation: "spin 1s linear infinite"}} />
                            <span style={{fontSize: "14px", fontWeight: "500"}}>Chargement...</span>
                        </div>
                    )}
                    
                    {/* ============================================ */}
                    {/* PAGE DASHBOARD */}
                    {/* ============================================ */}
                    {activePage === "dashboard" && (
                        <>
                            <div className="row g-4 mb-5">
                                <StatCard icon={<Folder size={24} />} title="Projets" 
                                         count={projects.length} color="primary" trend={12} />
                                <StatCard icon={<Clock size={24} />} title="Tâches en cours"
                                         count={tasks.filter(t => t.status === "EN_COURS").length} 
                                         color="warning" trend={8} />
                                <StatCard icon={<CheckSquare size={24} />} title="Tâches terminées"
                                         count={tasks.filter(t => t.status === "TERMINE").length} 
                                         color="success" trend={15} />
                                <StatCard icon={<Bell size={24} />} title="Notifications"
                                         count={notifications.length} color="danger" />
                            </div>

                            <h2 className="section-title">Projets récents</h2>
                            <div className="row g-4 mb-5">
                                {projects.slice(0, 3).map(p => (
                                    <div key={p.id} className="col-lg-4 col-md-6">
                                        <ProjectCard project={p} onEdit={setEditingProject} onDelete={deleteProject} />
                                    </div>
                                ))}
                                {projects.length === 0 && !isLoading && (
                                    <p className="text-muted ms-3">Aucun projet disponible.</p>
                                )}
                            </div>

                            <h2 className="section-title">Tâches en cours</h2>
                            <div className="row g-4">
                                {tasks.filter(t => t.status === "EN_COURS").slice(0, 4).map(t => (
                                    <div key={t.id} className="col-lg-3 col-md-6">
                                        <TaskCard task={t} onEdit={setEditingTask} onDelete={deleteTask} projects={projects} />
                                    </div>
                                ))}
                                {tasks.filter(t => t.status === "EN_COURS").length === 0 && !isLoading && (
                                    <p className="text-muted ms-3">Aucune tâche en cours.</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* ============================================ */}
                    {/* PAGE PROJETS */}
                    {/* ============================================ */}
                    {activePage === "projects" && (
                        <>
                            <h2 className="section-title">Ajouter un nouveau projet</h2>
                            <form onSubmit={addProject} className="glass-card mb-4">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label">Nom du projet *</label>
                                        <input type="text" className="form-control" placeholder="Ex: Projet Alpha"
                                               value={newProject.name}
                                               onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                                               required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Date de début *</label>
                                        <input type="date" className="form-control"
                                               value={newProject.startDate}
                                               onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                                               required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Date de fin *</label>
                                        <input type="date" className="form-control"
                                               value={newProject.endDate}
                                               onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                                               required />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Description</label>
                                        <input type="text" className="form-control" placeholder="Description courte"
                                               value={newProject.description}
                                               onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                                            <PlusCircle size={18} /> Ajouter
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <h2 className="section-title">Liste des projets</h2>
                            <div className="row g-4">
                                {projects.map(p => (
                                    <div key={p.id} className="col-lg-4 col-md-6">
                                        {editingProject?.id === p.id ? (
                                            <div className="glass-card">
                                                <h5 className="mb-3">Modifier le projet</h5>
                                                <input type="text" className="form-control mb-2"
                                                       value={editingProject.name}
                                                       onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} />
                                                <input type="date" className="form-control mb-2"
                                                       value={editingProject.startDate}
                                                       onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})} />
                                                <input type="date" className="form-control mb-2"
                                                       value={editingProject.endDate}
                                                       onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})} />
                                                <textarea className="form-control mb-3" rows="2"
                                                          value={editingProject.description}
                                                          onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} />
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-success btn-sm flex-grow-1"
                                                            onClick={() => updateProject(p.id, editingProject)}>
                                                        <Save size={16} /> Sauvegarder
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm"
                                                            onClick={() => setEditingProject(null)}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <ProjectCard project={p} onEdit={setEditingProject} onDelete={deleteProject} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {projectTotalPages > 1 && (
                                <Pagination page={projectPage} totalPages={projectTotalPages} 
                                           onPageChange={fetchProjects} disabled={isLoading} />
                            )}
                        </>
                    )}

                    {/* ============================================ */}
                    {/* PAGE TÂCHES */}
                    {/* ============================================ */}
                    // Dashboard.jsx - Section de rendu de la page "tasks"

{activePage === "tasks" && (
    <>
        {/* ======================= FORMULAIRE AJOUTER UNE TÂCHE ======================= */}
        <h2 className="section-title">Ajouter une nouvelle tâche</h2>
        <form onSubmit={addTask} className="glass-card mb-4">
            <div className="row g-3">
                <div className="col-md-3">
                    <label className="form-label">Titre *</label>
                    <input type="text" className="form-control" placeholder="Titre de la tâche"
                           value={newTask.titre || ''} // Utilisation de 'titre'
                           onChange={(e) => setNewTask({...newTask, titre: e.target.value})}
                           required />
                </div>
                <div className="col-md-2">
                    <label className="form-label">Priorité</label>
                    <select className="form-select" value={newTask.priorite}
                            onChange={(e) => setNewTask({...newTask, priorite: e.target.value})}>
                        <option value="BASSE">Basse</option>
                        <option value="MOYENNE">Moyenne</option>
                        <option value="HAUTE">Haute</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <label className="form-label">Statut</label>
                    <select className="form-select" value={newTask.status}
                            onChange={(e) => setNewTask({...newTask, status: e.target.value})}>
                        <option value="EN_COURS">En cours</option>
                        <option value="TERMINE">Terminé</option>
                        <option value="EN_ATTENTE">En attente</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <label className="form-label">Échéance</label>
                    <input type="date" className="form-control"
                           value={newTask.echeance || ''}
                           onChange={(e) => setNewTask({...newTask, echeance: e.target.value})} />
                </div>
                <div className="col-md-2">
                    <label className="form-label">Projet *</label>
                    <select className="form-select" value={newTask.idProjet}
                            onChange={(e) => setNewTask({...newTask, idProjet: e.target.value})}
                            required>
                        <option value="">Sélectionner</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-1 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                        {/* Assurez-vous d'avoir importé { PlusCircle } */}
                        <PlusCircle size={18} />
                    </button>
                </div>
            </div>
        </form>

        {/* ======================= LISTE DES TÂCHES ======================= */}
        <h2 className="section-title">Liste des tâches</h2>
        <div className="row g-4">
            {tasks.map(t => {
                // ⭐ CORRECTION DE L'ERREUR 'Cannot read properties of null (reading 'titre')'
                // Cette vérification ignore les éléments nulls ou undefined dans le tableau des tâches
                if (!t) return null; 
                
                return (
                    <div key={t.id} className="col-lg-3 col-md-6">
                        {editingTask?.id === t.id ? (
                            // LOGIQUE D'ÉDITION
                            <div className="glass-card">
                                <h6 className="mb-3">Modifier la tâche</h6>
                                {/* Utilisation de 'editingTask?' pour éviter l'erreur si l'état est mal géré */}
                                <input type="text" className="form-control form-control-sm mb-2"
                                       value={editingTask?.titre || ''} // Ajout de '?' et fallback pour plus de sécurité
                                       onChange={(e) => setEditingTask({...editingTask, titre: e.target.value})} />
                                <select className="form-select form-select-sm mb-2"
                                        value={editingTask?.priorite || ''}
                                        onChange={(e) => setEditingTask({...editingTask, priorite: e.target.value})}>
                                    <option value="BASSE">Basse</option>
                                    <option value="MOYENNE">Moyenne</option>
                                    <option value="HAUTE">Haute</option>
                                </select>
                                <select className="form-select form-select-sm mb-2"
                                        value={editingTask?.status || ''}
                                        onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}>
                                    <option value="EN_COURS">En cours</option>
                                    <option value="TERMINE">Terminé</option>
                                    <option value="EN_ATTENTE">En attente</option>
                                </select>
                                <input type="date" className="form-control form-control-sm mb-2"
                                       value={editingTask?.echeance || ""}
                                       onChange={(e) => setEditingTask({...editingTask, echeance: e.target.value})} />
                                <select className="form-select form-select-sm mb-3"
                                        value={editingTask?.idProjet || ''}
                                        onChange={(e) => setEditingTask({...editingTask, idProjet: e.target.value})}>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-success btn-sm flex-grow-1"
                                            onClick={() => updateTask(t.id, editingTask)}>
                                        {/* Assurez-vous d'avoir importé { Save } */}
                                        <Save size={14} /> Sauvegarder
                                    </button>
                                    <button className="btn btn-secondary btn-sm"
                                            onClick={() => setEditingTask(null)}>
                                        {/* Assurez-vous d'avoir importé { X } */}
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // AFFICHAGE NORMAL DE LA CARTE DE TÂCHE
                            <TaskCard task={t} onEdit={setEditingTask} onDelete={deleteTask} projects={projects} />
                        )}
                    </div>
                );
            })}
            
            {/* AFFICHAGE DE L'ÉTAT VIDE */}
            {tasks.length === 0 && !isLoading && (
                <p className="text-muted ms-3">Aucune tâche disponible.</p>
            )}
        </div>

        {/* LOGIQUE DE PAGINATION */}
        {taskTotalPages > 1 && (
            <Pagination page={taskPage} totalPages={taskTotalPages} 
                        onPageChange={fetchTasks} disabled={isLoading} />
        )}
    </>
)}

                    {/* ============================================ */}
                    {/* PAGE NOTIFICATIONS */}
                    {/* ============================================ */}
                    {activePage === "notifications" && (
                        <>
                            <h2 className="section-title">Notifications</h2>
                            {notifications.map(n => (
                                <div key={n.id} className="notification-item">
                                    <div className={`notification-icon ${n.type}`}>
                                        <Bell size={20} />
                                    </div>
                                    <div className="notification-content">
                                        <p className="notification-message">{n.message}</p>
                                        <p className="notification-time">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    
                    {/* ============================================ */}
                    {/* PAGE PROFIL */}
                    {/* ============================================ */}
                    {activePage === "profile" && (
                        <div className="glass-card text-center" style={{padding: "60px 40px"}}>
                            <div style={{
                                width: "100px",
                                height: "100px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px",
                                boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)"
                            }}>
                                <User size={48} style={{color: "white"}} />
                            </div>
                            <h2 style={{fontSize: "24px", fontWeight: "700", color: "#111827", marginBottom: "8px"}}>
                                Utilisateur {userId || "Non connecté"}
                            </h2>
                            <p style={{color: "#6B7280", marginBottom: "24px"}}>
                                Gérez vos paramètres de compte et préférences
                            </p>
                            <button className="btn btn-primary">
                                <Edit2 size={16} /> Modifier le profil
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default UserDashboard;