import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    FiSearch,
    FiPlusCircle,
    FiLoader,
    FiAlertCircle,
    FiChevronLeft,
    FiChevronRight
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import AddUserForm from '../forms/AddUserForm';
import ConfirmationModal from '../modals/ConfirmationModal';
import UserCard from '../modals/UserCard';
import { API_BASE_URL } from '../../api';
const UserManagementPage = () => {
    // === ÉTATS LOCAUX ===
    const [allUsers, setAllUsers] = useState([]); // Tableau complet des utilisateurs reçus de l'API
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY, setScrollY] = useState(0);

    // États pour la modale de confirmation
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmPayload, setConfirmPayload] = useState(null);

    // États pour la pagination côté client
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // L'état pour le nombre d'utilisateurs par page

    // Références pour le défilement
    const formRef = useRef(null);
    const confRef = useRef(null);
        const [isDarkMode, setIsDarkMode] = useState(false);
    
      // Charger le dark mode au montage
    useEffect(() => {
        const storedTheme = localStorage.getItem('isDarkMode');
        setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
    }, []);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
    const API_USERS_URL = `${API_BASE_URL}/users`;
    const API_COMPANIES_URL = `${API_BASE_URL}/companies`;
    const API_DEPARTMENTS_URL = `${API_BASE_URL}/departments`;

    const authToken = localStorage.getItem('authToken');

    // === FONCTIONS DE RÉCUPÉRATION DES DONNÉES ===
    const fetchUsers = useCallback(async () => {
        setError(null);
        try {
            if (!authToken) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                return [];
            }
            const response = await axios.get(`${API_USERS_URL}?with=company,department`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            const usersWithDisplayRole = response.data.map(user => ({
                ...user,
                statusDisplay: user.status === 'active' ? 'Actif' : 'Inactif',
                roleDisplay: user.role === 'client' ? 'Client' : (user.role === 'admin' ? 'Admin' : 'Technicien')
            }));
            setAllUsers(usersWithDisplayRole);
            return usersWithDisplayRole;
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs.');
            console.error("Erreur API utilisateurs:", err.response ? err.response.data : err.message);
            setAllUsers([]);
            throw err;
        }
    }, [authToken, API_USERS_URL]);

    const fetchCompanies = useCallback(async () => {
        try {
            if (!authToken) return [];
            const response = await axios.get(API_COMPANIES_URL, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setCompanies(response.data);
            return response.data;
        } catch (err) {
            setError(prev => prev ? prev + "\nErreur chargement sociétés." : "Erreur chargement sociétés.");
            console.error("Erreur API sociétés:", err.response ? err.response.data : err.message);
            setCompanies([]);
            throw err;
        }
    }, [authToken, API_COMPANIES_URL]);

    const fetchDepartments = useCallback(async () => {
        try {
            if (!authToken) return [];
            const response = await axios.get(API_DEPARTMENTS_URL, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setDepartments(response.data);
            return response.data;
        } catch (err) {
            setError(prev => prev ? prev + "\nErreur chargement départements." : "Erreur chargement départements.");
            console.error("Erreur API départements:", err.response ? err.response.data : err.message);
            setDepartments([]);
            throw err;
        }
    }, [authToken, API_DEPARTMENTS_URL]);

    // === LOGIQUE DE FILTRAGE ET DE PAGINATION CÔTÉ CLIENT ===
    const filteredAndPaginatedUsers = useMemo(() => {
        // 1. Filtrage
        const filtered = allUsers.filter(user => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const userCompanyName = (user.role === 'client' && user.company) ? (user.company.name || '').toLowerCase() : '';
            const userDepartmentName = (user.role === 'client' && user.department) ? (user.department.name || '').toLowerCase() : '';

            const matchesSearch = lowerCaseSearchTerm === '' ||
                (user.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (user.email || '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (user.roleDisplay || '').toLowerCase().includes(lowerCaseSearchTerm) ||
                userCompanyName.includes(lowerCaseSearchTerm) ||
                userDepartmentName.includes(lowerCaseSearchTerm);

            const matchesRole = filterRole === 'all' || user.role === filterRole;
            const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });

        // 2. Pagination
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

        return {
            paginatedUsers: currentItems,
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / itemsPerPage)
        };
    }, [allUsers, searchTerm, filterRole, filterStatus, currentPage, itemsPerPage]);

    // === EFFETS DE BORD (LIFECYCLE) ===
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            const [usersResult, companiesResult, departmentsResult] = await Promise.allSettled([
                fetchUsers(),
                fetchCompanies(),
                fetchDepartments()
            ]);

            if (usersResult.status === 'rejected') {
                setError(prev => prev ? prev + "\nErreur lors du chargement des utilisateurs." : "Erreur lors du chargement des utilisateurs.");
            }
            if (companiesResult.status === 'rejected') {
                setError(prev => prev ? prev + "\nErreur lors du chargement des sociétés." : "Erreur lors du chargement des sociétés.");
            }
            if (departmentsResult.status === 'rejected') {
                setError(prev => prev ? prev + "\nErreur lors du chargement des départements." : "Erreur lors du chargement des départements.");
            }

            setLoading(false);
        };
        loadData();
    }, [fetchUsers, fetchCompanies, fetchDepartments]);

    useEffect(() => {
        if (showForm && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [showForm]);

    useEffect(() => {
        if (showConfirmModal && confRef.current) {
            confRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [showConfirmModal]);

    // === GESTIONNAIRES D'ÉVÉNEMENTS ===
    const handleOpenAddForm = () => {
        setEditingUser(null);
        setShowForm(true);
        setError(null);
        setScrollY(window.scrollY);
    };

    const handleOpenEditForm = (user) => {
        setEditingUser(user);
        setShowForm(true);
        setError(null);
        setScrollY(window.scrollY);
    };

    const handleSaveUser = async (userData) => {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            if (editingUser) {
                await axios.put(`${API_USERS_URL}/${editingUser.id}`, userData, { headers });
            } else {
                await axios.post(API_USERS_URL, userData, { headers });
            }
            // Recharger toutes les données après une modification/un ajout
            await Promise.all([fetchUsers(), fetchCompanies(), fetchDepartments()]);
            setShowForm(false);
            setEditingUser(null);
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
    
    const handleDeleteUser = (userId) => {
        setConfirmMessage('Êtes-vous sûr de vouloir supprimer cet utilisateur ?');
        setConfirmPayload(userId);
        setConfirmAction(() => async (id) => {
            try {
                const headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                };
                await axios.delete(`${API_USERS_URL}/${id}`, { headers });
                // Recharger toutes les données après la suppression
                await Promise.all([fetchUsers(), fetchCompanies(), fetchDepartments()]);
                setError(null);
            } catch (err) {
                setError('Erreur lors de la suppression de l\'utilisateur.');
                console.error("Erreur API DELETE:", err.response ? err.response.data : err.message);
                setError('Erreur lors de la suppression: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
            }
        });
        setShowConfirmModal(true);
        setScrollY(window.scrollY);
    };

    const handleConfirmAction = () => {
        if (confirmAction && confirmPayload) {
            confirmAction(confirmPayload);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmPayload(null);
        setConfirmMessage('');
    };

    const handleCancelConfirmation = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmPayload(null);
        setConfirmMessage('');
        setError(null);
        setScrollY(window.scrollY);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingUser(null);
        setError(null);
    };

    // Fonctions de changement pour les filtres et la pagination
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Réinitialise la page lors de la recherche
    };
    
    const handleRoleChange = (e) => {
        setFilterRole(e.target.value);
        setCurrentPage(1); // Réinitialise la page lors du changement de filtre
    };

    const handleStatusChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1); // Réinitialise la page lors du changement de filtre
    };

    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= filteredAndPaginatedUsers.totalPages) {
            setCurrentPage(page);
        }
    }, [filteredAndPaginatedUsers.totalPages]);

    const handleItemsPerPageChange = useCallback((e) => {
        setItemsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1); // Réinitialise la page à 1 lors du changement de nombre d'éléments
    }, []);

    // === RENDU DU COMPOSANT ===
    if (loading) {
        return (
            <div style={cardStyle} className="management-page-container loading-overlay">
                <FiLoader className="loading-spinner-icon" />
                <p style={cardStyle}>Chargement des utilisateurs, sociétés et départements...</p>
            </div>
        );
    }

    if (error) {
        return (
            <p className="management-page-container alert alert-error">
                <FiAlertCircle className="alert-icon" />
                <span>Erreur: {error}</span>
            </p>
        );
    }
    
    return (
        <div className="management-page-container" style={cardStyle}>
            <div className="management-header" style={cardStyle}>
                <h2 >Gestion des Utilisateurs</h2>
                <button className="new-button" onClick={handleOpenAddForm}>
                    <FiPlusCircle /> Nouvel Utilisateur
                </button>
            </div>

            <div className="filter-bar" style={cardStyle}>
                <div className="search-input" style={cardStyle}>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email..."
                        value={searchTerm}
                        style={cardStyle}
                        onChange={handleSearchChange}
                    />
                </div>
                <select value={filterRole} onChange={handleRoleChange} style={cardStyle}>
                    <option style={cardStyle} value="all">Tous les rôles</option>
                    <option style={cardStyle} value="admin">Admin</option>
                    <option style={cardStyle} value="client">Client</option>
                    <option style={cardStyle} value="technicien">Technicien</option>
                </select>
                <select style={cardStyle} value={filterStatus} onChange={handleStatusChange}>
                    <option style={cardStyle} value="all">Tous les statuts</option>
                    <option style={cardStyle} value="active">Actif</option>
                    <option style={cardStyle} value="inactive">Inactif</option>
                </select>
            </div>

            <div className="printer-cards-grid" style={cardStyle}>
                {filteredAndPaginatedUsers.paginatedUsers.length > 0 ? (
                    filteredAndPaginatedUsers.paginatedUsers.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onEdit={handleOpenEditForm}
                            onDelete={handleDeleteUser}
                            companyName={user.company ? user.company.name : null}
                            departmentName={user.department ? user.department.name : null}
                            scrollY={scrollY}
                            style={cardStyle}
                        />
                    ))
                ) : (
                    <p>Aucun utilisateur trouvé avec les critères actuels.</p>
                )}
            </div>

            {filteredAndPaginatedUsers.totalItems > 0 && (
                <div className="pagination-controls" style={cardStyle}>
                    <div className="items-per-page" style={cardStyle}>
                        <label htmlFor="perPage" style={cardStyle}>Utilisateurs par page:</label>
                        <select id="perPage" value={itemsPerPage} onChange={handleItemsPerPageChange} style={cardStyle}>
                            <option style={cardStyle} value={5}>5</option>
                            <option style={cardStyle} value={10}>10</option>
                            <option style={cardStyle} value={20}>20</option>
                            <option style={cardStyle} value={50}>50</option>
                        </select>
                    </div>
                    <div className="page-navigation">
                        <button
                            type="button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            <FiChevronLeft />
                        </button>
                        <span className="page-info" style={cardStyle}>
                            Page {currentPage} sur {filteredAndPaginatedUsers.totalPages} ({filteredAndPaginatedUsers.totalItems} au total)
                        </span>
                        <button
                            type="button"
                            style={cardStyle}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === filteredAndPaginatedUsers.totalPages}
                            className="pagination-button"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}
            
            {showForm && (
                <AddUserForm
                    userToEdit={editingUser}
                    onSave={handleSaveUser}
                    onCloseForm={handleCloseForm}
                    companies={companies}
                    departments={departments}
                    setError={setError}
                    ref={formRef}
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

export default UserManagementPage;