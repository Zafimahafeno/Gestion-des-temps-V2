import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  ListTodo,
  Home,
  Clock,
  BarChart,
  UserCircle,
  LogIn,
} from 'lucide-react';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Vérifie la route active
  const isActive = (path) => location.pathname === path;

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleNavigation = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-group">
          <div className="navbar-brand" onClick={() => handleNavigation('/')}>
            <Briefcase size={28} className="navbar-logo" />
            <span className="navbar-title">GESTION DE TEMPS</span>
          </div>

          {/* Boutons principaux */}
          <div className="navbar-main-buttons">
            <button
              onClick={() => handleNavigation('/')}
              className={`navbar-btn ${isActive('/') ? 'navbar-btn-active' : ''}`}
            >
              <Home size={18} />
              <span className="navbar-btn-text">Accueil</span>
            </button>

            <button
              onClick={() => handleNavigation('/projets')}
              className={`navbar-btn ${
                isActive('/projets') ? 'navbar-btn-active' : ''
              }`}
            >
              <Briefcase size={18} />
              <span className="navbar-btn-text">Projets</span>
            </button>

            <button
              onClick={() => handleNavigation('/taches')}
              className={`navbar-btn ${
                isActive('/taches') ? 'navbar-btn-active' : ''
              }`}
            >
              <ListTodo size={18} />
              <span className="navbar-btn-text">Tâches</span>
            </button>

            <button
              onClick={() => handleNavigation('/suivi-temps')}
              className={`navbar-btn ${
                isActive('/suivi-temps') ? 'navbar-btn-active' : ''
              }`}
            >
              <Clock size={18} />
              <span className="navbar-btn-text">Suivi du Temps</span>
            </button>

            <button
              onClick={() => handleNavigation('/rapports')}
              className={`navbar-btn ${
                isActive('/rapports') ? 'navbar-btn-active' : ''
              }`}
            >
              <BarChart size={18} />
              <span className="navbar-btn-text">Rapports</span>
            </button>
          </div>
        </div>

        {/* Bouton de connexion */}
        <div className="navbar-profile-dropdown-container">
          <button
            onClick={toggleDropdown}
            className={`navbar-btn ${isDropdownOpen ? 'navbar-btn-active' : ''}`}
          >
            <LogIn size={18} />
            <span className="navbar-btn-text">Se connecter</span>
          </button>

          {isDropdownOpen && (
            <div className="navbar-dropdown-menu">
              <button
                onClick={() => handleNavigation('/admin')}
                className="dropdown-item"
              >
                <UserCircle size={18} />
                <span>Admin</span>
              </button>
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="dropdown-item"
              >
                <UserCircle size={18} />
                <span>Utilisateur</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
