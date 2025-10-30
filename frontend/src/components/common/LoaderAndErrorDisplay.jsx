// src/components/common/LoaderAndErrorDisplay.jsx
import React from 'react';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import '../styles/ManagementPage.css'; // Assurez-vous d'importer les styles nécessaires

const LoaderAndErrorDisplay = ({ loading, error }) => {
    if (loading) {
        return (
            <div className="management-page-container loading-overlay">
                <FiLoader className="loading-spinner-icon" />
                <p>Chargement des données...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="management-page-container alert alert-error">
                <FiAlertCircle className="alert-icon" />
                <p>Erreur: {error}</p>
            </div>
        );
    }
    return null;
};

export default LoaderAndErrorDisplay;