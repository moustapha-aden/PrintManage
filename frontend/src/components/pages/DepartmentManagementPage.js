import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
    FiSearch,
    FiPlusCircle,
    FiEdit,
    FiTrash2,
    FiAlertCircle,
    FiX,
    FiChevronLeft, // Pour la pagination
    FiChevronRight, // Pour la pagination
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';
import AddDepartmentForm from '../forms/AddDepartmentForm';
import ConfirmationModal from '../modals/ConfirmationModal';

import { API_BASE_URL } from '../../api';

const DepartmentTableRow = React.memo(({ department, onEdit, onDelete, companyName }) => {
    return (
        <tr>
            <td>{department.name}</td>
            <td>{companyName}</td>
            <td>
                <div className="table-actions">
                    <button className="icon-button" onClick={() => onEdit(department)} title="Modifier"><FiEdit /></button>
                    <button className="icon-button trash" onClick={() => onDelete(department.id)} title="Supprimer"><FiTrash2 /></button>
                </div>
            </td>
        </tr>
    );
});

const DepartmentManagementPage = () => {
    const location = useLocation();
    const [departments, setDepartments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCompany, setFilterCompany] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Nouveaux états pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Valeur par défaut de 10

    const formRef = useRef(null);
    const confRef = useRef(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmPayload, setConfirmPayload] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const API_DEPARTMENTS_URL = `${API_BASE_URL}/departments`;
    const API_COMPANIES_URL = `${API_BASE_URL}/companies`;

    const authToken = localStorage.getItem('authToken');
    const currentUserRole = localStorage.getItem('userRole');

    const [isDarkMode, setIsDarkMode] = useState(false);
        const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
            // Charger le dark mode au montage
            useEffect(() => {
                const storedTheme = localStorage.getItem('isDarkMode');
                setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
            }, []);
    const fetchDepartments = useCallback(async (companyIdFilter = 'all') => {
        setError(null);
        try {
            if (!authToken) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                setDepartments([]);
                return;
            }

            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            let url = `${API_DEPARTMENTS_URL}?with=company`;
            if (companyIdFilter !== 'all') {
                url += `&company_id=${companyIdFilter}`;
            }

            const response = await axios.get(url, { headers });
            setDepartments(response.data);
            // Réinitialiser la page actuelle à 1 lorsque de nouvelles données sont chargées
            setCurrentPage(1);
        } catch (err) {
            console.error("Erreur API départements:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 401) {
                setError("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                localStorage.removeItem('authToken');
            } else {
                setError("Erreur lors du chargement des départements: " + (err.response?.data?.message || err.message));
            }
            setDepartments([]);
        }
    }, [authToken, API_DEPARTMENTS_URL]);

    const fetchCompanies = useCallback(async () => {
        try {
            if (!authToken) return;
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };
            const response = await axios.get(API_COMPANIES_URL, { headers });
            setCompanies(response.data);
        } catch (err) {
            setError(prev => prev ? prev + "\nErreur chargement sociétés." : "Erreur chargement sociétés.");
            console.error("Erreur API sociétés:", err.response ? err.response.data : err.message);
            setCompanies([]);
        }
    }, [authToken, API_COMPANIES_URL]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            const initialCompanyFilter = location.state?.filterCompanyId || 'all';
            setFilterCompany(initialCompanyFilter);
            await Promise.all([
                fetchDepartments(initialCompanyFilter),
                fetchCompanies()
            ]);
            setLoading(false);
        };
        loadInitialData();
    }, [location.state, fetchDepartments, fetchCompanies]);

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

    const companyMap = useMemo(() => {
        const map = {};
        if (Array.isArray(companies)) {
            companies.forEach((company) => {
                map[company.id] = company.name;
            });
        }
        return map;
    }, [companies]);

    // Logique de filtrage des départements
    const filteredDepartments = useMemo(() => {
        return departments.filter(department => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const companyName = department.company?.name ? department.company.name.toLowerCase() : '';

            const matchesSearch = lowerCaseSearchTerm === '' ||
                String(department.id).includes(lowerCaseSearchTerm) ||
                (department.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
                companyName.includes(lowerCaseSearchTerm);

            const matchesCompany = filterCompany === 'all' || String(department.company_id) === filterCompany;
            return matchesSearch && matchesCompany;
        });
    }, [departments, searchTerm, filterCompany]);

    // Logique de pagination
    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        // S'assurer que le numéro de page est valide
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleOpenAddForm = () => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à ajouter des départements.");
            return;
        }
        setEditingDepartment(null);
        setShowForm(true);
        setError(null);
    };

    const handleOpenEditForm = (department) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à modifier des départements.");
            return;
        }
        setEditingDepartment(department);
        setShowForm(true);
        setError(null);
    };

    const handleSaveDepartment = async (departmentData) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à sauvegarder des départements.");
            return;
        }
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            if (editingDepartment) {
                await axios.put(`${API_DEPARTMENTS_URL}/${editingDepartment.id}`, departmentData, { headers });
            } else {
                await axios.post(API_DEPARTMENTS_URL, departmentData, { headers });
            }
            await Promise.all([fetchDepartments(filterCompany), fetchCompanies()]);
            setShowForm(false);
            setEditingDepartment(null);
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

    const handleDeleteDepartment = async (departmentId) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à supprimer des départements.");
            return;
        }
        setConfirmMessage('Êtes-vous sûr de vouloir supprimer ce département ?');
        setConfirmAction(() => async () => {
            try {
                const headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                };
                await axios.delete(`${API_DEPARTMENTS_URL}/${departmentId}`, { headers });
                await Promise.all([fetchDepartments(filterCompany), fetchCompanies()]);
                setError(null);
            } catch (err) {
                setError('Erreur lors de la suppression du département.');
                console.error("Erreur API DELETE:", err.response ? err.response.data : err.message);
                setError('Erreur lors de la suppression: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
            }
        });
        setShowConfirmModal(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingDepartment(null);
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
                <p>Chargement des départements...</p>
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
                <h2>Gestion des Départements</h2>
                {currentUserRole === 'admin' && (
                    <button className="new-button" onClick={handleOpenAddForm}>
                        <FiPlusCircle /> Nouveau Département
                    </button>
                )}
            </div>

            <div className="filter-bar" style={cardStyle}>
                <div className="search-input" style={cardStyle}>
                    <FiSearch />
                    <input
                        style={cardStyle}
                        type="text"
                        placeholder="Rechercher par ID, nom ou société..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    style={cardStyle}
                    value={filterCompany}
                    onChange={(e) => {
                        setFilterCompany(e.target.value);
                        fetchDepartments(e.target.value);
                    }}
                >
                    <option value="all" style={cardStyle}>Toutes les sociétés</option>
                    {Array.isArray(companies) && companies.map(company => (
                        <option style={cardStyle} key={company.id} value={company.id}>
                            {company.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="table-responsive" style={cardStyle}>
                {/* Sélecteur du nombre d'éléments par page */}
                <div className="items-per-page-selector" style={cardStyle}>
                    <label htmlFor="items-per-page" style={cardStyle}>Afficher :</label>
                    <select
                        style={cardStyle}
                        id="items-per-page"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Réinitialiser la page à 1 lorsque le nombre d'éléments change
                        }}
                    >
                        <option style={cardStyle} value={5}>5</option>
                        <option style={cardStyle} value={10}>10</option>
                        <option style={cardStyle} value={20}>20</option>
                        <option style={cardStyle} value={50}>50</option>
                    </select>
                </div>

                {/* Affichage du tableau */}
                {currentItems.length > 0 ? (
                    <table className="data-table" style={cardStyle}>
                        <thead>
                            <tr>
                                <th>Nom du Département</th>
                                <th>Société</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((department) => (
                                <DepartmentTableRow
                                    key={department.id}
                                    department={department}
                                    onEdit={handleOpenEditForm}
                                    onDelete={handleDeleteDepartment}
                                    companyName={department.company?.name || 'N/A'}
                                />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={cardStyle}>Aucun département trouvé avec les critères actuels.</p>
                )}

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
            </div>

            {showForm && (
                <AddDepartmentForm
                    departmentToEdit={editingDepartment}
                    onSave={handleSaveDepartment}
                    onCloseForm={handleCloseForm}
                    companies={companies}
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

export default DepartmentManagementPage;