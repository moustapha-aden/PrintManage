// src/components/pages/RequestManagementPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ManagementPage.css';

const RequestManagementPage = () => {
    const navigate = useNavigate();
    return (
        <div className="management-page-container">
            <div className="management-header">
                <h2>Consultation des Requêtes</h2>
            </div>
            <p>
                Ceci est la page où vous pourrez consulter et gérer toutes les requêtes des clients.
            </p>
            <button className="back-button" onClick={() => navigate('/dashboard')}>
                Retour au Tableau de Bord
            </button>
        </div>
    );
};

export default RequestManagementPage;
