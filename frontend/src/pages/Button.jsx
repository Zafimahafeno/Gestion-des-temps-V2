import React from 'react';
import './Button.css'; // Créez un fichier CSS pour les boutons

const Button = ({ onClick, icon, text }) => (
  <button onClick={onClick} className="btn-primary">
    {icon}
    <span>{text}</span>
  </button>
);

export default Button;