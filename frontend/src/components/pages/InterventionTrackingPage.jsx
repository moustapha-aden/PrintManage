// src/components/pages/InterventionTrackingPage.js

import React, { useState, useEffect, useMemo, useCallback,useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
    FiSearch,
    FiPlusCircle,
    FiLoader,
    FiAlertCircle // Ajout de FiAlertCircle pour les messages d'erreur
} from 'react-icons/fi';
import '../styles/ManagementPage.css'; // Assurez-vous que ce fichier contient les styles pour les loaders et alertes
import '../styles/TableDisplay.css'; // Pour les styles de tableau

import AddInterventionForm from '../forms/AddInterventionForm';
import InterventionDetailModal from "../modals/InterventionDetailModal"
import StatusUpdateModal from '../modals/StatusUpdateModal';
import AssignInterventionModal from '../modals/AssignInterventionModal'
import ConfirmationModal from '../modals/ConfirmationModal';
import InterventionTableRow from '../modals/InterventionTableRow'
import { API_BASE_URL } from '../../api';




/**
 * Confirmation Modal Component (Garder si vous l'utilisez ailleurs, sinon elle peut être retirée)
 * Ce composant est utilisé pour afficher une boîte de dialogue de confirmation au lieu de window.confirm.
 * @param {object} props - Component props.
 * @param {string} props.message - The message to display in the modal.
 * @param {function} props.onConfirm - Callback function when 'Confirm' is clicked.
 * @param {function} props.onCancel - Callback function when 'Cancel' is clicked.
 */

const InterventionTrackingPage = () => {
    const location = useLocation(); // Accédez à l'objet location

    // Initialisez les états des filtres avec les valeurs de location.state si elles existent
    const [interventions, setInterventions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingIntervention, setEditingIntervention] = useState(null);
    const [selectedIntervention, setSelectedIntervention] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const formRef=useRef(null);
    const confRef = useRef(null);
    const detailRef = useRef(null);
    const AssiRef = useRef(null);
    const updateRef=useRef(null);

    // Initialisation des filtres à partir de location.state
    const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
    const [filterStatus, setFilterStatus] = useState(location.state?.filterStatus || 'all');
    const [filterPriority, setFilterPriority] = useState(location.state?.filterPriority || 'all');
    const [filterInterventionType, setFilterInterventionType] = useState(location.state?.filterInterventionType || 'all');

    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [interventionForStatusUpdate, setInterventionForStatusUpdate] = useState(null);
    const [statusToApply, setStatusToApply] = useState('');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmPayload, setConfirmPayload] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [interventionToAssign, setInterventionToAssign] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [interventionsPerPage, setInterventionsPerPage] = useState(10); // Nombre d'interventions par page par défaut
    const [totalInterventionsCount, setTotalInterventionsCount] = useState(0); // Total d'interventions (vient du backend)
    const [lastPage, setLastPage] = useState(1); // Dernière page (vient du backend)
    

    const currentUserRole = localStorage.getItem('userRole');
    const currentUserId = localStorage.getItem('userId');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
      // Charger le dark mode au montage
    useEffect(() => {
        const storedTheme = localStorage.getItem('isDarkMode');
        setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
    }, []);

    const API_INTERVENTIONS_URL = `${API_BASE_URL}/interventions`;

    // Dans InterventionTrackingPage.js, après vos autres `handle` fonctions
const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
}, []);

