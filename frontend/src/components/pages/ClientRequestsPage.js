// src/components/pages/InterventionTrackingPage.js

import React, { useState,useRef, useEffect, useMemo, useCallback,forwardRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
    FiSearch,
    FiPlusCircle,
    FiX,
    FiCheckCircle,
    FiSlash,
    FiEye,
    FiUserCheck,
    FiAlertCircle
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';

import AddInterventionForm from '../forms/AddInterventionForm';
import StatusUpdateModal from '../modals/StatusUpdateModal';

import { API_BASE_URL } from '../../api';
import InterventionTableRow from '../modals/InterventionTableRow';
import InterventionDetailModal from '../modals/InterventionDetailModal';

const InterventionTrackingPage = () => {
    const location = useLocation();

    const [interventions, setInterventions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingIntervention, setEditingIntervention] = useState(null);
    const [selectedIntervention, setSelectedIntervention] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
    const [filterStatus, setFilterStatus] = useState(location.state?.filterStatus || 'all');
    const [filterPriority, setFilterPriority] = useState(location.state?.filterPriority || 'all');
    const [filterInterventionType, setFilterInterventionType] = useState(location.state?.filterInterventionType || 'all');

    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [interventionForStatusUpdate, setInterventionForStatusUpdate] = useState(null);
    const [statusToApply, setStatusToApply] = useState('');


    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmPayload, setConfirmPayload] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [interventionsPerPage, setInterventionsPerPage] = useState(10);
    const [totalInterventionsCount, setTotalInterventionsCount] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    

    const currentUserRole = localStorage.getItem('userRole');
    const currentUserId = localStorage.getItem('userId');

    const formRef=useRef(null);
    const detailRef = useRef(null);
    const updateRef=useRef(null);
    
    const [isDarkMode, setIsDarkMode] = useState(false);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
        // Charger le dark mode au montage
        useEffect(() => {
            const storedTheme = localStorage.getItem('isDarkMode');
            setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
        }, []);

    const API_INTERVENTIONS_URL = `${API_BASE_URL}/interventions`;

const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
}, []);

const handleInterventionsPerPageChange = useCallback((e) => {
    setInterventionsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
}, []);

    const fetchInterventions = useCallback(async (
        statusFilterParam,
        priorityFilterParam,
        interventionTypeFilterParam,
        searchTermParam
    ) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                setInterventions([]);
                setLoading(false);
                return;
            }

            let url = API_INTERVENTIONS_URL;
            const queryParams = [];

            const relations = [
                'client.company',
                'client.department',
                'printer.company',
                'printer.department',
                'technician'
            ].join(',');
            queryParams.push(`with=${relations}`);

            if (currentUserRole === 'technicien' && currentUserId) {
                queryParams.push(`current_user_id=${currentUserId}`);
            } else if (currentUserRole === 'client' && currentUserId) {
                queryParams.push(`client_id=${currentUserId}`);
            }

            if (statusFilterParam && statusFilterParam !== 'all') {
                queryParams.push(`status_filter=${statusFilterParam}`);
            }
            if (priorityFilterParam && priorityFilterParam !== 'all') {
                queryParams.push(`priority_filter=${priorityFilterParam}`);
            }
            if (interventionTypeFilterParam && interventionTypeFilterParam !== 'all') {
                queryParams.push(`intervention_type_filter=${interventionTypeFilterParam}`);
            }
            if (searchTermParam && searchTermParam.trim() !== '') {
                queryParams.push(`search_term=${searchTermParam}`);
            }

            queryParams.push(`page=${currentPage}`);
            queryParams.push(`per_page=${interventionsPerPage}`);

            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            console.log("Fetching interventions from URL:", url);
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let interventionsData = [];
            let totalCount = 0;
            let finalLastPage = 1;

            if (response.data) {
                if (Array.isArray(response.data.data)) {
                    interventionsData = response.data.data;
                    totalCount = response.data.total || interventionsData.length;
                    finalLastPage = response.data.last_page || 1;
                } else if (Array.isArray(response.data)) {
                    interventionsData = response.data;
                    totalCount = interventionsData.length;
                    finalLastPage = 1;
                }
            }
            
            setInterventions(interventionsData);
            setTotalInterventionsCount(totalCount);
            setLastPage(finalLastPage);
            console.log("Interventions fetched successfully:", response.data);
        } catch (err) {
            setError('Erreur lors du chargement des interventions.');
            console.error("Erreur API interventions:", err.response ? err.response.data : err.message);
            setInterventions([]);
            setTotalInterventionsCount(0);
            setLastPage(1);
        } finally {
            setLoading(false);
        }
    }, [API_INTERVENTIONS_URL, currentUserRole, currentUserId, currentPage, interventionsPerPage]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            if (['technicien', 'client'].includes(currentUserRole) && !currentUserId) {
                setError("ID utilisateur non trouvé. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }
            await fetchInterventions(filterStatus, filterPriority, filterInterventionType, searchTerm);
        };
        loadData();
    }, [fetchInterventions, filterStatus, filterPriority, filterInterventionType, searchTerm, currentUserRole, currentUserId, location.state,currentPage, interventionsPerPage]);

    const filteredInterventions = useMemo(() => {
        return interventions;
    }, [interventions]);

