import React from 'react';
import './HeroCard.css'; // Créez un fichier CSS pour la carte

const HeroCard = ({ children }) => (
  <div className="hero-card animate-fadeIn">
    {children}
  </div>
);

export default HeroCard;