const handleInterventionsPerPageChange = useCallback((e) => {
    setInterventionsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Réinitialiser à la première page lors du changement du nombre d'éléments par page
}, []);

    const fetchInterventions = useCallback(async (
        statusFilterParam,
        priorityFilterParam,
        interventionTypeFilterParam,
        searchTermParam
    ) => {
        setLoading(true); // Active le loader au début de la requête
        setError(null); // Réinitialise l'erreur avant chaque nouvelle requête
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

            // Paramètre pour inclure les relations nécessaires
            const relations = [
                'client.company',
                'client.department',
                'printer.company',
                'printer.department',
                'technician'
            ].join(',');
            queryParams.push(`with=${relations}`);

            // Filtres spécifiques au rôle de l'utilisateur
            if (currentUserRole === 'technicien' && currentUserId) {
                queryParams.push(`current_user_id=${currentUserId}`);
            } else if (currentUserRole === 'client' && currentUserId) {
                queryParams.push(`client_id=${currentUserId}`);
            }

            // Ajout des paramètres de filtre passés en arguments
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

            // AJOUT DES PARAMÈTRES DE PAGINATION
            queryParams.push(`page=${currentPage}`); // Utilise l'état actuel de la page
            queryParams.push(`per_page=${interventionsPerPage}`); // Utilise le nombre d'éléments par page
            // FIN AJOUT DES PARAMÈTRES DE PAGINATION

            // Construction de l'URL finale avec les paramètres
            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            console.log("Fetching interventions from URL:", url); // Pour le débogage
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // GESTION ROBUSTE DE LA RÉPONSE API POUR LA PAGINATION
            let interventionsData = [];
            let totalCount = 0;
            let finalLastPage = 1;

            if (response.data) {
                if (Array.isArray(response.data.data)) { // Format Laravel paginate (avec 'data' imbriqué)
                    interventionsData = response.data.data;
                    totalCount = response.data.total || interventionsData.length;
                    finalLastPage = response.data.last_page || 1;
                } else if (Array.isArray(response.data)) { // Format tableau simple (sans pagination côté serveur)
                    interventionsData = response.data;
                    totalCount = interventionsData.length;
                    finalLastPage = 1; // Pas de pagination, donc une seule page
                }
            }
            
            setInterventions(interventionsData);
            setTotalInterventionsCount(totalCount);
            setLastPage(finalLastPage);
            console.log("Interventions fetched successfully:", response.data); // Pour le débogage
        } catch (err) {
            setError('Erreur lors du chargement des interventions.');
            console.error("Erreur API interventions:", err.response ? err.response.data : err.message);
            setInterventions([]); // S'assurer que les interventions sont vides en cas d'erreur
            setTotalInterventionsCount(0);
            setLastPage(1);
        } finally {
            setLoading(false); // Désactive le loader une fois la requête terminée
        }
    }, [API_INTERVENTIONS_URL, currentUserRole, currentUserId, currentPage, interventionsPerPage]); // Dépendances pour useCallback

    // Ce useEffect déclenchera le fetch initial et les fetches suite aux changements de filtres
    useEffect(() => {
        const loadData = async () => {
            setLoading(true); // Active le loader
            setError(null); // Réinitialise l'erreur au début du chargement

            if (['technicien', 'client'].includes(currentUserRole) && !currentUserId) {
                setError("ID utilisateur non trouvé. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }
            // Utilisez les états de filtre actuels (qui sont initialisés par location.state ou par défaut)
            await fetchInterventions(filterStatus, filterPriority, filterInterventionType, searchTerm);
        };
        loadData();
    }, [fetchInterventions, filterStatus, filterPriority, filterInterventionType, searchTerm, currentUserRole, currentUserId, location.state,currentPage, interventionsPerPage]); // Ajout de location.state pour déclencher si les props changent via navigation

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
    } else if (showConfirmModal) {
        scrollToElement(confRef);
    } else if (selectedIntervention) {
        scrollToElement(detailRef);
    } else if (showAssignModal) {
        scrollToElement(AssiRef);
    } else if (showStatusUpdateModal) {
        scrollToElement(updateRef);
    }
}, [showForm, showConfirmModal, selectedIntervention, showAssignModal, showStatusUpdateModal]);


    // Logique de filtrage côté client (si nécessaire, sinon l'API gère déjà)
    // Pour l'instant, le filtrage est principalement géré côté API via fetchInterventions.
    // Ce useMemo est conservé au cas où un filtrage additionnel côté client serait nécessaire
    // ou si l'API ne gère pas tous les filtres.
    const filteredInterventions = useMemo(() => {
        return interventions;
    }, [interventions]);


    const handleOpenAddForm = () => {
        setEditingIntervention(null);
        setShowForm(true);
        setError(null); // Clear error on opening form
    };
      // Nouvelle fonction pour gérer l'édition
    const handleEditIntervention = (intervention) => {
        setEditingIntervention(intervention);
        setShowForm(true);
    };

    const handleViewDetails = (intervention) => {
        console.log("handleViewDetails called with intervention:", intervention);
        setSelectedIntervention(intervention);
    };

    const handleCloseDetails = () => {
        console.log("handleCloseDetails called.");
        setSelectedIntervention(null);
    };
