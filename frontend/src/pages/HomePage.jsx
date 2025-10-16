import React from 'react';
import { Briefcase, ListTodo, Wrench, Sparkles, LogIn, UserPlus, Quote } from 'lucide-react'; // Ajout d'icônes
import './HomePage.css'; // Assurez-vous que ce fichier CSS est lié

const HomePage = ({ setCurrentPage }) => {
    // Fonction pour naviguer vers l'authentification (si vous avez une page dédiée)
    const handleAuthClick = (authType) => {
        console.log(`Action: ${authType}`);
        // Ici, vous navigueriez vers votre page de connexion/inscription
        // Si vous utilisez React Router, ce serait history.push('/login')
        // Pour cet exemple, nous allons simuler un changement de page ou une alerte
        alert(`Vous avez cliqué sur ${authType}. Implémentez la navigation ici.`);
    };

    return (
        <div className="home-container">
            {/* --------------------- En-tête avec boutons d'action --------------------- */}
            <header className="home-header">
                <div className="logo">
                    <Sparkles size={30} className="logo-icon" />
                    <span className="logo-text">TaskFlow</span> {/* Nom de l'app */}
                </div>
                <div className="auth-buttons">
                    <button
                        onClick={() => handleAuthClick('Se connecter')}
                        className="btn-auth btn-login glass-card-small"
                    >
                        <LogIn size={20} />
                        <span>Se connecter</span>
                    </button>
                    <button
                        onClick={() => handleAuthClick('Créer un compte')}
                        className="btn-auth btn-signup glass-card-small"
                    >
                        <UserPlus size={20} />
                        <span>Créer un compte</span>
                    </button>
                </div>
            </header>

            {/* Effet de fond avec des bulles animées */}
            <div className="background-bubbles">
                {[...Array(10)].map((_, i) => <div key={i} className="bubble"></div>)}
            </div>

            {/* --------------------- Section d'introduction (Hero Section) --------------------- */}
            <section className="hero-section">
                <div className="hero-card glass-card animate-fadeIn">
                    <h1 className="home-title">Optimisez Votre Productivité avec <span className="highlight">TaskFlow</span></h1>
                    <p className="home-description">
                        **TaskFlow** est votre compagnon essentiel pour transformer le chaos en clarté. Gérez sans effort vos projets, organisez vos tâches et atteignez vos objectifs, le tout dans une interface intuitive et élégante.
                    </p>
                    <div className="btn-container">
                        <button
                            onClick={() => handleAuthClick('Créer un compte')} // Bouton principal pour commencer
                            className="btn-primary-hero"
                        >
                            <Wrench size={20} />
                            <span>Démarrer Gratuitement</span>
                        </button>
                        {/* Optionnel: Bouton pour voir les fonctionnalités sans s'inscrire */}
                        <button
                            onClick={() => { /* Scroll vers la section des fonctionnalités */ }}
                            className="btn-secondary-hero"
                        >
                            <span>Découvrir les Fonctionnalités</span>
                        </button>
                    </div>
                </div>
                {/* Image d'illustration moderne */}
                {/* <div className="hero-image animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                    <img src="/path/to/your/dashboard-screenshot.png" alt="Tableau de bord TaskFlow" />
                </div>
                */}
            </section>

            {/* --------------------- Section des fonctionnalités détaillées --------------------- */}
            <section className="features-section">
                <h2 className="section-title">Des Fonctionnalités Conçues pour Vous</h2>
                <p className="section-subtitle">
                    TaskFlow vous offre tous les outils dont vous avez besoin pour une gestion de projets et de tâches simplifiée, mais puissante.
                </p>
                <div className="features-grid">
                    <div className="feature-card glass-card animate-fadeIn">
                        <Briefcase size={48} className="feature-icon" />
                        <h3 className="feature-title">Gestion de Projets Intuitive</h3>
                        <p className="feature-description">
                            **Visualisez l'ensemble de vos projets** avec des tableaux de bord clairs. Créez, modifiez et suivez l'avancement de chaque initiative, du début à la fin. Assignez des membres, définissez des échéances et gardez une vue d'ensemble.
                        </p>
                    </div>
                    <div className="feature-card glass-card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <ListTodo size={48} className="feature-icon" />
                        <h3 className="feature-title">Organisation des Tâches Détaillée</h3>
                        <p className="feature-description">
                            Décomposez vos projets en tâches gérables. **Attribuez des priorités, des statuts et des dates d'échéance.** L'interface glisser-déposer vous permet de réorganiser et de mettre à jour vos tâches en un clin d'œil.
                        </p>
                    </div>
                    <div className="feature-card glass-card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <Sparkles size={48} className="feature-icon" />
                        <h3 className="feature-title">Interface Épurée & Performante</h3>
                        <p className="feature-description">
                            Profitez d'une **expérience utilisateur fluide et sans distraction**. Notre design minimaliste mais élégant, avec son effet "glassmorphism", vous aide à vous concentrer sur vos objectifs sans encombrement visuel.
                        </p>
                    </div>
                </div>
            </section>

            {/* --------------------- Section Témoignages (Exemple d'ajout) --------------------- */}
            <section className="testimonials-section">
                <h2 className="section-title">Ce que disent nos utilisateurs</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card glass-card animate-fadeIn">
                        <Quote size={30} className="testimonial-icon" />
                        <p className="testimonial-text">
                            "TaskFlow a transformé la façon dont mon équipe gère nos projets. L'interface est incroyablement intuitive et l'effet glassmorphism est un vrai plus esthétique !"
                        </p>
                        <p className="testimonial-author">- Jeanne D., Chef de Projet</p>
                    </div>
                    <div className="testimonial-card glass-card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <Quote size={30} className="testimonial-icon" />
                        <p className="testimonial-text">
                            "J'adore la simplicité de TaskFlow pour organiser mes tâches quotidiennes. Le suivi de la progression est un jeu d'enfant et cela m'aide vraiment à rester productive."
                        </p>
                        <p className="testimonial-author">- Marc L., Développeur Indépendant</p>
                    </div>
                </div>
            </section>

            {/* --------------------- Section d'appel à l'action finale (CTA) --------------------- */}
            <section className="cta-section">
                <div className="cta-card glass-card animate-fadeIn">
                    <h2 className="cta-title">Prêt à Transformer Votre Façon de Travailler ?</h2>
                    <p className="cta-description">
                        Rejoignez la communauté TaskFlow et découvrez une nouvelle dimension de la gestion de projets et de tâches. L'efficacité est à portée de clic !
                    </p>
                    <button
                        onClick={() => handleAuthClick('Créer un compte')}
                        className="btn-primary" // Utilisez le style principal pour le CTA final
                    >
                        <Wrench size={20} />
                        <span>Commencer Votre Essai Gratuit</span>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default HomePage;