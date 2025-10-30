// src/components/pages/ResourceManagementPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ManagementPage.css';

const ResourceManagementPage = () => {
    const navigate = useNavigate();
    return (
        <div className="management-page-container">
            <h2>Ajout/Gestion des Ressources</h2>
            <p>Ceci est la page pour ajouter ou gérer d'autres types de ressources (ex: consommables, pièces détachées).</p>
            <button className="back-button" onClick={() => navigate('/dashboard')}>Retour au Tableau de Bord</button>
        </div>
    );
};

export default ResourceManagementPage;