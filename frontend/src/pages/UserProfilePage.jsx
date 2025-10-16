import React, { useState, useEffect } from 'react';
import { User, Edit, Save, LogOut } from 'lucide-react';
import './UserProfilePage.css';

const UserProfilePage = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

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
                fetchUserProfile(user.uid);
            } else {
                setUserId(null);
                setLoading(false);
            }
        });

        const fetchUserProfile = async (uid) => {
            try {
                const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/profil/userProfile`);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data());
                    setFormData(userDocSnap.data());
                } else {
                    setUserProfile({ nom: 'Nouveau', email: 'votre_email@exemple.com' });
                    setFormData({ nom: 'Nouveau', email: 'votre_email@exemple.com' });
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError("Échec du chargement du profil utilisateur.");
            }
        };

        return () => unsubscribeAuth();
    }, [auth, db, appId]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!db || !userId) return;
        setLoading(true);
        try {
            const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profil/userProfile`);
            await updateDoc(userDocRef, formData);
            setUserProfile(formData);
            setIsEditing(false);
            setLoading(false);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Échec de la mise à jour du profil.");
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (auth) {
                await auth.signOut();
                console.log("User logged out");
                // Redirection ou mise à jour de l'état si nécessaire
            }
        } catch (err) {
            console.error("Error logging out:", err);
        }
    };
    
    if (loading) return <div className="page-center-container"><div className="loading-state">Chargement du profil...</div></div>;
    if (error) return <div className="page-center-container"><div className="error-state">{error}</div></div>;
    if (!userId) return <div className="page-center-container"><div className="error-state">Aucun utilisateur connecté.</div></div>;

    return (
        <div className="profile-container">
            <h1 className="page-title">Mon Profil</h1>
            
            <div className="profile-card">
                <div className="profile-header">
                    <User size={64} className="profile-icon" />
                    <h2 className="profile-name">{userProfile.nom}</h2>
                </div>
                
                <div className="profile-details">
                    <div className="detail-item">
                        <span className="detail-label">Email :</span>
                        <span className="detail-value">{userProfile.email}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">ID Utilisateur :</span>
                        <span className="detail-value user-id">{userId}</span>
                    </div>
                </div>

                <form className="profile-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="nom">Nom</label>
                        <input
                            type="text"
                            id="nom"
                            name="nom"
                            value={formData.nom || ''}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className="form-input"
                        />
                    </div>
                    
                    <div className="profile-actions">
                        {isEditing ? (
                            <>
                                <button type="submit" className="btn-save">
                                    <Save size={18} />
                                    Sauvegarder
                                </button>
                                <button type="button" className="btn-cancel" onClick={handleEditToggle}>
                                    Annuler
                                </button>
                            </>
                        ) : (
                            <button type="button" className="btn-edit" onClick={handleEditToggle}>
                                <Edit size={18} />
                                Modifier le profil
                            </button>
                        )}
                        <button type="button" className="btn-logout" onClick={handleLogout}>
                            <LogOut size={18} />
                            Déconnexion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfilePage;
