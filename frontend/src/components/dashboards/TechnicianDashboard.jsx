// src/components/dashboards/TechnicianDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import {
    FiTool,
    FiPrinter,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiActivity,
    FiZap, // For interventions in progress (more dynamic than FiTool)
    FiBellOff, // For canceled interventions
    FiAward // Nouvelle icône pour les interventions réalisées
} from 'react-icons/fi';
import '../styles/Dashboard.css'; // Reuse general dashboard styles

import { API_BASE_URL } from '../../api';

const TechnicianDashboard = () => {
    const navigate = useNavigate(); // Initialize useNavigate hook

    // The state keys now match the names sent by the backend
    const [interventionsCount, setInterventionsCount] = useState({
        'En Attente': 0,
        'En Cours': 0,
        'Terminée': 0,
        'Annulée': 0,
    });
    const [completedByTechnicianCount, setCompletedByTechnicianCount] = useState(0); // Nouveau state pour le compteur
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserId = localStorage.getItem('userId');
    const currentUserName = localStorage.getItem('userName');
    const [isDarkMode, setIsDarkMode] = useState(false);

  // Charger le dark mode au montage
  useEffect(() => {
    const storedTheme = localStorage.getItem('isDarkMode');
    setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
  }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token || !currentUserId) {
                setError("Non authentifié ou ID technicien manquant. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            try {
                // Appel au nouveau endpoint spécifique au technicien
                const response = await axios.get(`${API_BASE_URL}/dashboard/technician-stats?technician_id=${currentUserId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data;

                // Update states with backend data
                setInterventionsCount(data.interventionsCount);
                setCompletedByTechnicianCount(data.completedByTechnicianCount); // Mettre à jour le nouveau state
                setRecentActivities(data.recentActivities);

            } catch (err) {
                console.error("Erreur lors du chargement des données du tableau de bord technicien:", err);
                if (err.response && err.response.status === 401) {
                    setError("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                    localStorage.clear();
                    window.location.href = '/login';
                } else {
                    setError("Erreur lors du chargement des données du tableau de bord. " + (err.response?.data?.message || "Veuillez vérifier votre connexion ou l'état du serveur."));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUserId]); // Dépend du currentUserId pour recharger si l'utilisateur change

    // Function to handle clicks on intervention status cards
    const handleInterventionsClick = (status = 'all') => {
        // Naviguer vers la page des interventions avec le filtre de statut et l'ID du technicien
        navigate('/technician/interventions', { state: { filterStatus: status, filterTechnicianId: currentUserId } });
    };

    // Nouvelle fonction pour gérer le clic sur les interventions réalisées par le technicien
    const handleCompletedByMeClick = () => {
        navigate('/technician/interventions', { state: { filterStatus: 'all', filterTechnicianId: currentUserId } });
    };

    // if (loading) {
    //     return <div className="dashboard-loading">Chargement du tableau de bord technicien...</div>;
    // }

    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
    if (error) {
        return <p className="dashboard-error">Erreur: {error}</p>;
    }

    return (
        <div className={`technician-portal ${isDarkMode ? 'dark-mode' : ''}`}>
            <h2>Tableau de Bord Technicien - {currentUserName}</h2>
            <div className="stats-grid" >
                {/* NOUVELLE CARTE : Interventions Réalisées par moi */}
                <div
                    className="stat-card interventions-resolved-by-me clickable" // Nouvelle classe CSS
                    onClick={handleCompletedByMeClick} 
                    style={cardStyle}
                >
                    <FiAward className="stat-icon" /> {/* Nouvelle icône */}
                    <h3 style={cardStyle}>{completedByTechnicianCount}</h3>
                    <p style={cardStyle}>Interventions Réalisées par moi</p>
                </div>

                {/* Interventions en Attente */}
                <div style={cardStyle}
                    className="stat-card interventions-pending clickable"
                    onClick={() => handleInterventionsClick('En Attente')}
                >
                
                    <FiClock className="stat-icon" />
                    <h3 style={cardStyle}>{interventionsCount['En Attente']}</h3>
                    <p style={cardStyle}>Interventions En Attente</p>
                </div>
                {/* Interventions en Cours */}
                <div style={cardStyle}
                    className="stat-card interventions-in-progress clickable"
                    onClick={() => handleInterventionsClick('En Cours')}
                >
                    <FiZap className="stat-icon" />
                    <h3 style={cardStyle}>{interventionsCount['En Cours']}</h3>
                    <p style={cardStyle}>Interventions En Cours</p>
                </div>
                {/* Interventions Terminées (globales) */}
                <div style={cardStyle}
                    className="stat-card interventions-completed clickable"
                    onClick={() => handleInterventionsClick('Terminée')}
                >
                    <FiCheckCircle className="stat-icon" />
                    <h3 style={cardStyle}>{interventionsCount['Terminée']}</h3>
                    <p style={cardStyle}>Interventions Terminées </p>
                </div>
                {/* Interventions Annulées */}
                <div style={cardStyle}
                    className="stat-card interventions-canceled clickable"
                    onClick={() => handleInterventionsClick('Annulée')}
                >
                    <FiBellOff className="stat-icon" />
                    <h3 style={cardStyle}>{interventionsCount['Annulée']}</h3>
                    <p style={cardStyle}>Interventions Annulées</p>
                </div>
            </div>

            <div className="recent-activities" style={cardStyle}>
                <h3 style={cardStyle}>Mes Activités Récentes</h3>
                {recentActivities.length > 0 ? (
                    <ul>
                        {recentActivities.map((activity) => (
                            <li key={activity.id} className="activity-item" style={cardStyle}>
                                <span className="activity-date" style={cardStyle}>{activity.date}</span>
                                <span className="activity-description" style={cardStyle}>{activity.description}</span>
                                <span className="activity-status status-small" style={cardStyle}>{activity.status}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucune activité récente à afficher.</p>
                )}
            </div>
        </div>
    );
};

export default TechnicianDashboard;
