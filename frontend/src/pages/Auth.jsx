import React, { useState } from "react";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // <-- CSS personnalisé

const API_BASE_URL = "http://localhost:8080/api/auth";

const Auth = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("login");
  const [form, setForm] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); 

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (view === "register" && form.motDePasse !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const endpoint =
      view === "register"
        ? `${API_BASE_URL}/register`
        : `${API_BASE_URL}/login`;

    const bodyData =
      view === "register"
        ? {
            nom: form.nom,
            email: form.email,
            motDePasse: form.motDePasse,
          }
        : {
            email: form.email,
            motDePasse: form.motDePasse,
          };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        // Tenter de lire le message d'erreur du serveur si disponible
        const errorData = await res.json().catch(() => ({ message: "Erreur de connexion." }));
        throw new Error(errorData.message || "Erreur lors de la soumission.");
      }
      
      const data = await res.json(); // <-- Récupérer la réponse JSON ici

      // LOGIQUE DE SUCCÈS
      if (view === "register") {
        // Redirection interne vers la section de connexion
        setView("login");
        setSuccessMessage("✅ Inscription réussie ! Vous pouvez maintenant vous connecter.");
        
        // Vider uniquement les champs de mot de passe 
        setForm(prev => ({ 
            ...prev, 
            motDePasse: '', 
            confirmPassword: ''
        }));
        
      } else {
        // CAS DE CONNEXION RÉUSSIE (MODIFIÉ)
        // 1. Lire le rôle de l'utilisateur à partir des données de réponse
        const userRole = data.role; // Assurez-vous que le champ 'role' existe dans la réponse de votre backend
        
        // 2. Rediriger en fonction du rôle
        if (userRole === 'ADMIN') {
            navigate("/admin"); // Rediriger vers la page d'administration
        } else {
            navigate("/dashboard"); // Rediriger vers le tableau de bord standard (pour USER ou rôle non spécifié)
        }
        
        // *Optionnel: Enregistrer le token/les données de l'utilisateur dans le stockage local ou le contexte global ici.*
      }
      
    } catch (err) {
      // Afficher un message d'erreur
      if (view === "login") {
          setError("Email ou mot de passe invalide.");
      } else {
          setError(err.message || "Erreur lors de l'inscription. L'email est peut-être déjà utilisé.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center">
      <div className="auth-card text-center shadow-lg p-5 rounded-4">
        <div className="mb-4">
          {view === "login" ? (
            <LogIn size={40} className="text-primary mb-2" />
          ) : (
            <UserPlus size={40} className="text-primary mb-2" />
          )}
          <h2 className="fw-bold text-light">
            {view === "login" ? "Connexion" : "Inscription"}
          </h2>
          <p className="text-light-50">
            {view === "login"
              ? "Connectez-vous à votre compte"
              : "Créez un nouveau compte"}
          </p>
        </div>

        {error && <div className="alert alert-danger p-2">{error}</div>}
        {successMessage && <div className="alert alert-success p-2">{successMessage}</div>} 

        <form onSubmit={handleSubmit}>
          {view === "register" && (
            <div className="mb-3">
              <input
                type="text"
                name="nom"
                className="form-control form-control-lg rounded-pill"
                placeholder="Nom complet"
                value={form.nom}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control form-control-lg rounded-pill"
              placeholder="Adresse e-mail"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="motDePasse"
              className="form-control form-control-lg rounded-pill"
              placeholder="Mot de passe"
              value={form.motDePasse}
              onChange={handleChange}
              required
            />
          </div>
          {view === "register" && (
            <div className="mb-3">
              <input
                type="password"
                name="confirmPassword"
                className="form-control form-control-lg rounded-pill"
                placeholder="Confirmer le mot de passe"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-3 fw-semibold rounded-pill d-flex justify-content-center align-items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />{" "}
                {view === "login" ? "Connexion..." : "Inscription..."}
              </>
            ) : view === "login" ? (
              "Se connecter"
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        <div className="mt-4 text-light-50">
          {view === "login" ? (
            <>
              Pas encore de compte ?{" "}
              <button
                className="btn btn-link p-0 fw-semibold text-decoration-none text-info"
                onClick={() => setView("register")}
              >
                Créez-en un
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{" "}
              <button
                className="btn btn-link p-0 fw-semibold text-decoration-none text-info"
                onClick={() => setView("login")}
              >
                Connectez-vous
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;