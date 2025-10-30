import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
    FiSearch,
    FiPlusCircle,
    FiEdit,
    FiTrash2,
    FiLoader,
    FiAlertCircle,
    FiX,
    FiChevronLeft, // Ajout de l'icône pour la pagination
    FiChevronRight // Ajout de l'icône pour la pagination
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css'; // Ajoute ce style pour la pagination si nécessaire
import AddPrinterForm from '../forms/AddPrinterForm';
import PrinterCard from '../pages/PrinterCard';
import PrinterDetailModal from '../modals/PrinterDetailModal';
import ConfirmationModal from '../modals/ConfirmationModal';

import { API_BASE_URL } from '../../api';

const PrinterManagementPage = () => {
    const location = useLocation();
    const [printers, setPrinters] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const confRef = useRef(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPrinter, setEditingPrinter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCompanyId, setFilterCompanyId] = useState('all');
    const [filterDepartmentId, setFilterDepartmentId] = useState('all');
    const [totalPrinters, setTotalPrinters] = useState(0);
    const formRef = useRef(null);
    const detailRef=useRef(null)
    // NOUVEAU: État pour le filtre "Achetée/Louée"
    const [filterIsPurchased, setFilterIsPurchased] = useState('all'); // 'all', 'true', 'false'
    
    // Nouveaux états de filtre pour correspondre à la logique backend
    const [filterUnassigned, setFilterUnassigned] = useState(false);
    const [filterReturnedToWarehouse, setFilterReturnedToWarehouse] = useState(false);
    const [filterInStock, setFilterInStock] = useState(false);

    // Compteurs des imprimantes
    const [unassignedPrintersCount, setUnassignedPrintersCount] = useState(0);
    const [returnedToWarehousePrinterCount, setReturnedToWarehousePrinterCount] = useState(0);
    const [printersInStockCount, setPrintersInStockCount] = useState(0);

    // États pour la modale de confirmation
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmPayload, setConfirmPayload] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // État pour la modale de détails de l'imprimante
    const [selectedPrinter, setSelectedPrinter] = useState(null);

    // NOUVEAU: États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Valeur par défaut

    const [isDarkMode, setIsDarkMode] = useState(false);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
    // Charger le dark mode au montage
    useEffect(() => {
        const storedTheme = localStorage.getItem('isDarkMode');
        setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
    }, []);

    const currentUserRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');

    const API_PRINTERS_URL = `${API_BASE_URL}/printers`;
    const API_COMPANIES_URL = `${API_BASE_URL}/companies`;
    const API_DEPARTMENTS_URL = `${API_BASE_URL}/departments`;
    const API_PRINTER_COUNTS_URL = `${API_BASE_URL}/printers/counts`;

    // Fonction fetchPrinters mise à jour pour envoyer les nouveaux paramètres de filtre, mémoïsée avec useCallback
    const fetchPrinters = useCallback(async (
        statusFilterParam = 'all',
        companyIdFilterParam = 'all',
        departmentIdFilterParam = 'all',
        isUnassignedParam = false,
        isReturnedParam = false,
        isInStockParam = false,
        isPurchasedParam = 'all', // NOUVEAU: Paramètre pour le filtre "Achetée/Louée"
    ) => {
        setError(null);
        setLoading(true);
        try {
            if (!authToken) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                setPrinters([]);
                setLoading(false);
                return;
            }

            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            let url = API_PRINTERS_URL;
            const queryParams = new URLSearchParams();

            // Les filtres spécifiques prennent le pas
            if (isUnassignedParam) {
                queryParams.append('unassigned', 'true');
            } else if (isReturnedParam) {
                queryParams.append('returned_to_warehouse_filter', 'true');
            } else if (isInStockParam) {
                queryParams.append('in_stock_filter', 'true');
            } else {
                // Filtres généraux si aucun filtre spécifique n'est actif
                if (statusFilterParam !== 'all') {
                    queryParams.append('status', statusFilterParam);
                }
                if (companyIdFilterParam !== 'all') {
                    queryParams.append('company_id', companyIdFilterParam);
                }
                if (departmentIdFilterParam !== 'all') {
                    queryParams.append('department_id', departmentIdFilterParam);
                }
                // NOUVEAU: Ajout du filtre is_purchased
                if (isPurchasedParam !== 'all') {
                    queryParams.append('is_purchased', isPurchasedParam);
                }
            }

            url += `?${queryParams.toString()}`;

            const response = await axios.get(url, { headers });
            setPrinters(response.data);
            setTotalPrinters(response.data.length)
            setCurrentPage(1); // Réinitialiser la page à 1 à chaque nouveau chargement
            setLoading(false);
        } catch (err) {
            console.error("Erreur API imprimantes:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 401) {
                setError("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                localStorage.removeItem('authToken');
            } else {
                setError("Erreur lors du chargement des imprimantes: " + (err.response?.data?.message || err.message));
            }
            setPrinters([]);
            setLoading(false);
        }
    }, [authToken, API_PRINTERS_URL]);

    const fetchPrinterCounts = useCallback(async () => {
        try {
            if (!authToken) return;
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
            const response = await axios.get(API_PRINTER_COUNTS_URL, { headers });
            setUnassignedPrintersCount(response.data.unassigned_count || 0);
            setReturnedToWarehousePrinterCount(response.data.returned_count || 0);
            setPrintersInStockCount(response.data.in_stock_count || 0);
        } catch (err) {
            console.error("Erreur API compteurs imprimantes:", err.response ? err.response.data : err.message);
            setUnassignedPrintersCount(0);
            setReturnedToWarehousePrinterCount(0);
            setPrintersInStockCount(0);
        }
    }, [authToken, API_PRINTER_COUNTS_URL]);

    const fetchCompanies = useCallback(async () => {
        try {
            if (!authToken) return;
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
            const response = await axios.get(API_COMPANIES_URL, { headers });
            setCompanies(response.data);
        } catch (err) {
            setError(prev => prev ? prev + "\nErreur chargement sociétés." : "Erreur chargement sociétés.");
            console.error("Erreur API sociétés:", err.response ? err.response.data : err.message);
            setCompanies([]);
        }
    }, [authToken, API_COMPANIES_URL]);

    const fetchDepartments = useCallback(async () => {
        try {
            if (!authToken) return;
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
            const response = await axios.get(API_DEPARTMENTS_URL, { headers });
            setDepartments(response.data);
        } catch (err) {
            setError(prev => prev ? prev + " et départements." : "Erreur chargement départements.");
            console.error("Erreur API départements:", err.response ? err.response.data : err.message);
            setDepartments([]);
        }
    }, [authToken, API_DEPARTMENTS_URL]);

    useEffect(() => {
        // Si le formulaire doit être montré ET que la référence est attachée à un élément...
        if (showForm && formRef.current) {
            // ... alors on scrolle jusqu'à cet élément.
            formRef.current.scrollIntoView({
                behavior: 'smooth', // Pour un défilement fluide
                block: 'center'    // Centre le formulaire verticalement dans la vue
            });
        }
    }, [showForm]); // Ce code s'exécute à chaque fois que `showForm` change.

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

    useEffect(() => {
        // Si le formulaire doit être montré ET que la référence est attachée à un élément...
        if (selectedPrinter && detailRef.current) {
            // ... alors on scrolle jusqu'à cet élément.
            detailRef.current.scrollIntoView({
                behavior: 'smooth', // Pour un défilement fluide
                block: 'center'    // Centre le formulaire verticalement dans la vue
            });
        }
    }, [selectedPrinter]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);

            const statusFromDashboard = location.state?.filterStatus || 'all';
            const unassignedFromDashboard = location.state?.filterUnassigned || false;
            const returnedFromDashboard = location.state?.filterReturnedToWarehouse || false;
            const inStockFromDashboard = location.state?.filterInStock || false;
            const companyIdFromDashboard = location.state?.filterCompanyId || 'all';
            const departmentIdFromDashboard = location.state?.filterDepartmentId || 'all';
            const isPurchasedFromDashboard = location.state?.filterIsPurchased || 'all';

            setFilterStatus(statusFromDashboard);
            setFilterUnassigned(unassignedFromDashboard);
            setFilterReturnedToWarehouse(returnedFromDashboard);
            setFilterInStock(inStockFromDashboard);
            setFilterCompanyId(companyIdFromDashboard);
            setFilterDepartmentId(departmentIdFromDashboard);

            // NOUVEAU: Récupérer le filtre d'acquisition de l'état de navigation
            setFilterIsPurchased(isPurchasedFromDashboard);

            await Promise.all([
                fetchPrinters(statusFromDashboard, companyIdFromDashboard, departmentIdFromDashboard, unassignedFromDashboard, returnedFromDashboard, inStockFromDashboard, isPurchasedFromDashboard),
                fetchCompanies(),
                fetchDepartments(),
                fetchPrinterCounts()
            ]);
            setLoading(false);
        };
        loadInitialData();
    }, [location.state, fetchPrinters, fetchCompanies, fetchDepartments, fetchPrinterCounts]);

    const companyMap = useMemo(() => {
        return Array.isArray(companies) ? companies.reduce((map, company) => {
            map[company.id] = company.name;
            return map;
        }, {}) : {};
    }, [companies]);

    const departmentMap = useMemo(() => {
        return Array.isArray(departments) ? departments.reduce((map, department) => {
            map[department.id] = department.name;
            return map;
        }, {}) : {};
    }, [departments]);

    const filteredPrinters = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return printers.filter(printer => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();

            const printerCompanyName = companyMap[printer.company_id] ? companyMap[printer.company_id].toLowerCase() : '';
            const printerDepartmentName = departmentMap[printer.department_id] ? departmentMap[printer.department_id].toLowerCase() : '';

            const matchesSearch = lowerCaseSearchTerm === '' ||
                String(printer.id).includes(lowerCaseSearchTerm) ||
                (printer.model && printer.model.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (printer.brand && printer.brand.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (printer.serial && printer.serial.toLowerCase().includes(lowerCaseSearchTerm)) ||
                printerCompanyName.includes(lowerCaseSearchTerm) ||
                printerDepartmentName.includes(lowerCaseSearchTerm) ||
                (printer.statusDisplay && printer.statusDisplay.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (printer.installDate && printer.installDate.toLowerCase().includes(lowerCaseSearchTerm));
            
            return matchesSearch;
        });
    }, [printers, searchTerm, companyMap, departmentMap]);

    // NOUVEAU: Logique de pagination
    const totalPages = Math.ceil(filteredPrinters.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPrinters.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };
    
    // NOUVEAU: Réinitialisation de la page sur changement de recherche
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Réinitialiser la page à 1
    };

    const handleOpenAddForm = () => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à ajouter des imprimantes.");
            return;
        }
        setEditingPrinter(null);
        setShowForm(true);
        setError(null);
    };

    const handleOpenEditForm = (printer) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à modifier des imprimantes.");
            return;
        }
        setEditingPrinter(printer);
        setShowForm(true);
        setError(null);
    };

    const handleSavePrinter = async (printerData) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à sauvegarder des imprimantes.");
            return;
        }
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            if (editingPrinter) {
                await axios.put(`${API_PRINTERS_URL}/${editingPrinter.id}`, printerData, { headers });
            } else {
                await axios.post(API_PRINTERS_URL, printerData, { headers });
            }

            await Promise.all([
                fetchPrinters(filterStatus, filterCompanyId, filterDepartmentId, filterUnassigned, filterReturnedToWarehouse, filterInStock, filterIsPurchased),
                fetchCompanies(),
                fetchDepartments(),
                fetchPrinterCounts()
            ]);
            setShowForm(false);
            setEditingPrinter(null);
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

    const handleDeletePrinter = async (printerId) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à supprimer des imprimantes.");
            return;
        }
        setConfirmMessage('Êtes-vous sûr de vouloir supprimer cette imprimante ?');
        setConfirmAction(() => async () => {
            try {
                const headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                };
                await axios.delete(`${API_PRINTERS_URL}/${printerId}`, { headers });
                await Promise.all([
                    fetchPrinters(filterStatus, filterCompanyId, filterDepartmentId, filterUnassigned, filterReturnedToWarehouse, filterInStock, filterIsPurchased),
                    fetchCompanies(),
                    fetchDepartments(),
                    fetchPrinterCounts()
                ]);
                setError(null);
            } catch (err) {
                setError('Erreur lors de la suppression de l\'imprimante.');
                console.error("Erreur API DELETE:", err.response ? err.response.data : err.message);
                setError('Erreur lors de la suppression: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
            }
        });
        setShowConfirmModal(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingPrinter(null);
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

    const handleViewPrinterDetails = async (printer) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                return;
            }
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` };
            const response = await axios.get(`${API_PRINTERS_URL}/${printer.id}?with=company,department,interventions,interventions.technician`, { headers });
            setSelectedPrinter(response.data);
        } catch (err) {
            console.error("Erreur lors du chargement des détails de l'imprimante:", err.response ? err.response.data : err.message);
            setError("Erreur lors du chargement des détails de l'imprimante.");
        }
    };

    const handleClosePrinterDetails = () => {
        setSelectedPrinter(null);
    };

    if (loading) {
        return (
            <div className="management-page-container loading-overlay" style={cardStyle}>
                <FiLoader className="loading-spinner-icon" />
                <p style={cardStyle}>Chargement des imprimantes, sociétés et départements...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="management-page-container alert alert-error" >
                <FiAlertCircle className="alert-icon" />
                <p>Erreur: {error}</p>
            </div>
        );
    }

    return (
        <div className="management-page-container" style={cardStyle}>
            <div className="management-header" style={cardStyle}>
                <h2>Gestion des Imprimantes</h2>
                {currentUserRole === 'admin' && (
                    <button className="new-button" onClick={handleOpenAddForm}>
                        <FiPlusCircle /> Nouvelle Imprimante
                    </button>
                )}
            </div>

            <div className="filter-bar" style={cardStyle}>
                <div className="search-input" style={cardStyle}>
                    <FiSearch />
                    <input
                        style={cardStyle}
                        type="text"
                        placeholder="Rechercher par numéro de série, modèle, marque, société, département, statut..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <select
                    style={cardStyle}
                    value={filterStatus}
                    onChange={(e) => {
                        const newStatus = e.target.value;
                        setFilterStatus(newStatus);
                        setFilterUnassigned(false);
                        setFilterReturnedToWarehouse(false);
                        setFilterInStock(false);
                        // NOUVEAU: Réinitialise le filtre d'acquisition
                        // setFilterIsPurchased('all');
                        fetchPrinters(newStatus, filterCompanyId, filterDepartmentId, false, false, false, filterIsPurchased
                        );
                    }}
                >
                    <option style={cardStyle} value="all">Tous les statuts</option>
                    <option style={cardStyle} value="active">Active</option>
                    <option style={cardStyle} value="maintenance">En maintenance</option>
                    <option style={cardStyle} value="hors-service">Hors service</option>
                    <option style={cardStyle} value="inactive">Inactive</option>
                </select>
                <select
                    style={cardStyle}
                    value={filterCompanyId}
                    onChange={(e) => {
                        const newCompany = e.target.value;
                        setFilterCompanyId(newCompany);
                        setFilterUnassigned(false);
                        setFilterReturnedToWarehouse(false);
                        setFilterInStock(false);
                        // NOUVEAU: Réinitialise le filtre d'acquisition
                        // setFilterIsPurchased('all');
                        fetchPrinters(filterStatus, newCompany, filterDepartmentId, false, false, false, filterIsPurchased);
                    }}
                >
                    <option style={cardStyle} value="all">Toutes les sociétés</option>
                    {companies.map(company => (
                        <option style={cardStyle} key={company.id} value={company.id}>
                            {company.name}
                        </option>
                    ))}
                </select>
                <select
                    style={cardStyle}
                    value={filterDepartmentId}
                    onChange={(e) => {
                        const newDepartment = e.target.value;
                        setFilterDepartmentId(newDepartment);
                        setFilterUnassigned(false);
                        setFilterReturnedToWarehouse(false);
                        setFilterInStock(false);
                        // NOUVEAU: Réinitialise le filtre d'acquisition
                        // setFilterIsPurchased('all');
                        fetchPrinters(filterStatus, filterCompanyId, newDepartment, false, false, false, filterIsPurchased);
                    }}
                >
                    <option style={cardStyle} value="all">Tous les départements</option>
                    {departments
                        .filter(department => filterCompanyId === 'all' || department.company_id == filterCompanyId)
                        .map(department => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                </select>
                
                {/* NOUVEAU: Ajout du filtre Achetée/Louée */}
                <select
                    style={cardStyle}
                    value={filterIsPurchased}
                    onChange={(e) => {
                        const newIsPurchased = e.target.value;
                        setFilterIsPurchased(newIsPurchased);

                        // Ne pas réinitialiser les autres filtres
                        fetchPrinters(
                            filterStatus,
                            filterCompanyId,
                            filterDepartmentId,
                            filterUnassigned,
                            filterReturnedToWarehouse,
                            filterInStock,
                            newIsPurchased
                        );
                    }}
                >
                    <option style={cardStyle} value="all">Tous les types d'acquisition</option>
                    <option style={cardStyle} value="true">Vendu</option>
                    <option style={cardStyle} value="false">En location</option>
                </select>

                <button
                    
                    className={`filter-button ${filterInStock ? 'active' : ''}`}
                    onClick={() => {
                        const newInStock = !filterInStock;
                        setFilterInStock(newInStock);
                        if (newInStock) {
                            setFilterStatus('all');
                            setFilterCompanyId('all');
                            setFilterDepartmentId('all');
                            setFilterUnassigned(false);
                            setFilterReturnedToWarehouse(false);
                            // NOUVEAU: Réinitialise le filtre d'acquisition
                            setFilterIsPurchased('all');
                        }
                        fetchPrinters('all', 'all', 'all', false, false, newInStock, 'all');
                    }}
                >
                    En Stock ({printersInStockCount})
                </button>
            </div>
            {/* NOUVEAU: Sélecteur du nombre d'éléments par page */}
            <div className="items-per-page-selector" style={cardStyle}>
                <label style={cardStyle} htmlFor="items-per-page">Afficher :</label>
                <select
                    style={cardStyle}
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Réinitialise la page à 1
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
                    currentItems.map((printer) => (
                        <PrinterCard
                            key={printer.id}
                            printer={printer}
                            onEdit={handleOpenEditForm}
                            onDelete={handleDeletePrinter}
                            currentUserRole={currentUserRole}
                            onCardClick={handleViewPrinterDetails}
                            style={cardStyle}
                        />
                    ))
                ) : (
                    <p style={cardStyle}>Aucune imprimante trouvée avec les critères actuels.</p>
                )}
            </div>
            
            {/* NOUVEAU: Affichage des boutons de pagination seulement si nécessaire */}
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
            <span className="page-info"  style={cardStyle}>
                        (Total d'imprimante : {totalPrinters} )
                    </span>

            {showForm && (
                <AddPrinterForm
                    style={cardStyle}
                    printerToEdit={editingPrinter}
                    onSave={handleSavePrinter}
                    onCloseForm={handleCloseForm}
                    companies={companies}
                    departments={departments}
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

            {selectedPrinter && (
                <PrinterDetailModal
                    style={cardStyle}
                    printer={selectedPrinter}
                    onClose={handleClosePrinterDetails}
                    ref={detailRef}
                />
            )}
        </div>
    );
};

export default PrinterManagementPage;