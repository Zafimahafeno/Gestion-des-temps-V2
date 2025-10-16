import React, { useState, useEffect } from 'react';
import { Home, Folder, Users, Settings, LogIn, Bell, Edit, Trash2, PlusCircle, CheckSquare, Menu, X, Save, AlertCircle } from 'lucide-react';

// --- Composants Enfants (Inline) ---

// Fonction utilitaire pour mettre en majuscule la première lettre
const capitalize = (s) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2');
};

// 1. Composant Alerte de statut (Remplace alert() pour les confirmations)
const StatusAlert = ({ message, type, onClose }) => {
    if (!message) return null;
    const alertClasses = {
        primary: 'bg-primary border-primary-dark',
        success: 'bg-success border-success-dark',
        warning: 'bg-warning border-warning-dark',
        danger: 'bg-danger border-danger-dark',
    };

    return (
        <div 
            className={`fixed top-4 right-4 z-[1000] p-3 rounded-lg text-white shadow-xl flex items-center gap-2 transition-all duration-300 animate-pulse-once ${alertClasses[type] || alertClasses.primary}`}
            style={{ minWidth: '250px', maxWidth: '90%', animationDuration: '0.5s' }}
        >
            <AlertCircle size={20} />
            <span className="flex-grow-1">{message}</span>
            <button onClick={onClose} className="text-white opacity-70 hover:opacity-100" aria-label="Fermer">
                <X size={16} />
            </button>
        </div>
    );
};


// 2. Composant de carte du tableau de bord
const AdminCard = ({ title, count, color, icon, details }) => {
    const colorClasses = {
        primary: 'text-primary',
        success: 'text-success',
        info: 'text-info',
        warning: 'text-warning',
    };
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="admin-card p-4 h-full text-light">
                <div className="d-flex align-items-center mb-2">{icon}<h3 className="fs-6 fw-bold ms-2">{title}</h3></div>
                <p className={`fs-2 fw-bold ${colorClasses[color]}`}>{count}</p>
                <p className="text-secondary small">{details}</p>
            </div>
        </div>
    );
};