const handleStartIntervention = async (intervention) => {
        // if (intervention.status === 'En Cours' || intervention.status === 'Terminée' || intervention.status === 'Annulée') {
        //     setError('Cette intervention a déjà été commencée ou traitée.');
        //     return;
        // }
            const now = new Date();
            const id_technicien = localStorage.getItem('userId');
            const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19); // garde YYYY-MM-DDTHH:mm:ss

    const startDateIntervention = localISO;
    const date_previsionnelle = new Date(now.getTime() +1 * 60 * 1000).toISOString().slice(0, 19); // Ajoute 2 heures

        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            const updatedData = {
                technician_id: id_technicien, // Assigne le technicien actuel
                date_previsionnelle:startDateIntervention, // Optionnel : définir une date prévisionnelle si nécessaire
                status: 'En Cours',
                start_date_intervention: startDateIntervention
            };
            console.log("Starting intervention with data:", id_technicien);

            await axios.put(`${API_INTERVENTIONS_URL}/${intervention.id}`, updatedData, { headers });
            
            // Mise à jour de la liste d'interventions locale
            setInterventions(prev => prev.map(item => 
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

    const handleSaveIntervention = async (interventionData) => {
        try {
            const token = localStorage.getItem('authToken');
            
            // CORRECTION CRITIQUE : Headers différents selon le type de données
            let headers;
            let url = API_INTERVENTIONS_URL;
            let method = 'post';
            
            if (interventionData instanceof FormData) {
                // Pour FormData (upload de fichier), NE PAS définir Content-Type
                // Axios le définira automatiquement à 'multipart/form-data' avec boundary
                headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                };
                
                console.log('Envoi de FormData avec headers:', headers);
                
                // Si c'est une édition, utilisez PUT avec _method
                if (editingIntervention) {
                    interventionData.append('_method', 'PUT');
                    url = `${API_INTERVENTIONS_URL}/${editingIntervention.id}`;
                    // Gardez method = 'post' car Laravel gère _method dans FormData
                }
            } else {
                // Pour JSON normal (sans fichier)
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                };
                
                if (editingIntervention) {
                    method = 'put';
                    url = `${API_INTERVENTIONS_URL}/${editingIntervention.id}`;
                }
            }

            console.log('URL finale:', url);
            console.log('Méthode:', method);
            console.log('Type de données:', interventionData instanceof FormData ? 'FormData' : 'JSON');

            const response = await axios({
                method: method,
                url: url,
                data: interventionData,
                headers: headers
            });

            console.log('Réponse API:', response.data);

            // Re-fetch toutes les données après sauvegarde
            await fetchInterventions(filterStatus, filterPriority, filterInterventionType, searchTerm);
            setShowForm(false);
            setEditingIntervention(null);
            setError(null);
            
        } catch (err) {
            console.error("Erreur API SAVE:", err.response ? err.response.data : err.message);
            
            // Log détaillé pour debug
            if (err.response) {
                console.error('Status:', err.response.status);
                console.error('Headers de la réponse:', err.response.headers);
                console.error('Data de la réponse:', err.response.data);
            }
            
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

    const handleUpdateStatusWithDescription = async (interventionId, newStatus, solution, end_date, technicianId = null) => {
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
                solution: solution, // Assurez-vous que le backend gère ce champ pour la mise à jour de statut
                end_date: newStatus === 'Terminée' ? (end_date || new Date().toISOString()) : null
            };

            // S'assurer que les IDs des relations sont envoyés et non les objets complets
            updatedData.client_id = updatedData.client?.id || updatedData.client_id;
            updatedData.printer_id = updatedData.printer?.id || updatedData.printer_id;
            updatedData.technician_id = updatedData.technician?.id || updatedData.technician_id;

            // Supprimer les objets de relations pour éviter les erreurs de validation côté Laravel
            delete updatedData.client;
            delete updatedData.printer;
            delete updatedData.technician;
            delete updatedData.company; // Si ces champs existent sur l'objet intervention
            delete updatedData.department; // Si ces champs existent sur l'objet intervention
            delete updatedData.created_at;
            delete updatedData.updated_at;

            await axios.put(`${API_INTERVENTIONS_URL}/${interventionId}`, updatedData, { headers });

            await fetchInterventions(filterStatus, filterPriority, filterInterventionType, searchTerm);
            handleCloseStatusUpdateModal();
            setError(null); // Efface l'erreur en cas de succès
        } catch (err) {
            console.error("Erreur API UPDATE STATUS:", err.response ? err.response.data : err.message);
            setError('Erreur lors de la mise à jour du statut: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
        }
    };

    const handleCloseStatusUpdateModal = () => {
        setShowStatusUpdateModal(false);
        setInterventionForStatusUpdate(null);
        setStatusToApply('');
        setError(null); // Clear error on closing modal
    };


    const handleCloseForm = () => {
        setShowForm(false);
        setEditingIntervention(null);
        setError(null);
    };

    const handleOpenAssignModal = (intervention) => {
        if (intervention.status === 'Terminée' || intervention.status === 'Annulée') {
            setError('Impossible d\'assigner une intervention terminée ou annulée.');
            return;
        }
        setInterventionToAssign(intervention);
        setShowAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        setInterventionToAssign(null);
        setShowAssignModal(false);
        setError(null);
    };

    const handleAssignIntervention = async (interventionId, technicianId, provisionalDate) => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            // Récupérer l'intervention actuelle pour ne modifier que les champs nécessaires
            const currentInterventionResponse = await axios.get(`${API_INTERVENTIONS_URL}/${interventionId}`, { headers });
            const currentInterventionData = currentInterventionResponse.data;

            const updatedData = {
                ...currentInterventionData,
                technician_id: technicianId,
                date_previsionnelle: provisionalDate,
                status: 'En Cours', // Le statut passe à "En Cours" lors de l'assignation
            };

            // S'assurer que les IDs des relations sont envoyés et non les objets complets
            updatedData.client_id = updatedData.client?.id || updatedData.client_id;
            updatedData.printer_id = updatedData.printer?.id || updatedData.printer_id;
            // technician_id est déjà défini par le formulaire

            // Supprimer les objets de relations pour éviter les erreurs de validation côté Laravel
            delete updatedData.client;
            delete updatedData.printer;
            delete updatedData.technician;
            delete updatedData.company; // Si ces champs existent sur l'objet intervention
            delete updatedData.department; // Si ces champs existent sur l'objet intervention
            delete updatedData.created_at;
            delete updatedData.updated_at;


            await axios.put(`${API_INTERVENTIONS_URL}/${interventionId}`, updatedData, { headers });
            await fetchInterventions(filterStatus, filterPriority, filterInterventionType, searchTerm);
            handleCloseAssignModal();
            setError(null); // Efface l'erreur en cas de succès
        } catch (err) {
            console.error("Erreur API ASSIGN:", err.response ? err.response.data : err.message);
            setError('Erreur lors de l\'assignation: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
        }
    };

    const handleConfirmAction = () => {
        if (confirmAction) {
            confirmAction(confirmPayload);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmPayload(null);
        setConfirmMessage('');
        setError(null); // Clear error on confirmation action
    };

    const handleCancelConfirmation = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmPayload(null);
        setConfirmMessage('');
        setError(null); // Clear error on cancel confirmation
    };


    const pageTitle = currentUserRole === 'technicien' ? 'Mon Historique' : 'Suivi des Interventions';
    const showClientColumn = currentUserRole === 'admin';


    if (loading) {
        return (
            <div style={cardStyle} className="management-page-container loading-overlay">
                <FiLoader className="loading-spinner-icon" />
                <p style={cardStyle}>Chargement des interventions...</p>
            </div>
        );
    }

    // Affichage des messages d'erreur si une erreur est présente
    if (error) {
        return (
            <div className="management-page-container alert alert-error">
                <FiAlertCircle className="alert-icon" />
                <p>Erreur: {error}</p>
            </div>
        );
    }

    return (
        <div className="management-page-container" style={cardStyle}>
            <div className="management-header" style={cardStyle}>
                <h2 style={cardStyle}>{pageTitle}</h2>
                {currentUserRole === 'client' || currentUserRole==='admin' && (
                    <button type="button" className="new-button" onClick={handleOpenAddForm}>
                        <FiPlusCircle /> Nouvelle Intervention
                    </button>
                )}
            </div>

            <div className="filter-bar" style={cardStyle}>
                <div className="search-input" style={cardStyle}>
                    <FiSearch />
                    <input
                        style={cardStyle}
                        type="text"
                        placeholder="Rechercher par n°, imprimante, client, technicien..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    style={cardStyle}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option style={cardStyle} value="all">Tous les Statuts</option>
                    <option style={cardStyle} value="En Attente">En Attente</option>
                    <option style={cardStyle} value="En Cours">En Cours</option>
                    <option style={cardStyle} value="Terminée">Terminée</option>
                    <option style={cardStyle} value="Annulée">Annulée</option>
                </select>
                <select
                    style={cardStyle}
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option style={cardStyle} value="all">Toutes les Priorités</option>
                    <option style={cardStyle} value="Haute">Haute</option>
                    <option style={cardStyle} value="Moyenne">Moyenne</option>
                    <option style={cardStyle} value="Basse">Basse</option>
                    <option style={cardStyle} value="Faible">Faible</option>
                    <option style={cardStyle} value="Urgent">Urgent</option>
                </select>
                <select
                style={cardStyle}
                    value={filterInterventionType}
                    onChange={(e) => setFilterInterventionType(e.target.value)}
                >
                    <option style={cardStyle} value="all">Tous les Types</option>
                    <option style={cardStyle} value="Maintenance Préventive">Maintenance Préventive</option>
                    <option style={cardStyle} value="Maintenance Corrective">Maintenance Corrective</option>
                    <option style={cardStyle} value="Installation">Installation</option>
                    <option style={cardStyle} value="Désinstallation">Désinstallation</option>
                    <option style={cardStyle} value="Telephonique">Téléphonique</option>
                    <option style={cardStyle} value="Audit">Audit</option>

                </select>
            </div>

            <div className="table-responsive" style={cardStyle}>
                <table className="data-table" style={cardStyle}>
                    <thead>
                        <tr>
                            <th>N° Demande</th>
                            <th>Imprimante</th>
                            {showClientColumn && (
                                <>
                                    <th>Client</th>
                                    <th>Société</th>
                                    <th>Département</th>
                                </>
                            )}
                            <th>Technicien</th>
                            <th>Type</th>
                            <th>Statut</th>
                            <th>Date Début</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInterventions.length > 0 ? (
                            filteredInterventions.map((intervention) => (
                                <InterventionTableRow
                                    key={intervention.id}
                                    intervention={intervention}
                                    onFinish={handleFinishIntervention}
                                    onCancel={handleCancelIntervention}
                                    onViewDetails={handleViewDetails}
                                    onAssign={handleOpenAssignModal}
                                    onStart={handleStartIntervention}
                                    onEdit={handleEditIntervention}
                                    currentUserRole={currentUserRole}
                                    currentUserId={currentUserId}
                                    showClientColumn={showClientColumn} // Passez cette prop à la ligne du tableau
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={showClientColumn ? 9 : 7} style={{ textAlign: 'center',cardStyle }}>
                                    Aucune intervention trouvée avec les critères actuels.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                 {/* NOUVEAUX CONTRÔLES DE PAGINATION */}
                {interventions.length > 0 && totalInterventionsCount > 0 && ( // Afficher les contrôles seulement s'il y a des interventions
                    <div className="pagination-controls" style={cardStyle}>
                        <div className="items-per-page" style={cardStyle}>
                            <label htmlFor="perPage" style={cardStyle}>Interventions par page:</label>
                            <select id="perPage" value={interventionsPerPage} onChange={handleInterventionsPerPageChange} style={cardStyle}>
                                <option style={cardStyle} value={5}>5</option>
                                <option style={cardStyle} value={10}>10</option>
                                <option style={cardStyle} value={20}>20</option>
                                <option style={cardStyle} value={50}>50</option>
                            </select>
                        </div>
                        <div className="page-navigation" style={cardStyle}>
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-button"
                            >
                                Précédent
                            </button>
                            <span className="page-info" style={cardStyle}>
                                Page {currentPage} sur {lastPage} ({totalInterventionsCount} interventions)
                            </span>
                            <button
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
                    interventionToEdit={editingIntervention}
                    onSave={handleSaveIntervention}
                    onCloseForm={handleCloseForm}
                    setError={setError} // Pass setError to the form
                    ref={formRef}
                    style={cardStyle}
                />
            )}

            {showStatusUpdateModal && interventionForStatusUpdate && (
                <StatusUpdateModal
                    intervention={interventionForStatusUpdate}
                    currentStatus={interventionForStatusUpdate.status}
                    statusToApply={statusToApply}
                    onSave={handleUpdateStatusWithDescription}
                    onClose={handleCloseStatusUpdateModal}
                    setError={setError}
                    ref={updateRef}
                    style={cardStyle}
                />
            )}

            {showAssignModal && interventionToAssign && (
                <AssignInterventionModal
                    intervention={interventionToAssign}
                    onAssign={handleAssignIntervention}
                    onClose={handleCloseAssignModal}
                    setError={setError}
                    ref={AssiRef}
                    style={cardStyle}
                />
            )}

            {selectedIntervention && (
                <InterventionDetailModal
                    intervention={selectedIntervention}
                    currentUserRole={currentUserRole}
                    onClose={handleCloseDetails}
                    ref={detailRef}
                    style={cardStyle}
                />
            )}

            {showConfirmModal && (
                <ConfirmationModal
                    message={confirmMessage}
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelConfirmation}
                    ref={confRef}
                    style={cardStyle}
                />
            )}
        </div>
    );
};

export default InterventionTrackingPage;