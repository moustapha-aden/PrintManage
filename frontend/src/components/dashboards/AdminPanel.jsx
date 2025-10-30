import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    // Importation des icônes de la librairie 'react-icons/fi'
    FiUsers, // Utilisé pour le compteur d'utilisateurs
    FiPrinter, // Pour le total des imprimantes
    FiClipboard, // Pour les statistiques d'interventions
    FiBriefcase, // Pour les statistiques des entreprises
    FiTool, // Pour le statut 'maintenance'
    FiArchive, // Pour les imprimantes en stock
    FiXCircle, // Pour les statuts 'hors-service' ou 'inactive'
    FiCircle, // Pour le statut 'active'
    FiTruck, // Pour les imprimantes retournées à l'entrepôt
    FiAlertCircle, // Pour l'affichage des erreurs
    FiCreditCard // Icône pour les imprimantes achetées
} from 'react-icons/fi';
import '../styles/Dashboard.css';

// Définition de l'URL de base de l'API, en utilisant une variable d'environnement pour la flexibilité.
import { API_BASE_URL } from '../../api';

const AdminDashboard = () => {
    // Le hook 'useNavigate' permet de naviguer par programme vers d'autres routes de l'application.
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);

  // Charger le dark mode au montage
  useEffect(() => {
    const storedTheme = localStorage.getItem('isDarkMode');
    setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
  }, []);

    // 'useState' est utilisé pour stocker et gérer l'état de toutes les statistiques du tableau de bord.
    // L'état initial est un objet avec toutes les valeurs par défaut à zéro.
    const [dashboardStats, setDashboardStats] = useState({
        userCount: 0,
        companyCount: 0,
        activeCompanyCount: 0,
        inactiveCompanyCount: 0,
        totalPrinterCount: 0,
        activePrinterCount: 0,
        printersOutOfServiceCount: 0,
        printersMaintainedCount: 0,
        printersInactiveCount: 0,
        printersInStockCount: 0,
        printersInStock: 0,
        unassignedPrintersCount: 0,
        purchasedPrintersCount: 0, // État pour le nouveau compteur d'imprimantes achetées.
        returnedToWarehousePrinterCount: 0,
        printerStatsPercentages: {
            active: 0,
            hors_service: 0,
            inactive: 0,
            in_stock: 0,
            returned_to_warehouse: 0,
        },
        totalInterventionCount: 0,
        interventionsStatus: {
            'Terminée': 0,
            'En Attente': 0,
            'En Cours': 0,
            'Annulée': 0,
        },
    });

    // État pour les activités récentes, initialisé comme un tableau vide.
    const [recentActivities, setRecentActivities] = useState([]);
    // État 'loading' pour afficher un indicateur de chargement pendant la requête.
    const [loading, setLoading] = useState(true);
    // État 'error' pour stocker et afficher les messages d'erreur.
    const [error, setError] = useState(null);

    /**
     * @description Hook 'useCallback' pour mémoriser la fonction de récupération des données du tableau de bord.
     * Cela empêche la recréation de la fonction à chaque rendu, ce qui est utile pour les dépendances de 'useEffect'.
     */
    const fetchDashboardData = useCallback(async () => {
        // Récupération du jeton d'authentification depuis le stockage local.
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Si pas de jeton, on affiche une erreur et on arrête le chargement.
            setError("Non authentifié. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        // Réinitialisation de l'état d'erreur avant de commencer la requête.
        setError(null);

        try {
            // Configuration des en-têtes de la requête avec le jeton d'authentification.
            const headers = { Authorization: `Bearer ${token}` };

            // Utilisation de 'Promise.all' pour lancer les deux requêtes API en parallèle
            // (statistiques et activités récentes) afin d'optimiser le temps de chargement.
            const [statsResponse, activitiesResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/dashboard/stats`, { headers }),
                axios.get(`${API_BASE_URL}/dashboard/recent-activities`, { headers }),
            ]);

            const data = statsResponse.data;

            // Mise à jour de l'état des statistiques du tableau de bord avec les données de la réponse de l'API.
            setDashboardStats({
                userCount: data.userCount,
                companyCount: data.companyCount,
                activeCompanyCount: data.activeCompanyCount,
                inactiveCompanyCount: data.inactiveCompanyCount,
                totalPrinterCount: data.totalPrinterCount,
                activePrinterCount: data.activePrinterCount,
                printersOutOfServiceCount: data.printersOutOfServiceCount,
                printersMaintainedCount: data.printersMaintainedCount,
                printersInactiveCount: data.printersInactiveCount,
                printersInStockCount: data.printersInStockCount,
                printersInStock: data.printersInStock,
                unassignedPrintersCount: data.unassignedPrintersCount,
                returnedToWarehousePrinterCount: data.returnedToWarehousePrinterCount,
                purchasedPrintersCount: data.purchasedPrintersCount, // Mise à jour de l'état avec la nouvelle donnée.
                printerStatsPercentages: data.printerStatsPercentages,
                totalInterventionCount: data.totalInterventionCount,
                interventionsStatus: {
                    // Les clés d'objets sont normalisées pour correspondre aux labels du front-end.
                    'Terminée': data.interventionsStatus.Terminee || 0,
                    'En Attente': data.interventionsStatus['En Attente'] || 0,
                    'En Cours': data.interventionsStatus['En Cours'] || 0,
                    'Annulée': data.interventionsStatus.Annulee || 0,
                },
            });

            // Mise à jour de l'état des activités récentes.
            setRecentActivities(activitiesResponse.data);

        } catch (err) {
            // Gestion des erreurs de la requête API.
            console.error("Erreur tableau de bord:", err);
            if (err.response && err.response.status === 401) {
                // Si l'erreur est 401 (non autorisé), cela signifie que le jeton a expiré.
                setError("Session expirée. Veuillez vous reconnecter.");
                localStorage.clear(); // Nettoyage du stockage local.
                window.location.href = '/login'; // Redirection vers la page de connexion.
            } else {
                // Gestion des autres types d'erreurs réseau ou serveur.
                setError("Erreur lors du chargement : " + (err.response?.data?.message || "Vérifiez le serveur."));
            }
        } finally {
            // Cette partie du code s'exécute toujours, que la requête réussisse ou échoue.
            // On met 'loading' à 'false' pour masquer l'indicateur de chargement.
            setLoading(false);
        }
    }, [API_BASE_URL]); // La fonction 'useCallback' dépend de l'URL de base pour se recréer si elle change.

    // Le hook 'useEffect' appelle la fonction de récupération des données au premier rendu du composant.
    // Il dépend de 'fetchDashboardData', qui est une fonction mémorisée par 'useCallback'.
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // --- Fonctions de gestion des clics sur les cartes ---
    // Chaque fonction navigue vers une route spécifique et peut passer un état
    // pour que le composant de destination applique un filtre.

    const handleUsersClick = () => {
        navigate('/admin/users');
    };

    const handleCompaniesClick = (status = 'all') => {
        navigate('/admin/companies', { state: { filterStatus: status } });
    };

    // Nouvelle fonction de navigation pour la carte des imprimantes achetées.
    const handlePrintersPurchasedClick = () => {
        navigate('/admin/printers', { state: { filterPurchased: true } });
    };

    // Fonction de navigation générale pour les imprimantes avec divers filtres.
    const handlePrintersClick = (status = 'all', filterUnassigned = false, filterReturnedToWarehouse = false, filterInStock = false) => {
        if (filterUnassigned) {
            navigate('/admin/printers', { state: { filterUnassigned: true } });
        } else if (filterReturnedToWarehouse) {
            navigate('/admin/printers', { state: { filterReturnedToWarehouse: true } });
        } else if (filterInStock) {
            navigate('/admin/printers', { state: { filterInStock: true  } });
        } else {
            navigate('/admin/printers', { state: { filterStatus: status } });
        }
    };

    
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
    const handleInterventionsClick = (status = 'all') => {
        navigate('/admin/interventions', { state: { filterStatus: status } });
    };

    // Affiche le message de chargement si 'loading' est vrai.
    if (loading) {
        return (
            <div className="dashboard-loading loading-overlay" style={cardStyle} >
                <p>Chargement du tableau de bord administrateur...</p>
            </div>
        );
    }

    // Affiche le message d'erreur si 'error' n'est pas nul.
    if (error) {
        return (
            <p className="dashboard-error alert alert-error">
                <FiAlertCircle className="alert-icon" />
                <span>Erreur: {error}</span>
            </p>
        );
    }


    // Le rendu principal du composant une fois les données chargées.
    return (
        <div className={`admin-panel ${isDarkMode ? 'dark-mode' : ''}`}>
            <h2>Tableau de Bord Administrateur</h2>

            <h3>Statistiques Générales</h3>
            <div className="stats-grid">
                {/* Section pour les cartes de statistiques générales */}
                <div className="stat-card users clickable"  onClick={handleUsersClick}>
                    <FiUsers className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.userCount}</h3>
                    <p style={cardStyle}>Utilisateurs Enregistrés</p>
                </div>
                <div className="stat-card total-companies clickable" onClick={() => handleCompaniesClick('all')}>
                    <FiBriefcase className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.companyCount}</h3>
                    <p style={cardStyle}>Total Sociétés</p>
                </div>
                <div className="stat-card active-companies clickable"  onClick={() => handleCompaniesClick('active')}>
                    <FiBriefcase className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.activeCompanyCount}</h3>
                    <p style={cardStyle}>Sociétés Actives</p>
                </div>
                <div className="stat-card inactive-companies clickable" onClick={() => handleCompaniesClick('inactive')} >
                    <FiBriefcase className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.inactiveCompanyCount}</h3>
                    <p style={cardStyle}>Sociétés Inactives</p>
                </div>
            </div>
            <hr />
            <h3 >Statistiques des Imprimantes</h3>
            <div className="stats-grid" >
                {/* Section pour les cartes de statistiques des imprimantes */}
                <div className="stat-card total-printers clickable" onClick={() => handlePrintersClick('all')} >
                    <FiPrinter className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.totalPrinterCount}</h3>
                    <p style={cardStyle}>Total Imprimantes</p>
                </div>
                <div className="stat-card active-printers clickable" onClick={() => handlePrintersClick('active')} >
                    <FiCircle className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.activePrinterCount} ({dashboardStats.printerStatsPercentages.active}%)</h3>
                    <p style={cardStyle}>Imprimantes Actives</p>
                </div>
                {/* Carte pour les imprimantes achetées, avec un gestionnaire de clic dédié */}
                <div className="stat-card purchased-printers clickable" onClick={handlePrintersPurchasedClick} >
                    <FiCreditCard className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.purchasedPrintersCount} ({dashboardStats.printerStatsPercentages.purchased || 0}%)</h3>
                    <p>Imprimantes Achetées</p>
                </div>
                <div  className="stat-card printers-in-stock clickable" onClick={() => handlePrintersClick(null, false, false, true)}>
                    <FiArchive className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.printersInStockCount} ({dashboardStats.printerStatsPercentages.in_stock}%)</h3>
                    <p style={cardStyle}>Imprimantes a l'Entrepôt</p>
                </div>
                <div className="stat-card printers-in-stock clickable" onClick={() => handlePrintersClick(null, false, false, true)} >
                    <FiArchive className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.printersInStock} ({dashboardStats.printerStatsPercentages.in_stock}%)</h3>
                    <p>Imprimantes en Stock</p>
                </div>
                <div className="stat-card returned-to-warehouse-printers clickable" onClick={() => handlePrintersClick(null, false, true, false)} >
                    <FiTruck className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.returnedToWarehousePrinterCount} ({dashboardStats.printerStatsPercentages.returned_to_warehouse}%)</h3>
                    <p style={cardStyle}>Imprimantes Retournées Entrepôt</p>
                </div>
                <div  className="stat-card printers-maintained clickable" onClick={() => handlePrintersClick('maintenance')}>
                    <FiTool className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.printersMaintainedCount}</h3>
                    <p style={cardStyle}>Imprimantes en Maintenance</p>
                </div>
                <div  className="stat-card printers-out-of-service clickable" onClick={() => handlePrintersClick('hors-service')}>
                    <FiXCircle className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.printersOutOfServiceCount} ({dashboardStats.printerStatsPercentages.hors_service}%)</h3>
                    <p style={cardStyle}>Imprimantes Hors Service</p>
                </div>
                <div  className="stat-card printers-inactive clickable" onClick={() => handlePrintersClick('inactive')}>
                    <FiXCircle className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.printersInactiveCount} ({dashboardStats.printerStatsPercentages.inactive}%)</h3>
                    <p style={cardStyle}>Imprimantes Inactives</p>
                </div>
            </div>

            <hr />

            <h3>Statistiques des Interventions</h3>
            <div className="stats-grid" style={cardStyle}>
                {/* Section pour les cartes de statistiques des interventions */}
                <div style={cardStyle} className="stat-card total-interventions clickable" onClick={() => handleInterventionsClick('all')}>
                    <FiClipboard className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.totalInterventionCount}</h3>
                    <p style={cardStyle}>Total Interventions</p>
                </div>
                <div style={cardStyle} className="stat-card interventions-completed clickable" onClick={() => handleInterventionsClick('Terminée')}>
                    <FiClipboard className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.interventionsStatus.Terminée}</h3>
                    <p style={cardStyle}>Interventions Terminées</p>
                </div>
                <div style={cardStyle} className="stat-card interventions-pending clickable" onClick={() => handleInterventionsClick('En Attente')}>
                    <FiClipboard className="stat-icon" />
                    <h3>{dashboardStats.interventionsStatus['En Attente']}</h3>
                    <p>Interventions en Attente</p>
                </div>
                <div style={cardStyle} className="stat-card interventions-in-progress clickable" onClick={() => handleInterventionsClick('En Cours')}>
                    <FiClipboard className="stat-icon" />
                    <h3 style={cardStyle} >{dashboardStats.interventionsStatus['En Cours']}</h3>
                    <p style={cardStyle}>Interventions en Cours</p>
                </div>
                <div style={cardStyle} className="stat-card interventions-canceled clickable" onClick={() => handleInterventionsClick('Annulée')}>
                    <FiClipboard className="stat-icon" />
                    <h3 style={cardStyle}>{dashboardStats.interventionsStatus.Annulée}</h3>
                    <p style={cardStyle}>Interventions Annulées</p>
                </div>
            </div>

            <hr />

            <div className="recent-activities" style={cardStyle}>
                <h3 style={cardStyle}>Activités Récentes</h3>
                {/* Affichage conditionnel des activités récentes */}
                {recentActivities.length > 0 ? (
                    <ul>
                        {/* Boucle sur le tableau des activités récentes pour générer une liste */}
                        {recentActivities.map((activity) => (
                            <li key={activity.id} className="activity-item" style={cardStyle}>
                                <span className="activity-date" style={cardStyle}>{activity.date}</span>
                                <span className="activity-description" style={cardStyle}>{activity.description}</span>
                                <span className="activity-status" style={cardStyle}>{activity.status}</span>
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

export default AdminDashboard;