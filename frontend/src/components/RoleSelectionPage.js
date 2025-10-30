// src/components/RoleSelectionPage.js (MISE À JOUR)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/RoleSelectionPage.css';

function RoleSelectionPage() {
  const navigate = useNavigate();
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedRoles = localStorage.getItem('userRoles');
    const storedName = localStorage.getItem('userName');
    
    // Si l'utilisateur n'a pas de rôles stockés ou pas de nom, rediriger vers la connexion
    if (!storedRoles || !storedName) {
      navigate('/login');
      return;
    }

    const rolesArray = JSON.parse(storedRoles);
    setAvailableRoles(rolesArray);
    setUserName(storedName);

    // Si l'utilisateur n'a qu'un seul rôle, le rediriger directement au dashboard
    // Ceci gère le cas où quelqu'un accède directement à /select-role avec un seul rôle par erreur.
    if (rolesArray.length === 1) {
      localStorage.setItem('userRole', rolesArray[0]); // Définir le rôle actif
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRoleSelect = (role) => {
    localStorage.setItem('userRole', role); // Définir le rôle actif choisi
    navigate('/dashboard'); // Rediriger vers le tableau de bord unique
  };

  if (availableRoles.length === 0) {
    return (
      <div className="role-selection-container">
        <p>Chargement des rôles ou aucune option disponible...</p>
      </div>
    );
  }

  const roleDisplayNames = {
    'admin': 'Administrateur',
    'client': 'Client (Entreprise/Compagnie)',
    'technicien': 'Technicien',
    // Ajoutez d'autres rôles si nécessaire
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-box">
        <h2>Bienvenue {userName} !</h2>
        <h3>Choisissez votre rôle :</h3>
        <div className="role-buttons">
          {availableRoles.map(role => (
            <button
              key={role}
              className="role-button"
              onClick={() => handleRoleSelect(role)}
            >
              Accéder en tant que {roleDisplayNames[role] || role}
            </button>
          ))}
        </div>
        <button className="logout-button" onClick={() => {
          localStorage.clear();
          navigate('/login');
        }}>Déconnexion</button>
      </div>
    </div>
  );
}

export default RoleSelectionPage;