import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import {
    FiAlertCircle,
    FiLoader,
    FiClock
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';
import InterventionDetailModal from "../modals/InterventionDetailModal";
import StatusUpdateModal from '../modals/StatusUpdateModal';
import InterventionCard from '../modals/InterventionCard';

import { API_BASE_URL } from '../../api';

const TechnicianInterventionsPage = () => {
    // États principaux
    const [allInterventions, setAllInterventions] = useState([]); // Toutes les interventions récupérées
    const [selectedIntervention, setSelectedIntervention] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Références pour le scroll
    const detailRef = useRef(null);
    const updateRef = useRef(null);

    // Filtres frontend
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterInterventionType, setFilterInterventionType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('active'); // 'active' = En Attente + En Cours

    // Modale de mise à jour de statut
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [interventionForStatusUpdate, setInterventionForStatusUpdate] = useState(null);
    const [statusToApply, setStatusToApply] = useState('');

    // Pagination frontend
    const [currentPage, setCurrentPage] = useState(1);
    const [interventionsPerPage, setInterventionsPerPage] = useState(12);

    // Informations utilisateur
    const currentUserId = localStorage.getItem('userId');
    const currentUserRole = localStorage.getItem('userRole');

    const API_INTERVENTIONS_URL = `${API_BASE_URL}/interventions`;

    // Filtrage côté frontend avec useMemo pour optimiser les performances
    const filteredInterventions = useMemo(() => {
        let filtered = allInterventions.filter(intervention => {
            // Filtrer par statut
            if (filterStatus === 'active') {
                if (!['En Attente', 'En Cours'].includes(intervention.status)) {
                    return false;
                }
            } else if (filterStatus === 'completed') {
                if (!['Terminée', 'Annulée'].includes(intervention.status)) {
                    return false;
                }
            }

            // Filtrer par priorité
            if (filterPriority !== 'all' && intervention.priority !== filterPriority) {
                return false;
            }

            // Filtrer par type d'intervention
            if (filterInterventionType !== 'all' && intervention.type_intervention !== filterInterventionType) {
                return false;
            }

            return true;
        });

        return filtered;
    }, [allInterventions, filterPriority, filterInterventionType, filterStatus]);




    // Pagination des interventions filtrées
    const paginatedInterventions = useMemo(() => {
        const startIndex = (currentPage - 1) * interventionsPerPage;
        const endIndex = startIndex + interventionsPerPage;
        return filteredInterventions.slice(startIndex, endIndex);
    }, [filteredInterventions, currentPage, interventionsPerPage]);

    // Calcul des informations de pagination
    const totalFilteredCount = filteredInterventions.length;
    const totalPages = Math.ceil(totalFilteredCount / interventionsPerPage);

    // Fonctions de gestion de la pagination
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleInterventionsPerPageChange = useCallback((e) => {
        setInterventionsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1);
    }, []);

    // Réinitialiser la page lors du changement de filtres
    const handleFilterChange = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Fonction pour récupérer TOUTES les interventions du technicien
    const fetchTechnicianInterventions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            if (currentUserRole !== 'technicien' || !currentUserId) {
                setError("Accès non autorisé. Cette page est réservée aux techniciens.");
                setLoading(false);
                return;
            }
            
            const url = new URL(API_INTERVENTIONS_URL);
            const relations = [
                'client.company',
                'client.department',
                'printer.company',
                'printer.department',
                'technician'
            ].join(',');

            url.searchParams.append('with', relations);
            url.searchParams.append('technician_id', currentUserId);
            // Récupérer un grand nombre d'interventions pour éviter la pagination API
            url.searchParams.append('per_page', '1000');

            console.log("Fetching ALL technician interventions from URL:", url.toString());
            const response = await axios.get(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Gérer la réponse selon le format (paginé ou simple array)
            let interventionsData = [];
            if (response.data.data) {
                interventionsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                interventionsData = response.data;
            }

            setAllInterventions(interventionsData);
            console.log("All technician interventions fetched successfully:", interventionsData.length, "interventions");
        } catch (err) {
            setError('Erreur lors du chargement de vos interventions.');
            console.error("Erreur API interventions technicien:", err.response ? err.response.data : err.message);
            setAllInterventions([]);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, currentUserRole, API_INTERVENTIONS_URL]);

    useEffect(() => {
        fetchTechnicianInterventions();
    }, [fetchTechnicianInterventions]);

    const scrollToElement = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    useEffect(() => {
        if (selectedIntervention) {
            scrollToElement(detailRef);
        } else if (showStatusUpdateModal) {
            scrollToElement(updateRef);
        }
    }, [selectedIntervention, showStatusUpdateModal]);

    const handleViewDetails = (intervention) => {
        setSelectedIntervention(intervention);
    };

    const handleCloseDetails = () => {
        setSelectedIntervention(null);
    };

    const handleFinishIntervention = (intervention) => {
        if (['Terminée', 'Annulée'].includes(intervention.status)) {
            setError('Impossible de terminer une intervention déjà terminée ou annulée.');
            return;
        }
        setInterventionForStatusUpdate(intervention);
        setStatusToApply('Terminée');
        setShowStatusUpdateModal(true);
    };

    const handleCancelIntervention = (intervention) => {
        if (['Terminée', 'Annulée'].includes(intervention.status)) {
            setError('Impossible d\'annuler une intervention déjà terminée ou annulée.');
            return;
        }
        setInterventionForStatusUpdate(intervention);
        setStatusToApply('Annulée');
        setShowStatusUpdateModal(true);
    };

     // Fonction pour démarrer une intervention
    const handleStartIntervention = async (intervention) => {
        // if (intervention.status === 'En Cours' || intervention.status === 'Terminée' || intervention.status === 'Annulée') {
        //     setError('Cette intervention a déjà été commencée ou traitée.');
        //     return;
        // }
            const now = new Date();
const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19); // garde YYYY-MM-DDTHH:mm:ss

    const startDateIntervention = localISO;

        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            const updatedData = {
                status: 'En Cours',
                start_date_intervention: startDateIntervention
            };
            console.log("Starting intervention with data:", updatedData);

            await axios.put(`${API_INTERVENTIONS_URL}/${intervention.id}`, updatedData, { headers });
            
            // Mise à jour de la liste d'interventions locale
            setAllInterventions(prev => prev.map(item => 
                item.id === intervention.id 
                    ? { ...item, ...updatedData }
                    : item
            ));

            setError(null);
            console.log(`Intervention #${intervention.numero_demande} démarrée.`);
        } catch (err) {
            console.error("Erreur API START INTERVENTION:", err.response ? err.response.data : err.message);
            setError('Erreur lors du démarrage de l\'intervention: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
        }
    };


    const handleUpdateStatusWithDescription = async (interventionId, newStatus, solution, end_date) => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            const updatedData = {
                status: newStatus,
                solution: solution,
                end_date: newStatus === 'Terminée' ? (end_date || new Date().toISOString()) : null,
            };

            await axios.put(`${API_INTERVENTIONS_URL}/${interventionId}`, updatedData, { headers });
            
            // Mettre à jour l'intervention dans la liste locale
            setAllInterventions(prev => prev.map(intervention => 
                intervention.id === interventionId 
                    ? { ...intervention, ...updatedData }
                    : intervention
            ));

            handleCloseStatusUpdateModal();
            setError(null);
        } catch (err) {
            console.error("Erreur API UPDATE STATUS:", err.response ? err.response.data : err.message);
            setError('Erreur lors de la mise à jour du statut: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
        }
    };

    const handleCloseStatusUpdateModal = () => {
        setShowStatusUpdateModal(false);
        setInterventionForStatusUpdate(null);
        setStatusToApply('');
        setError(null);
    };

    // Gestionnaires de filtres avec réinitialisation de page
    const handlePriorityChange = (e) => {
        setFilterPriority(e.target.value);
        handleFilterChange();
    };

    const handleTypeChange = (e) => {
        setFilterInterventionType(e.target.value);
        handleFilterChange();
    };

    const handleStatusChange = (e) => {
        setFilterStatus(e.target.value);
        handleFilterChange();
    };
    
    if (loading) {
        return (
            <div className="management-page-container loading-overlay">
                <FiLoader className="loading-spinner-icon" />
                <p>Chargement de vos interventions...</p>
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

    return (
        <div className="management-page-container">
            <div className="management-header">
                <h2>Mes Interventions</h2>
                <div className="header-stats">
                    <span className="stat-item">
                        {totalFilteredCount} intervention{totalFilteredCount > 1 ? 's' : ''} 
                        {filterStatus === 'active' ? ' en cours/attente' : filterStatus === 'completed' ? ' terminée(s)' : ''}
                    </span>
                    <span className="stat-item">
                        Total: {allInterventions.length}
                    </span>
                </div>
            </div>
            <div className="interventions-grid">
                {paginatedInterventions.length > 0 ? (
                    paginatedInterventions.map((intervention) => (
                        <InterventionCard
                            key={intervention.id}
                            intervention={intervention}
                            onFinish={handleFinishIntervention}
                            onCancel={handleCancelIntervention}
                            onViewDetails={handleViewDetails}
                            onStart={handleStartIntervention}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <FiClock className="empty-icon" />
                        <h3>Aucune intervention trouvée</h3>
                        <p>
                            {filterPriority !== 'all' || filterInterventionType !== 'all' || filterStatus !== 'active'
                                ? 'Aucune intervention trouvée avec les critères actuels.'
                                : 'Vous n\'avez actuellement aucune intervention assignée.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Contrôles de pagination */}
            {totalFilteredCount > 0 && (
                <div className="pagination-controls">
                    <div className="items-per-page">
                        <label htmlFor="perPage">Interventions par page:</label>
                        <select id="perPage" value={interventionsPerPage} onChange={handleInterventionsPerPageChange}>
                            <option value={6}>6</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={48}>48</option>
                        </select>
                    </div>
                    <div className="page-navigation">
                        <button
                            type="button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            Précédent
                        </button>
                        <span className="page-info">
                            Page {currentPage} sur {totalPages} ({totalFilteredCount} interventions affichées)
                        </span>
                        <button
                            type="button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}

            {/* Modale de mise à jour de statut */}
            {showStatusUpdateModal && interventionForStatusUpdate && (
                <StatusUpdateModal
                    intervention={interventionForStatusUpdate}
                    currentStatus={interventionForStatusUpdate.status}
                    statusToApply={statusToApply}
                    onSave={handleUpdateStatusWithDescription}
                    onClose={handleCloseStatusUpdateModal}
                    ref={updateRef}
                />
            )}

            {/* Modale de détails */}
            {selectedIntervention && (
                <InterventionDetailModal
                    intervention={selectedIntervention}
                    currentUserRole={currentUserRole}
                    onClose={handleCloseDetails}
                    ref={detailRef}
                />
            )}
        </div>
    );
};

export default TechnicianInterventionsPage;