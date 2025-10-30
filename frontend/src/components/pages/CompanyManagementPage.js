import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
    FiSearch,
    FiPlusCircle,
    FiAlertCircle,
    FiChevronLeft, // Ajout des icônes pour la pagination
    FiChevronRight, // Ajout des icônes pour la pagination
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css'; // Ajoute ce style pour la pagination si tu le souhaites
import AddCompanyForm from '../forms/AddCompanyForm';
import ConfirmationModal from '../modals/ConfirmationModal';
import CompanyCard from '../modals/CompanyCard';
import { API_BASE_URL } from '../../api';
const CompanyManagementPage = () => {
    
    const location = useLocation();
    const [companies, setCompanies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Nouveaux états pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Valeur par défaut de 10 éléments par page

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmPayload, setConfirmPayload] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const formRef = useRef(null);
    const confRef = useRef(null);

    const [isDarkMode, setIsDarkMode] = useState(false);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
        // Charger le dark mode au montage
        useEffect(() => {
            const storedTheme = localStorage.getItem('isDarkMode');
            setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
        }, []);
    

    const currentUserRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');


    

    const API_COMPANIES_URL = `${API_BASE_URL}/companies`;

    const fetchCompanies = useCallback(async (statusFilterParam = 'all') => {
        setLoading(true);
        setError(null);
        try {
            if (!authToken) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                setCompanies([]);
                return;
            }

            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            let url = API_COMPANIES_URL;
            if (statusFilterParam !== 'all') {
                url += `?status=${statusFilterParam}`;
            }

            const response = await axios.get(url, { headers });
            setCompanies(response.data);
            setCurrentPage(1); // Réinitialiser la page à 1 lorsque le filtre change ou que de nouvelles données sont chargées
        } catch (err) {
            console.error("Erreur API lors du chargement des sociétés:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 401) {
                setError("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                localStorage.removeItem('authToken');
                // Optionnel: rediriger vers la page de connexion
                // navigate('/login');
            } else {
                setError("Erreur lors du chargement des sociétés: " + (err.response?.data?.message || err.message));
            }
            setCompanies([]); // Vider les sociétés en cas d'erreur
        } finally {
            setLoading(false);
        }
    }, [authToken, API_COMPANIES_URL]); // Dépendances pour useCallback

    // useEffect pour gérer le chargement initial et les filtres de navigation
    useEffect(() => {
        // Lire le statut de filtre depuis l'état de la navigation (si présent)
        const statusFromDashboard = location.state?.filterStatus || 'all';
        setFilterStatus(statusFromDashboard); // Met à jour l'état local du filtre

        // Appelle la fonction de récupération avec le filtre initial
        fetchCompanies(statusFromDashboard);

    }, [location.state, fetchCompanies]); // Déclenche ce useEffect chaque fois que l'état de la location change ou que fetchCompanies change (bien que useCallback le stabilise)

 useEffect(() => {
        // Si le formulaire doit être montré ET que la référence est attachée à un élément...
        if (showForm && formRef.current) {
            // ... alors on scrolle jusqu'à cet élément.
            formRef.current.scrollIntoView({
                behavior: 'smooth', // Pour un défilement fluide
                block: 'center'    // Centre le formulaire verticalement dans la vue
            });
        }
    }, [showForm]);

     useEffect(() => {
        // Si le formulaire doit être montré ET que la référence est attachée à un élément...
        if (showConfirmModal && confRef.current) {
            // ... alors on scrolle jusqu'à cet élément.
            confRef.current.scrollIntoView({
                behavior: 'smooth', // Pour un défilement fluide
                block: 'center'    // Centre le formulaire verticalement dans la vue
            });
        }
    }, [showConfirmModal]); 
    // Logique de filtrage côté client (en plus du filtrage API si existant)
    const filteredCompanies = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return companies.filter(company => {
            const matchesSearch = lowerCaseSearchTerm === '' ||
                String(company.id).includes(lowerCaseSearchTerm) ||
                (company.name && company.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (company.address && company.address.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (company.country && company.country.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (company.phone && company.phone.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (company.email && company.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (company.contact_person && company.contact_person.toLowerCase().includes(lowerCaseSearchTerm));

            // Filtrage par statut (utile si vous ne filtrez pas côté API, ou pour affiner le filtre API)
            // Assurez-vous que les statuts correspondent exactement à ceux de votre API ('active', 'inactive')
                const matchesStatus = filterStatus === 'all' || (company.status && company.status.toLowerCase() === filterStatus.toLowerCase());
            return matchesSearch && matchesStatus;
        });
    }, [companies, searchTerm, filterStatus]);

    

    // Logique de pagination
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleOpenAddForm = () => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à ajouter des sociétés.");
            return;
        }
        setEditingCompany(null);
        setShowForm(true);
        setError(null);
    };

    const handleOpenEditForm = (company) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à modifier des sociétés.");
            return;
        }
        setEditingCompany(company);
        setShowForm(true);
        setError(null);
    };

    const handleSaveCompany = async (companyData) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à sauvegarder des sociétés.");
            return;
        }
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            const dataToSend = {
                ...companyData,
                status: companyData.status ? companyData.status.toLowerCase() : 'active'
            };

            if (editingCompany) {
                await axios.put(`${API_COMPANIES_URL}/${editingCompany.id}`, dataToSend, { headers });
            } else {
                await axios.post(API_COMPANIES_URL, dataToSend, { headers });
            }
            setShowForm(false);
            setEditingCompany(null);
            fetchCompanies(filterStatus);
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

    const handleDeleteCompany = async (companyId) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à supprimer des sociétés.");
            return;
        }
        setConfirmMessage('Êtes-vous sûr de vouloir supprimer cette société ?');
        setConfirmAction(() => async () => {
            try {
                const headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                };
                await axios.delete(`${API_COMPANIES_URL}/${companyId}`, { headers });
                fetchCompanies(filterStatus); // Re-fetch les données pour mettre à jour la liste
                setError(null);
            } catch (err) {
                setError('Erreur lors de la suppression de la société.');
                console.error("Erreur API DELETE:", err.response ? err.response.data : err.message);
                setError('Erreur lors de la suppression: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
            }
        });
        setShowConfirmModal(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCompany(null);
        setError(null);
    };

    const handleConfirmAction = () => {
        if (confirmAction) {
            confirmAction(confirmPayload);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmPayload(null);
        setConfirmMessage('');
        setError(null);
    };

    const handleCancelConfirmation = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmPayload(null);
        setConfirmMessage('');
        setError(null);
    };

    if (loading) {
        return (
            <div style={cardStyle} className="management-page-container loading-overlay">
                <p style={cardStyle}>Chargement des sociétés...</p>
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
        <div className="management-page-container" style={cardStyle}>
            <div className="management-header" style={cardStyle}>
                <h2>Gestion des Sociétés</h2>
                {currentUserRole === 'admin' && (
                    <button className="new-button" onClick={handleOpenAddForm}>
                        <FiPlusCircle /> Nouvelle Société
                    </button>
                )}
            </div>

            <div className="filter-bar" style={cardStyle}>
                <div className="search-input" style={cardStyle}>
                    <FiSearch />
                    <input
                        style={cardStyle}
                        type="text"
                        placeholder="Rechercher par nom, adresse, pays, contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    style={cardStyle}
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        fetchCompanies(e.target.value);
                    }}
                >
                    <option style={cardStyle} value="all">Tous les statuts</option>
                    <option style={cardStyle} value="active">Active</option>
                    <option style={cardStyle} value="inactive">Inactive</option>
                </select>
            </div>

            {/* Sélecteur du nombre d'éléments par page */}
            <div className="items-per-page-selector" style={cardStyle}>
                <label htmlFor="items-per-page" style={cardStyle}>Afficher :</label>
                <select
                    style={cardStyle}
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Réinitialise la page à 1 à chaque changement
                    }}
                >
                    <option style={cardStyle} value={5}>5</option>
                    <option style={cardStyle} value={10}>10</option>
                    <option style={cardStyle} value={20}>20</option>
                    <option style={cardStyle} value={50}>50</option>
                </select>
            </div>

            <div className="printer-cards-grid" style={cardStyle}>
                {currentItems.length > 0 ? (
                    currentItems.map((company) => (
                        <CompanyCard
                            style={cardStyle}
                            key={company.id}
                            company={company}
                            onEdit={handleOpenEditForm}
                            onDelete={handleDeleteCompany}
                            currentUserRole={currentUserRole}
                        />
                    ))
                ) : (
                    <p style={cardStyle}>Aucune société trouvée avec les critères actuels.</p>
                )}
            </div>

            {/* Affichage des boutons de pagination seulement si nécessaire */}
            {totalPages > 1 && (
                <div className="pagination" style={cardStyle}>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} style={cardStyle}>
                        <FiChevronLeft /> Précédent
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={currentPage === page ? 'active' : ''}
                        >
                            {page}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} style={cardStyle}>
                        Suivant <FiChevronRight />
                    </button>
                </div>
            )}

            {showForm && (
                <AddCompanyForm
                    style={cardStyle}
                    companyToEdit={editingCompany}
                    onSave={handleSaveCompany}
                    onCloseForm={handleCloseForm}
                    setError={setError}
                    ref={formRef}
                />
            )}

            {showConfirmModal && (
                <ConfirmationModal
                    style={cardStyle}
                    message={confirmMessage}
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelConfirmation}
                    ref={confRef}
                />
            )}
        </div>
    );
};

export default CompanyManagementPage;