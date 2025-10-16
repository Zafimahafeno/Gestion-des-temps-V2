import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './ReportsPage.css';

// Couleurs pour les graphiques
const PIE_CHART_COLORS = ['#4f46e5', '#eab308', '#22c55e', '#ef4444', '#a0a0a0'];

// Fonction pour la conversion des secondes en format HH:MM:SS
const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
};

const ReportsPage = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeEntries, setTimeEntries] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [reportPeriod, setReportPeriod] = useState('all');

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    useEffect(() => {
        const setupFirebase = async () => {
            try {
                const app = initializeApp(firebaseConfig);
                const firestore = getFirestore(app);
                const authentication = getAuth(app);
                
                setDb(firestore);
                setAuth(authentication);

                if (initialAuthToken) {
                    await signInWithCustomToken(authentication, initialAuthToken);
                } else {
                    await signInAnonymously(authentication);
                }
            } catch (err) {
                console.error("Firebase initialization or authentication failed:", err);
                setError("Échec de l'initialisation de l'application. Veuillez réessayer.");
                setLoading(false);
            }
        };

        setupFirebase();
    }, [firebaseConfig, initialAuthToken]);

    useEffect(() => {
        if (!auth || !db) return;

        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserId(user.uid);
                setLoading(false);

                // Écouter les données des tâches
                const tasksColRef = collection(db, `artifacts/${appId}/users/${user.uid}/taches`);
                const unsubscribeTasks = onSnapshot(tasksColRef, (snapshot) => {
                    const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTasks(tasksData);
                }, (err) => {
                    console.error("Error fetching tasks:", err);
                    setError("Échec du chargement des tâches.");
                });

                // Écouter les entrées de temps
                const timeEntriesColRef = collection(db, `artifacts/${appId}/users/${user.uid}/timeEntries`);
                const timeEntriesQuery = query(timeEntriesColRef); // Pas de tri pour l'instant pour éviter les erreurs d'index
                const unsubscribeEntries = onSnapshot(timeEntriesQuery, (snapshot) => {
                    const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTimeEntries(entriesData);
                }, (err) => {
                    console.error("Error fetching time entries:", err);
                    setError("Échec du chargement de l'historique de temps.");
                });

                return () => {
                    unsubscribeTasks();
                    unsubscribeEntries();
                };
            } else {
                setUserId(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [auth, db, appId]);
    
    // Traitement des données pour les graphiques
    const getFilteredEntries = () => {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;
        
        return timeEntries.filter(entry => {
            const entryDate = entry.timestamp?.toDate();
            if (!entryDate) return false;

            switch (reportPeriod) {
                case 'today':
                    return entryDate.getDate() === now.getDate() && entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                case 'week':
                    return now - entryDate <= oneWeek;
                case 'month':
                    return now - entryDate <= oneMonth;
                case 'all':
                default:
                    return true;
            }
        });
    };

    const generateTimeByTaskData = () => {
        const filteredEntries = getFilteredEntries();
        const aggregatedData = {};
        
        filteredEntries.forEach(entry => {
            const taskId = entry.taskId;
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                if (!aggregatedData[taskId]) {
                    aggregatedData[taskId] = {
                        name: task.titre,
                        time: 0
                    };
                }
                aggregatedData[taskId].time += entry.duration;
            }
        });

        return Object.values(aggregatedData);
    };

    const generateTaskStatusData = () => {
        const statusCounts = { 'À faire': 0, 'En cours': 0, 'Terminée': 0, 'Annulée': 0 };
        tasks.forEach(task => {
            if (statusCounts.hasOwnProperty(task.statut)) {
                statusCounts[task.statut] += 1;
            }
        });
        return Object.keys(statusCounts).map(status => ({
            name: status,
            value: statusCounts[status]
        })).filter(item => item.value > 0);
    };

    const timeByTaskData = generateTimeByTaskData();
    const taskStatusData = generateTaskStatusData();
    
    if (loading) return <div className="page-center-container"><div className="loading-state">Chargement...</div></div>;
    if (error) return <div className="page-center-container"><div className="error-state">{error}</div></div>;

    return (
        <div className="reports-container">
            <h1 className="page-title">Rapports et Statistiques</h1>
            
            <div className="report-card filters">
                <h2 className="card-title">Période de rapport</h2>
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${reportPeriod === 'today' ? 'active' : ''}`}
                        onClick={() => setReportPeriod('today')}
                    >
                        Aujourd'hui
                    </button>
                    <button 
                        className={`filter-btn ${reportPeriod === 'week' ? 'active' : ''}`}
                        onClick={() => setReportPeriod('week')}
                    >
                        Cette Semaine
                    </button>
                    <button 
                        className={`filter-btn ${reportPeriod === 'month' ? 'active' : ''}`}
                        onClick={() => setReportPeriod('month')}
                    >
                        Ce Mois
                    </button>
                    <button 
                        className={`filter-btn ${reportPeriod === 'all' ? 'active' : ''}`}
                        onClick={() => setReportPeriod('all')}
                    >
                        Toutes les données
                    </button>
                </div>
            </div>

            <div className="reports-grid">
                {/* Graphique du temps passé par tâche */}
                <div className="report-card chart-card">
                    <h2 className="card-title">Temps passé par tâche</h2>
                    {timeByTaskData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={timeByTaskData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                                <XAxis dataKey="name" stroke="#a0a0a0" />
                                <YAxis stroke="#a0a0a0" tickFormatter={formatDuration} />
                                <Tooltip formatter={(value) => formatDuration(value)} />
                                <Bar dataKey="time" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="no-data-message">Pas d'entrées de temps pour cette période.</p>
                    )}
                </div>

                {/* Graphique de l'état des tâches */}
                <div className="report-card chart-card">
                    <h2 className="card-title">Statut des Tâches</h2>
                    {taskStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie dataKey="value" data={taskStatusData} innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} >
                                    {taskStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="no-data-message">Aucune tâche à afficher.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
