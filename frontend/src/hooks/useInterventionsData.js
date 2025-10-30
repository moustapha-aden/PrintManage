// src/components/hooks/useInterventionsData.js

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Base de l'API, utilisée pour toutes les requêtes d'interventions
import { API_BASE_URL } from '../../api';
const API_INTERVENTIONS_URL = `${API_BASE_URL}/interventions`;

/**
 * Hook personnalisé pour la gestion des données, du filtrage et de la pagination des interventions.
 *
 * @param {object} initialFilters - Filtres initiaux pour la recherche.
 * @param {string} currentUserRole - Le rôle de l'utilisateur actuel ('admin', 'client', 'technicien').
 * @param {string} currentUserId - L'ID de l'utilisateur actuel.
 * @returns {object} Un objet contenant l'état (données, chargement, erreur) et les fonctions de manipulation.
 */
const useInterventionsData = (initialFilters, currentUserRole, currentUserId) => {
    // S'assure que initialFilters est toujours un objet, même s'il est null
    const filters = initialFilters ?? {};

    // 1. Déclaration des états principaux
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Déclaration des états pour les filtres et la pagination
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
    const [filterStatus, setFilterStatus] = useState(filters.filterStatus || 'all');
    const [filterPriority, setFilterPriority] = useState(filters.filterPriority || 'all');
    const [filterInterventionType, setFilterInterventionType] = useState(filters.filterInterventionType || 'all');

    const [currentPage, setCurrentPage] = useState(filters.currentPage || 1);
    const [interventionsPerPage, setInterventionsPerPage] = useState(filters.interventionsPerPage || 10);
    const [totalInterventionsCount, setTotalInterventionsCount] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    // 3. Fonction pour récupérer les données de l'API. Utilisation de useCallback pour mémoïser la fonction.
    // Cette fonction ne sera recréée que si ses dépendances changent, ce qui est crucial pour useEffect.
    const fetchInterventions = useCallback(async () => {
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

            // Construction de l'URL de l'API avec les paramètres de requête
            let url = API_INTERVENTIONS_URL;
            const queryParams = [];

            // Spécification des relations à inclure dans la réponse de l'API
            const relations = [
                'client.company', 'client.department',
                'printer.company', 'printer.department',
                'technician'
            ].join(',');
            queryParams.push(`with=${relations}`);

            // Ajout des filtres spécifiques au rôle de l'utilisateur
            if (currentUserRole === 'technicien' && currentUserId) {
                queryParams.push(`current_user_id=${currentUserId}`);
            } else if (currentUserRole === 'client' && currentUserId) {
                queryParams.push(`client_id=${currentUserId}`);
            }

            // Ajout des autres filtres basés sur l'état du composant
            if (filterStatus && filterStatus !== 'all') {
                queryParams.push(`status_filter=${filterStatus}`);
            }
            if (filterPriority && filterPriority !== 'all') {
                queryParams.push(`priority_filter=${filterPriority}`);
            }
            if (filterInterventionType && filterInterventionType !== 'all') {
                queryParams.push(`intervention_type_filter=${filterInterventionType}`);
            }
            if (searchTerm && searchTerm.trim() !== '') {
                queryParams.push(`search_term=${searchTerm}`);
            }

            // Ajout des paramètres de pagination
            queryParams.push(`page=${currentPage}`);
            queryParams.push(`per_page=${interventionsPerPage}`);

            // Assemblage de l'URL finale
            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            // Exécution de la requête API
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let interventionsData = [];
            let totalCount = 0;
            let finalLastPage = 1;

            // Traitement des différentes structures de réponse de l'API (avec ou sans pagination)
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

            // Mise à jour des états avec les données récupérées
            setInterventions(interventionsData);
            setTotalInterventionsCount(totalCount);
            setLastPage(finalLastPage);
        } catch (err) {
            // Gestion des erreurs
            setError('Erreur lors du chargement des interventions.');
            console.error("Erreur API interventions:", err.response ? err.response.data : err.message);
            setInterventions([]);
            setTotalInterventionsCount(0);
            setLastPage(1);
        } finally {
            // S'assure que l'état de chargement est toujours mis à jour
            setLoading(false);
        }
    }, [currentUserRole, currentUserId, filterStatus, filterPriority, filterInterventionType, searchTerm, currentPage, interventionsPerPage]);

    // 4. Exécution de la fonction de récupération des données au premier rendu et lors de tout changement de filtre ou de pagination.
    useEffect(() => {
        fetchInterventions();
    }, [fetchInterventions]);

    // Fonctions de gestion de la pagination, mémoïsées avec useCallback
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleInterventionsPerPageChange = useCallback((e) => {
        setInterventionsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1); // Retour à la première page lors du changement du nombre d'éléments par page
    }, []);

    // 5. Retourne l'état et les fonctions nécessaires aux composants qui utilisent ce hook.
    // La fonction fetchInterventions est renommée 'refreshInterventions' pour être plus explicite.
    return {
        interventions,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterPriority,
        setFilterPriority,
        filterInterventionType,
        setFilterInterventionType,
        currentPage,
        interventionsPerPage,
        totalInterventionsCount,
        lastPage,
        handlePageChange,
        handleInterventionsPerPageChange,
        refreshInterventions: fetchInterventions,
        setError // Permet à un composant parent de définir une erreur si une action échoue
    };
};

export default useInterventionsData;
