import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, Square, Plus, Trash2 } from 'lucide-react';
import './TimeTrackingPage.css';

const TimeTrackingPage = () => {
    // État pour les données de l'application
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [timeEntries, setTimeEntries] = useState([]);

    // État du chronomètre
    const [timerRunning, setTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [activeTask, setActiveTask] = useState(null);
    const timerIntervalRef = useRef(null);

    // État pour l'entrée manuelle
    const [manualEntry, setManualEntry] = useState({
        taskId: '',
        durationHours: 0,
        durationMinutes: 0
    });

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // Initialisation de Firebase et de l'authentification
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

    // Écouteur d'état d'authentification et de données Firestore
    useEffect(() => {
        if (!auth || !db) return;

        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserId(user.uid);
                setLoading(false);

                // Écouter les tâches de l'utilisateur en temps réel
                const tasksColRef = collection(db, `artifacts/${appId}/users/${user.uid}/taches`);
                const tasksQuery = query(tasksColRef);
                const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
                    const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTasks(tasksData);
                }, (err) => {
                    console.error("Error fetching tasks:", err);
                    setError("Échec du chargement des tâches.");
                });

                // Écouter les entrées de temps de l'utilisateur en temps réel
                const timeEntriesColRef = collection(db, `artifacts/${appId}/users/${user.uid}/timeEntries`);
                const timeEntriesQuery = query(timeEntriesColRef, orderBy('timestamp', 'desc'));
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

    // Logique du chronomètre
    useEffect(() => {
        if (timerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerIntervalRef.current);
        }
        return () => clearInterval(timerIntervalRef.current);
    }, [timerRunning]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStartStop = async () => {
        if (timerRunning) {
            // Arrêter et sauvegarder l'entrée
            await saveTimeEntry(activeTask, elapsedTime);
            setTimerRunning(false);
            setElapsedTime(0);
            setActiveTask(null);
        } else {
            // Démarrer
            setTimerRunning(true);
        }
    };

    const handleTaskSelection = (task) => {
        if (timerRunning && activeTask && activeTask.id !== task.id) {
            // Arrêter le précédent et démarrer le nouveau
            saveTimeEntry(activeTask, elapsedTime);
            setElapsedTime(0);
        }
        setActiveTask(task);
        setTimerRunning(true);
    };

    const saveTimeEntry = async (task, durationSeconds) => {
        if (!db || !userId || !task || durationSeconds <= 0) return;
        try {
            const timeEntriesColRef = collection(db, `artifacts/${appId}/users/${userId}/timeEntries`);
            await addDoc(timeEntriesColRef, {
                taskId: task.id,
                taskTitle: task.titre,
                duration: durationSeconds,
                timestamp: serverTimestamp(),
                userId: userId
            });
        } catch (err) {
            console.error("Error saving time entry:", err);
            setError("Échec de la sauvegarde de l'entrée de temps.");
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const durationSeconds = (manualEntry.durationHours * 3600) + (manualEntry.durationMinutes * 60);
        if (manualEntry.taskId && durationSeconds > 0) {
            const selectedTask = tasks.find(t => t.id === manualEntry.taskId);
            await saveTimeEntry(selectedTask, durationSeconds);
            setManualEntry({ taskId: '', durationHours: 0, durationMinutes: 0 });
        } else {
            setError("Veuillez sélectionner une tâche et saisir une durée valide.");
        }
    };

    const handleDeleteEntry = async (entryId) => {
        // La logique de suppression serait ici, mais nous laissons simple pour le moment
        // Cette fonctionnalité dépend de la règle "Historique Immuable"
        console.log(`Deleting entry with ID: ${entryId}`);
    };
    
    // Affichage des états de chargement/erreur
    if (loading) return <div className="page-center-container"><div className="loading-state">Chargement...</div></div>;
    if (error) return <div className="page-center-container"><div className="error-state">{error}</div></div>;

    return (
        <div className="time-tracking-container">
            <h1 className="page-title">Suivi du Temps</h1>
            
            {/* Affichage du chronomètre */}
            <div className="timer-card">
                <div className="timer-display">{formatTime(elapsedTime)}</div>
                <div className="task-info">
                    {activeTask ? `Tâche en cours : ${activeTask.titre}` : 'Sélectionnez une tâche ci-dessous pour démarrer le chronomètre.'}
                </div>
                <div className="timer-actions">
                    <button
                        className={`timer-btn ${timerRunning ? 'btn-pause' : 'btn-play'}`}
                        onClick={handleStartStop}
                        disabled={!activeTask && !timerRunning}
                    >
                        {timerRunning ? <Pause size={20} /> : <Play size={20} />}
                        <span>{timerRunning ? 'Arrêter' : 'Démarrer'}</span>
                    </button>
                    {timerRunning && (
                        <button className="timer-btn btn-stop" onClick={handleStartStop}>
                            <Square size={20} />
                            <span>Sauvegarder</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Formulaire de saisie manuelle */}
            <div className="manual-entry-card">
                <h2 className="card-title">Saisie Manuelle de Temps</h2>
                <form onSubmit={handleManualSubmit} className="manual-form">
                    <div className="form-group">
                        <label htmlFor="taskSelect" className="form-label">Tâche</label>
                        <select
                            id="taskSelect"
                            className="form-input"
                            value={manualEntry.taskId}
                            onChange={(e) => setManualEntry({...manualEntry, taskId: e.target.value})}
                            required
                        >
                            <option value="">-- Sélectionnez une tâche --</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>{task.titre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="duration-inputs">
                        <div className="form-group">
                            <label htmlFor="hours" className="form-label">Heures</label>
                            <input
                                type="number"
                                id="hours"
                                className="form-input"
                                value={manualEntry.durationHours}
                                onChange={(e) => setManualEntry({...manualEntry, durationHours: parseInt(e.target.value) || 0})}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="minutes" className="form-label">Minutes</label>
                            <input
                                type="number"
                                id="minutes"
                                className="form-input"
                                value={manualEntry.durationMinutes}
                                onChange={(e) => setManualEntry({...manualEntry, durationMinutes: parseInt(e.target.value) || 0})}
                                min="0"
                                max="59"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-submit">
                        <Plus size={18} />
                        Ajouter l'entrée
                    </button>
                </form>
            </div>

            {/* Liste des tâches pour démarrer le chronomètre */}
            <div className="tasks-list-card">
                <h2 className="card-title">Vos Tâches</h2>
                {tasks.length > 0 ? (
                    <ul className="task-selection-list">
                        {tasks.map(task => (
                            <li key={task.id} className="task-item">
                                <span className="task-title">{task.titre}</span>
                                <button
                                    className="btn-start-task"
                                    onClick={() => handleTaskSelection(task)}
                                    disabled={timerRunning && activeTask && activeTask.id === task.id}
                                >
                                    <Play size={16} />
                                    Démarrer
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-data-message">Aucune tâche trouvée. Veuillez en créer une dans la page 'Tâches'.</p>
                )}
            </div>

            {/* Historique des entrées de temps */}
            <div className="time-history-card">
                <h2 className="card-title">Historique Récent</h2>
                {timeEntries.length > 0 ? (
                    <ul className="history-list">
                        {timeEntries.map(entry => (
                            <li key={entry.id} className="history-item">
                                <div className="history-details">
                                    <span className="history-task">{entry.taskTitle}</span>
                                    <span className="history-duration">{formatTime(entry.duration)}</span>
                                    <span className="history-timestamp">
                                        {entry.timestamp?.toDate().toLocaleString()}
                                    </span>
                                </div>
                                <button className="btn-delete" onClick={() => handleDeleteEntry(entry.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-data-message">Pas d'entrées de temps enregistrées.</p>
                )}
            </div>
        </div>
    );
};

export default TimeTrackingPage;