const scrollToElement = (ref) => {
  if (ref.current) {
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
};

useEffect(() => {
    if (showForm) {
        scrollToElement(formRef);
    } else if (selectedIntervention) {
        scrollToElement(detailRef);
    } else if (showStatusUpdateModal) {
        scrollToElement(updateRef);
    }
}, [showForm, selectedIntervention, showStatusUpdateModal]);


    const handleOpenAddForm = () => {
        setEditingIntervention(null);
        setShowForm(true);
        setError(null);
    };

    const handleViewDetails = (intervention) => {
        console.log("handleViewDetails called with intervention:", intervention);
        setSelectedIntervention(intervention);
    };

    const handleCloseDetails = () => {
        console.log("handleCloseDetails called.");
        setSelectedIntervention(null);
    };

    const handleSaveIntervention = async (interventionFormData) => { // CHANGED: accept FormData here
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Accept': 'application/json',
                // 'Content-Type': 'application/json', // REMOVED: axios sets this for FormData
                'Authorization': `Bearer ${token}`,
            };

            // Use interventionFormData directly for POST request
            await axios.post(API_INTERVENTIONS_URL, interventionFormData, { headers });

            await fetchInterventions(filterStatus, filterPriority, filterInterventionType, searchTerm);
            setShowForm(false);
            setEditingIntervention(null);
            setError(null);
        } catch (err) {
            console.error("Erreur API SAVE:", err.response ? err.response.data : err.message);
            if (err.response && err.response.data && err.response.data.errors) {
                const errors = err.response.data.errors;
                let errorMessage = 'Erreurs de validation: \n';
                for (const field in errors) {
                    errorMessage += `- ${field}: ${errors[field].join(', ')}\n`;
                }
                setError(errorMessage);
            } else {
                setError('Erreur lors de la sauvegarde: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
            }
        }
    };

    const handleFinishIntervention = (intervention) => {
        if (intervention.status === 'Terminée' || intervention.status === 'Annulée') {
            setError('Impossible de terminer une intervention déjà terminée ou annulée.');
            return;
        }
        setInterventionForStatusUpdate(intervention);
        setStatusToApply('Terminée');
        setShowStatusUpdateModal(true);
    };

    const handleCancelIntervention = (intervention) => {
        if (intervention.status === 'Terminée' || intervention.status === 'Annulée') {
            setError('Impossible d\'annuler une intervention déjà terminée ou annulée.');
            return;
        }
        setInterventionForStatusUpdate(intervention);
        setStatusToApply('Annulée');
        setShowStatusUpdateModal(true);
    };

    const handleUpdateStatusWithDescription = async (interventionId, newStatus, description, end_date, technicianId = null) => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            const relationsToFetch = [
                'client.company',
                'client.department',
                'printer.company',
                'printer.department',
                'technician'
            ].join(',');
            const currentInterventionResponse = await axios.get(`${API_INTERVENTIONS_URL}/${interventionId}?with=${relationsToFetch}`, { headers });
            const currentInterventionData = currentInterventionResponse.data;

            if (currentInterventionData.status === 'Terminée' || currentInterventionData.status === 'Annulée') {
                setError('Impossible de modifier le statut d\'une intervention terminée ou annulée.');
                handleCloseStatusUpdateModal();
                return;
            }

            const updatedData = {
                ...currentInterventionData,
                status: newStatus,
                description: description,
                end_date: newStatus === 'Terminée' ? (end_date || new Date().toISOString()) : null
            };

            updatedData.client_id = updatedData.client?.id || updatedData.client_id;
            updatedData.printer_id = updatedData.printer?.id || updatedData.printer_id;
            updatedData.technician_id = updatedData.technician?.id || updatedData.technician_id;

            delete updatedData.client;
            delete updatedData.printer;
            delete updatedData.technician;
            delete updatedData.company;
            delete updatedData.department;
            delete updatedData.created_at;
            delete updatedData.updated_at;

            await axios.put(`${API_INTERVENTIONS_URL}/${interventionId}`, updatedData, { headers });

            await fetchInterventions(filterStatus, filterPriority, filterInterventionType, searchTerm);
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


    const handleCloseForm = () => {
        setShowForm(false);
        setEditingIntervention(null);
        setError(null);
    };





    const pageTitle = currentUserRole === 'technicien' ? 'Mes Interventions' : 'Suivi des Interventions';
    const showClientColumn = currentUserRole === 'admin';


    if (error) {
        return (
            <div className="management-page-container alert alert-error">
                <FiAlertCircle className="alert-icon" />
                <p>Erreur: {error}</p>
            </div>
        );
    }

    return (
        <div className="management-page-container" style={{cardStyle }}>
            <div className="management-header" style={{cardStyle }}>
                <h2 >{pageTitle}</h2>
                {currentUserRole == 'client'  && (
                    <button type="button" className="new-button" onClick={handleOpenAddForm}>
                        <FiPlusCircle /> Nouvelle Intervention
                    </button>
                )}
            </div>

            <div className="filter-bar" style={{cardStyle }}>
                <div className="search-input" style={{cardStyle }}>
                    <FiSearch />
                    <input
                        style={{cardStyle }}
                        type="text"
                        placeholder="Rechercher par n°, imprimante, client, technicien..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    style={{cardStyle }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option style={{cardStyle }} value="all">Tous les Statuts</option>
                    <option style={{cardStyle }} value="En Attente">En Attente</option>
                    <option style={{cardStyle }} value="En Cours">En Cours</option>
                    <option style={{cardStyle }} value="Terminée">Terminée</option>
                    <option style={{cardStyle }} value="Annulée">Annulée</option>
                </select>
                <select
                    style={{cardStyle }}
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option style={{cardStyle }} value="all">Toutes les Priorités</option>
                    <option style={{cardStyle }}  value="Haute">Haute</option>
                    <option style={{cardStyle }}  value="Moyenne">Moyenne</option>
                    <option style={{cardStyle }}  value="Basse">Basse</option>
                    <option style={{cardStyle }}  value="Faible">Faible</option>
                    <option style={{cardStyle }}  value="Urgent">Urgent</option>
                </select>
                <select
                    style={{cardStyle }}
                    value={filterInterventionType}
                    onChange={(e) => setFilterInterventionType(e.target.value)}
                >
                    <option style={{cardStyle }} value="all">Tous les Types</option>
                    <option style={{cardStyle }} value="Maintenance Préventive">Maintenance Préventive</option>
                    <option style={{cardStyle }} value="Maintenance Corrective">Maintenance Corrective</option>
                    <option style={{cardStyle }} value="Installation">Installation</option>
                    <option style={{cardStyle }} value="Désinstallation">Désinstallation</option>
                    <option style={{cardStyle }} value="Audit">Audit</option>
                </select>
            </div>

            <div className="table-responsive" style={cardStyle}>
                <table className="data-table" style={cardStyle}>
                    <thead style={cardStyle}>
                        <tr style={cardStyle}>
                            <th style={cardStyle}>N° Demande</th>
                            <th style={cardStyle}>Imprimante</th>
                            <th style={{cardStyle }}>Technicien</th>
                            <th style={{cardStyle }}>Type</th>
                            <th style={{cardStyle }}>Statut</th>
                            <th style={{cardStyle }}>Date Début</th>
                            <th style={{cardStyle }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInterventions.length > 0 ? (
                            filteredInterventions.map((intervention) => (
                                <InterventionTableRow
                                    style={cardStyle}
                                    key={intervention.id}
                                    intervention={intervention}
                                    onFinish={handleFinishIntervention}
                                    onCancel={handleCancelIntervention}
                                    onViewDetails={handleViewDetails}
                                    currentUserRole={currentUserRole}
                                    currentUserId={currentUserId}
                                    showClientColumn={showClientColumn}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={showClientColumn ? 9 : 7} style={{ textAlign: 'center', ...cardStyle }} >
                                    Aucune intervention trouvée avec les critères actuels.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {interventions.length > 0 && totalInterventionsCount > 0 && (
                    <div className="pagination-controls" style={{cardStyle }}>
                        <div className="items-per-page" style={{cardStyle }}>
                            <label htmlFor="perPage">Interventions par page:</label>
                            <select id="perPage" value={interventionsPerPage} onChange={handleInterventionsPerPageChange}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="page-navigation" style={{cardStyle }}>
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-button"
                                style={{cardStyle }}
                            >
                                Précédent
                            </button>
                            <span className="page-info">
                                Page {currentPage} sur {lastPage} ({totalInterventionsCount} interventions)
                            </span>
                            <button
                                style={{cardStyle}}
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className="pagination-button"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <AddInterventionForm
                    style={cardStyle}
                    interventionToEdit={editingIntervention}
                    currentUserRole={currentUserRole}
                    currentUserId={currentUserId}
                    onSave={handleSaveIntervention}
                    onCloseForm={handleCloseForm}
                    setError={setError}
                    ref={formRef}
                />
            )}

            {showStatusUpdateModal && interventionForStatusUpdate && (
                <StatusUpdateModal
                    style={cardStyle}
                    intervention={interventionForStatusUpdate}
                    currentStatus={interventionForStatusUpdate.status}
                    statusToApply={statusToApply}
                    onSave={handleUpdateStatusWithDescription}
                    onClose={handleCloseStatusUpdateModal}
                    setError={setError}
                    ref={updateRef}
                />
            )}

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

export default React.memo(InterventionTrackingPage);