// 3. Composant de grille d'éléments (Avec Placeholders et Edition Inline)
const CardGrid = ({ title, items, fields, setItems, form, setForm, showStatus }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const initialForm = fields.reduce((a, f) => ({ ...a, [f]: '' }), {});

    const handleAddItem = () => {
        if (fields.every(f => form[f])) {
            setItems(prev => [...prev, { id: Date.now(), ...form }]);
            setForm(initialForm);
            showStatus(`${capitalize(title.slice(0, -1))} ajouté(e) !`, 'success');
        } else {
            showStatus('Veuillez remplir tous les champs.', 'warning');
        }
    };

    const handleEditStart = (item) => {
        setEditingId(item.id);
        setEditForm(item);
    };

    const handleEditSave = () => {
        setItems(items.map(it => it.id === editingId ? editForm : it));
        setEditingId(null);
        showStatus(`${capitalize(title.slice(0, -1))} modifié(e) avec succès.`, 'primary');
    };
    
    const handleDelete = (id) => {
        setItems(items.filter(it => it.id !== id));
        showStatus(`${capitalize(title.slice(0, -1))} supprimé(e).`, 'danger');
    };

    const handleEditCancel = () => {
        setEditingId(null);
    };

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const getPlaceholderText = (field) => {
        const mapping = {
            'name': 'Nom',
            'description': 'Description du projet',
            'email': 'Adresse e-mail',
            'title': 'Titre de la tâche',
            'project': 'Projet (ex: Alpha)',
            'status': 'Statut (ex: En cours)',
        };
        return mapping[field] || capitalize(field);
    };

    return (
        <div className="admin-content">
            <h2 className="text-light fs-3 fw-bold mb-4">{title}</h2>
            
            {/* Formulaire d'ajout - S'assure que les champs ne sont pas trop serrés sur mobile */}
            <div className="p-3 rounded bg-dark bg-opacity-25 d-flex flex-wrap gap-2 mb-4">
                {fields.map(f => (
                    <div key={f} className="flex-grow-1" style={{ minWidth: '150px' }}>
                        <input 
                            type={f === 'email' ? 'email' : 'text'} 
                            placeholder={getPlaceholderText(f)} 
                            className="form-control bg-dark text-light border-0 w-100" 
                            value={form[f]} 
                            onChange={e => setForm({ ...form, [f]: e.target.value })} 
                        />
                    </div>
                ))}
                <button className="btn btn-primary d-flex align-items-center gap-1" onClick={handleAddItem}>
                    Ajouter <PlusCircle size={16}/>
                </button>
            </div>

            {/* Liste des éléments - Grid responsive */}
            <div className="row g-4">
                {items.map(item => (
                    <div key={item.id} className="col-12 col-sm-6 col-lg-4"> 
                        <div className="admin-card p-4 text-light h-full">
                            {editingId === item.id ? (
                                <div>
                                    <h5 className="mb-3">Édition</h5>
                                    {fields.map(f => (
                                        <div className="mb-2" key={f}>
                                            <label className="form-label text-secondary small mb-1">{getPlaceholderText(f)}</label>
                                            <input 
                                                type={f === 'email' ? 'email' : 'text'} 
                                                className="form-control bg-dark text-light border-0" 
                                                value={editForm[f]} 
                                                onChange={(e) => handleEditChange(f, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <div className="d-flex gap-2 mt-3">
                                        <button className="btn btn-sm btn-success" onClick={handleEditSave}><Save size={16}/></button>
                                        <button className="btn btn-sm btn-secondary" onClick={handleEditCancel}><X size={16}/></button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {fields.map(f => (
                                        <p key={f} className="mb-2">
                                            <strong className="text-primary">{getPlaceholderText(f)}:</strong> {item[f]}
                                        </p>
                                    ))}
                                    <div className="d-flex gap-2 mt-3">
                                        <button className="btn btn-sm btn-warning" onClick={() => handleEditStart(item)}><Edit size={16}/></button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PageWrapper = ({ title, text }) => (
    <div className="admin-content text-light">
        <h2 className="fw-bold mb-3">{title}</h2>
        <p>{text}</p>
    </div>
);


// --- Composant Principal ---
const App = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ show: false, text: '', type: '' });
    
    // Données (Simulées)
    const [projects, setProjects] = useState([
        { id: 1, name: 'Projet Alpha', description: 'Description du projet Alpha' },
        { id: 2, name: 'Projet Beta', description: 'Description du projet Beta' },
    ]);
    const [users, setUsers] = useState([
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
    ]);
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Tâche 1', project: 'Projet Alpha', status: 'En cours' },
        { id: 2, title: 'Tâche 2', project: 'Projet Beta', status: 'Terminé' },
    ]);
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'Nouvel utilisateur inscrit', time: '10:15 AM' },
        { id: 2, message: 'Projet Beta mis à jour', time: '09:45 AM' },
    ]);
    const [settings, setSettings] = useState({ siteName: 'Mon Admin', theme: 'Clair' });

    const [projectForm, setProjectForm] = useState({ name: '', description: '' });
    const [userForm, setUserForm] = useState({ name: '', email: '' });
    const [taskForm, setTaskForm] = useState({ title: '', project: '', status: '' });
    
    const showStatus = (text, type = 'primary') => {
        setStatusMessage({ show: true, text, type });
        setTimeout(() => setStatusMessage({ show: false, text: '', type: '' }), 3000);
    };

    const handleNavClick = (page) => {
        setActivePage(page);
        // Ferme la barre latérale sur mobile après la navigation
        if (window.innerWidth < 992) {
            setIsSidebarOpen(false);
        }
    };
    
    const renderPageContent = () => {
        switch (activePage) {
            case 'dashboard':
                return (
                    <div className="admin-content">
                        <h2 className="text-light fs-2 fw-bold mb-4">Tableau de Bord</h2>
                        <div className="row g-4">
                            <AdminCard title="Projets" count={projects.length} color="primary" icon={<Folder size={24} />} details="Projets en cours" />
                            <AdminCard title="Utilisateurs" count={users.length} color="success" icon={<Users size={24} />} details="Utilisateurs enregistrés" />
                            <AdminCard title="Tâches" count={tasks.length} color="info" icon={<CheckSquare size={24} />} details="Tâches en cours" />
                            <AdminCard title="Notifications" count={notifications.length} color="warning" icon={<Bell size={24} />} details="Notifications récentes" />
                        </div>
                    </div>
                );
            case 'projects':
                return <CardGrid title="Projets" items={projects} fields={['name', 'description']} setItems={setProjects} form={projectForm} setForm={setProjectForm} showStatus={showStatus} />;
            case 'users':
                return <CardGrid title="Utilisateurs" items={users} fields={['name', 'email']} setItems={setUsers} form={userForm} setForm={setUserForm} showStatus={showStatus} />;
            case 'tasks':
                return <CardGrid title="Tâches" items={tasks} fields={['title', 'project', 'status']} setItems={setTasks} form={taskForm} setForm={setTaskForm} showStatus={showStatus} />;
            case 'settings':
                return (
                    <div className="admin-content">
                        <h2 className="text-light fs-3 fw-bold mb-3">Paramètres</h2>
                        <div className="p-4 rounded bg-dark bg-opacity-25 w-100" style={{maxWidth: '600px'}}>
                            <div className="mb-3">
                                <label className="form-label text-light">Nom du site</label>
                                <input className="form-control bg-dark text-light border-0" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-light">Thème</label>
                                <select className="form-select bg-dark text-light border-0" value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
                                    <option>Clair</option>
                                    <option>Sombre</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" onClick={() => showStatus('Paramètres sauvegardés !', 'primary')}><Save size={18}/> Enregistrer</button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="admin-content">
                        <h2 className="text-light fs-3 fw-bold mb-3">Notifications</h2>
                        <div className="d-flex flex-column gap-3 w-100" style={{maxWidth: '900px'}}>
                            {notifications.map(n => (
                                <div key={n.id} className="p-3 rounded bg-dark bg-opacity-25 d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-1 text-light">{n.message}</p>
                                        <small className="text-secondary">{n.time}</small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-success" onClick={() => showStatus('Marquée comme lue !', 'success')}>✔</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => setNotifications(notifications.filter(x => x.id !== n.id))}>✖</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <PageWrapper title="Connexion" text="Se connecter au panneau d’administration." />;
        }
    };

    const navItemClass = (page) => `admin-nav-btn ${activePage === page ? 'is-active text-light' : 'text-secondary'}`;
    // La sidebar est toujours présente sur les grands écrans. Sur mobile, elle est gérée par `isSidebarOpen`.
    const sidebarClass = `admin-sidebar d-flex flex-column justify-content-between p-4`;


    return (
        <>
            <style>
                {`
                    /* ================================== */
                    /* RÈGLES FONDAMENTALES DE RÉACTIVITÉ */
                    /* ================================== */
                    html, body, #root, .admin-root, main {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        min-height: 100vh;
                        /* ABSOLUMENT AUCUN DÉBORDEMENT HORIZONTAL */
                        overflow-x: hidden !important; 
                    }
                    
                    /* Design global */
                    .admin-root {
                        background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
                        color: #fff;
                        display: flex;
                        flex-wrap: nowrap;
                    }

                    /* FIX: Visibilité du Placeholder */
                    .form-control::placeholder {
                        color: #9ca3af !important; 
                        opacity: 1 !important; 
                    }
                    .form-control:-ms-input-placeholder, .form-control::-ms-input-placeholder {
                        color: #9ca3af !important;
                    }

                    /* ================================== */
                    /* SIDEBAR & RESPONSIVE LOGIC         */
                    /* ================================== */
                    .admin-sidebar {
                        width: 260px;
                        background: rgba(17, 25, 40, 0.95);
                        backdrop-filter: blur(12px);
                        border-right: 1px solid rgba(255, 255, 255, 0.08);
                        flex-shrink: 0;
                        z-index: 999; 
                        /* Styles par défaut pour le desktop */
                        transition: none; 
                    }

                    .admin-header {
                        background: rgba(17, 25, 40, 0.65);
                        backdrop-filter: blur(10px);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        padding: 15px 25px;
                        position: sticky;
                        top: 0;
                        z-index: 800;
                        min-width: 100%; /* S'assure que l'en-tête prend toute la largeur */
                    }

                    /* Le bouton Hamburger est masqué par défaut sur desktop */
                    .mobile-menu-toggle { display: none; }

                    /* Main content */
                    main {
                        flex-grow: 1;
                        background: linear-gradient(180deg, #111827, #0f172a);
                        display: flex;
                        flex-direction: column;
                        min-width: 0; /* Permet au contenu de s'adapter et d'éviter le débordement */
                    }

                    /* MEDIA QUERY : Écrans de petite taille (mobile/tablette) < 992px */
                    @media (max-width: 991px) {
                        /* Afficher le bouton Hamburger */
                        .mobile-menu-toggle {
                            display: block; 
                        }
                        
                        /* Masquer la sidebar par défaut (la positionner hors écran) */
                        .admin-sidebar {
                            position: fixed;
                            left: 0;
                            top: 0;
                            height: 100%;
                            transform: translateX(-100%); /* Masquée hors écran */
                            box-shadow: 2px 0 10px rgba(0,0,0,0.5);
                            transition: transform 0.3s ease-in-out; /* Animation pour l'ouverture */
                        }

                        .admin-sidebar.show {
                            transform: translateX(0); /* Fait apparaître la sidebar */
                        }
                    }

                    /* ================================== */
                    /* STYLES DE CARTE ET NAVIGATION      */
                    /* ================================== */
                    .admin-sidebar .admin-nav-btn {
                        display: flex; align-items: center; gap: 10px; background: transparent;
                        border: none; color: #cbd5e1; font-weight: 500; padding: 10px 12px;
                        border-radius: 8px; width: 100%; text-align: left; transition: all 0.2s ease-in-out;
                    }
                    .admin-sidebar .admin-nav-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
                    .admin-sidebar .is-active { background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff !important; font-weight: 600; }
                    
                    .admin-card {
                        background: rgba(255, 255, 255, 0.07);
                        border-radius: 15px;
                        box-shadow: 0 4px 25px rgba(0, 0, 0, 0.3);
                        transition: all 0.3s ease;
                        height: 100%;
                    }
                    .admin-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 8px 35px rgba(0, 0, 0, 0.45);
                    }

                    /* Couleurs et boutons */
                    .text-primary { color: #3b82f6 !important; }
                    .text-success { color: #10b981 !important; }
                    .text-info { color: #06b6d4 !important; }
                    .text-warning { color: #f59e0b !important; }
                    .bg-primary { background-color: #3b82f6; }
                    .bg-success { background-color: #10b981; }
                    .bg-warning { background-color: #f59e0b; }
                    .bg-danger { background-color: #ef4444; }

                    .btn-primary { background: linear-gradient(135deg, #2563eb, #3b82f6); border: none; color: white;}
                    .btn-success { background-color: #10b981; border: none; color: white;}
                    .btn-warning { background-color: #f59e0b; border: none; color: black;}
                    .btn-danger { background-color: #ef4444; border: none; color: white;}
                    .btn-secondary { background-color: #4b5563; border: none; color: white;}
                    
                    .btn {
                        display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                        border-radius: 8px; padding: 0.5rem 1rem; transition: all 0.3s ease;
                        font-weight: 500;
                    }
                    .btn-sm { padding: 0.3rem 0.5rem; }
                `}
            </style>
            
            <StatusAlert 
                message={statusMessage.text} 
                type={statusMessage.type} 
                onClose={() => setStatusMessage({ show: false, text: '', type: '' })} 
            />

            <div className="admin-root">
                {/* Overlay mobile quand le menu est ouvert (fixed, z-index bas) */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black opacity-50 z-[980]" 
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar - La classe 'show' est utilisée pour l'ouvrir sur mobile */}
                <aside className={`${sidebarClass} ${isSidebarOpen ? 'show' : ''}`}>
                    <div>
                        <div className="d-flex align-items-center mb-5 fs-4 fw-bold text-light">
                            <Home size={26} className="me-2" /> Admin Panel
                        </div>
                        <div className="admin-nav d-flex flex-column gap-2">
                            <button onClick={() => handleNavClick('dashboard')} className={navItemClass('dashboard')}><Home size={20}/> Tableau de Bord</button>
                            <button onClick={() => handleNavClick('projects')} className={navItemClass('projects')}><Folder size={20}/> Projets</button>
                            <button onClick={() => handleNavClick('users')} className={navItemClass('users')}><Users size={20}/> Utilisateurs</button>
                            <button onClick={() => handleNavClick('tasks')} className={navItemClass('tasks')}><CheckSquare size={20}/> Tâches</button>
                            <button onClick={() => handleNavClick('settings')} className={navItemClass('settings')}><Settings size={20}/> Paramètres</button>
                            <button onClick={() => handleNavClick('notifications')} className={navItemClass('notifications')}><Bell size={20}/> Notifications</button>
                        </div>
                    </div>
                    <button onClick={() => handleNavClick('login')} className="btn btn-outline-light mt-4"><LogIn size={18}/> Se connecter</button>
                </aside>

                {/* Main */}
                <main className="flex-grow-1 d-flex flex-column">
                    <header className="admin-header d-flex justify-content-between align-items-center p-3">
                        {/* Bouton Menu Mobile (masqué sur desktop par le CSS .mobile-menu-toggle) */}
                        <button 
                            className="btn btn-primary mobile-menu-toggle p-2" 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-label="Toggle Menu"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <h1 className="text-light fs-5 fw-bold m-0 d-none d-sm-block">Bienvenue, Administrateur</h1>
                        <h1 className="text-light fs-5 fw-bold m-0 d-block d-sm-none">Admin</h1>
                        <div className="d-flex align-items-center">
                            <span className="text-light me-3 d-none d-sm-inline">admin@example.com</span>
                            <div className="avatar rounded-circle d-flex justify-content-center align-items-center text-light bg-blue-500" style={{ width: '36px', height: '36px' }}>A</div>
                        </div>
                    </header>
                    <div className="flex-grow-1 overflow-y-auto">
                        <div className="p-4 admin-content">
                            {renderPageContent()}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default App;
