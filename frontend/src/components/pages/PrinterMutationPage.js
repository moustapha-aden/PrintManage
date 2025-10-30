import React, { useState, useEffect, useMemo, useCallback,useRef } from 'react';
import axios from 'axios';
import {
    FiSearch,
    FiX,
    FiCheckCircle,
    FiMove, // Added FiMove for PrinterMutationPage
    FiRepeat, // Added FiRepeat for PrinterMutationPage
    FiAlertCircle // Ajout de FiAlertCircle pour les messages d'erreur
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';
import '../styles/SearchBar.css'; // Assuming this is for PrinterMutationPage

// Note: AddInterventionForm and StatusUpdateModal are not directly used in this component,
// but their imports are kept if they are part of the larger application structure.
// import AddInterventionForm from '../forms/AddInterventionForm';
// import StatusUpdateModal from '../modals/StatusUpdateModal';


import { API_BASE_URL } from '../../api';
import ConfirmationModal from '../modals/ConfirmationModal';


/**
 * Formats an ISO date string into a localized date and time string.
 * @param {string} isoString - The ISO date string to format.
 * @returns {string} Formatted date string or 'N/A' if input is null/empty.
 */
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formats an ISO date string (YYYY-MM-DD) into a localized date string.
 * @param {string} isoDateString - The ISO date string (e.g., "2023-10-27") to format.
 * @returns {string} Formatted date string or 'N/A' if input is null/empty.
 */


/**
 * Returns the status string as is (can be extended for custom display).
 * @param {string} status - The intervention status.
 * @returns {string} The status string.
 */


/**
 * Returns the priority string as is (can be extended for custom display).
 * @param {string} priority - The intervention priority.
 * @returns {string} The priority string.
 */

/**
 * Returns the intervention type string or 'N/A' if null/empty.
 * @param {string} type - The intervention type.
 * @returns {string} The intervention type string.
 */

/**
 * Confirmation Modal Component.
 * This component is used to display a confirmation dialog instead of using window.confirm.
 * @param {object} props - Component props.
 * @param {string} props.message - The message to display in the modal.
 * @param {function} props.onConfirm - Callback function when 'Confirm' is clicked.
 * @param {function} props.onCancel - Callback function when 'Cancel' is clicked.
 */
// Main PrinterMutationPage component
const PrinterMutationPage = () => {
    const [printers, setPrinters] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const confRef = useRef(null);
    const [selectedPrinterId, setSelectedPrinterId] = useState('');
    const [newDepartmentId, setNewDepartmentId] = useState('');
    const [mutationNotes, setMutationNotes] = useState('');
    const [formError, setFormError] = useState(''); // Specific error for the form section

    const [printerMovements, setPrinterMovements] = useState([]);

    // États pour la barre de recherche
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartmentId, setFilterDepartmentId] = useState('');
    const [filterCompanyId, setFilterCompanyId] = useState('');

    // States for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmPayload, setConfirmPayload] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // Mode nuit 
     const [isDarkMode, setIsDarkMode] = useState(false);
        const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
    
        // Charger le dark mode au montage
        useEffect(() => {
            const storedTheme = localStorage.getItem('isDarkMode');
            setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
        }, []);
    

    const currentUserRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken'); // Get token once

    // Function to fetch all necessary initial data, memoized with useCallback
    const fetchInitialData = useCallback(async () => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à accéder à cette page.");
            setLoading(false);
            return;
        }

        if (!authToken) {
            setError("Non authentifié. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        const headers = { Authorization: `Bearer ${authToken}` };
        setLoading(true);
        setError(null); // Clear previous errors

        try {
            // Fetch printers with their current department and company
            const printersResponse = await axios.get(`${API_BASE_URL}/printers?with=department.company`, { headers });
            setPrinters(printersResponse.data);

            // Fetch all departments with their associated companies
            const departmentsResponse = await axios.get(`${API_BASE_URL}/departments?with=company`, { headers });
            setDepartments(departmentsResponse.data);

            // Fetch all companies
            const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, { headers });
            setCompanies(companiesResponse.data);

            // Fetch printer movements history
            const movementsResponse = await axios.get(`${API_BASE_URL}/printer-movements?with=printer,oldDepartment.company,newDepartment.company,movedBy`, { headers });
            setPrinterMovements(movementsResponse.data);

        } catch (err) {
            console.error("Erreur lors du chargement des données initiales pour la mutation:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 401) {
                setError("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                localStorage.removeItem('authToken');
                // navigate('/login'); // Uncomment if you have a navigate function
            } else {
                setError("Impossible de charger les imprimantes, départements ou sociétés: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    }, [currentUserRole, authToken, API_BASE_URL]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]); // fetchInitialData is a stable dependency

    // Handle form submission for printer movement, memoized with useCallback
    const handleMutationSubmit = useCallback(async (e) => {
        e.preventDefault();
        setFormError('');
        setSuccessMessage('');
        setError(null); // Clear global error

        if (currentUserRole !== 'admin') {
            setFormError("Vous n'êtes pas autorisé à déplacer des imprimantes.");
            return;
        }

        if (!selectedPrinterId || !newDepartmentId) {
            setFormError("Veuillez sélectionner une imprimante et un nouveau département.");
            return;
        }

        const printerToMove = printers.find(p => String(p.id) === String(selectedPrinterId));
        if (printerToMove && String(printerToMove.department_id) === String(newDepartmentId)) {
            setFormError("L'imprimante est déjà dans ce département. Veuillez choisir un nouveau département.");
            return;
        }

        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            const response = await axios.put(`${API_BASE_URL}/printers/${selectedPrinterId}/move`, {
                new_department_id: Number(newDepartmentId),
                notes: mutationNotes.trim() || null,
            }, { headers });

            setSuccessMessage("Imprimante déplacée avec succès !");

            // Re-fetch all data to ensure the UI is fully consistent with the backend
            await fetchInitialData();

            // Reset form
            setSelectedPrinterId('');
            setNewDepartmentId('');
            setMutationNotes('');

        } catch (err) {
            console.error("Erreur lors du déplacement de l'imprimante:", err.response ? err.response.data : err.message);
            const msg = err.response?.data?.message || err.message || "Une erreur est survenue lors du déplacement.";
            setFormError(`Erreur: ${msg}`);
        }
    }, [selectedPrinterId, newDepartmentId, mutationNotes, printers, departments, currentUserRole, authToken, API_BASE_URL, fetchInitialData]);

    // Filter printers displayed in the select dropdown based on search and filters
    const filteredPrinters = useMemo(() => {
        let currentPrinters = printers;

        // Filter by search term (model, brand, serial)
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentPrinters = currentPrinters.filter(p =>
                (p.model?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (p.brand?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (p.serial?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (p.department?.name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (p.department?.company?.name?.toLowerCase() || '').includes(lowerCaseSearchTerm)
            );
        }

        // Filter by department
        if (filterDepartmentId) {
            currentPrinters = currentPrinters.filter(p =>
                String(p.department_id) === String(filterDepartmentId)
            );
        }

        // Filter by company
        if (filterCompanyId) {
            currentPrinters = currentPrinters.filter(p =>
                String(p.department?.company_id) === String(filterCompanyId)
            );
        }

        return currentPrinters;
    }, [printers, searchTerm, filterDepartmentId, filterCompanyId]);

    // Filter departments for the new department selection dropdown
    const departmentsForSelection = useMemo(() => {
        const printer = printers.find(p => String(p.id) === String(selectedPrinterId));
        if (printer) {
            // Exclude the current department of the selected printer
            return departments.filter(d => String(d.id) !== String(printer.department_id));
        }
        return departments; // If no printer is selected, show all departments
    }, [selectedPrinterId, printers, departments]);

    // Filter printer movements based on search and filter criteria
    const filteredPrinterMovements = useMemo(() => {
        let currentMovements = printerMovements;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentMovements = currentMovements.filter(move =>
                (move.printer?.model?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (move.printer?.brand?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (move.printer?.serial?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (move.old_department?.name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (move.old_department?.company?.name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (move.new_department?.name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (move.new_department?.company?.name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (move.moved_by?.name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                (move.notes?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
                formatDate(move.date_mouvement).toLowerCase().includes(lowerCaseSearchTerm) // Use formatDate for date comparison
            );
        }

        if (filterDepartmentId) {
            currentMovements = currentMovements.filter(move =>
                String(move.old_department?.id) === String(filterDepartmentId) ||
                String(move.new_department?.id) === String(filterDepartmentId)
            );
        }

        if (filterCompanyId) {
            currentMovements = currentMovements.filter(move =>
                String(move.old_department?.company?.id) === String(filterCompanyId) ||
                String(move.new_department?.company?.id) === String(filterCompanyId)
            );
        }

        return currentMovements;
    }, [printerMovements, searchTerm, filterDepartmentId, filterCompanyId]);

    // Confirmation modal handlers
    const handleConfirmAction = () => {
        if (confirmAction) {
            confirmAction(confirmPayload);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmPayload(null);
        setConfirmMessage('');
        setError(null); // Clear global error on confirmation
    };

    const handleCancelConfirmation = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmPayload(null);
        setConfirmMessage('');
        setError(null); // Clear global error on cancel
    };


    // if (loading) {
    //     return (
    //         <div className="management-page-container loading-overlay">
    //             <FiLoader className="loading-spinner-icon" />
    //             <p>Chargement des données...</p>
    //         </div>
    //     );
    // }

    if (error) {
        return (
            <div className="management-page-container alert alert-error"  style={cardStyle}>
                <FiAlertCircle className="alert-icon" />
                <p>Erreur: {error}</p>
            </div>
        );
    }

    return (
        <div className="management-page-container"  style={cardStyle}>
            <div className="management-header"  style={cardStyle}>
                <h2><FiRepeat /> Mouvements d'Imprimantes</h2>
            </div>

            <div className="form-section-card"  style={cardStyle}>
                <h3>Déplacer une Imprimante</h3>
                <form onSubmit={handleMutationSubmit} className='form-container'  style={cardStyle}>
                    
                    {formError && <p className="form-error-message"><FiAlertCircle /> {formError}</p>}
                    {successMessage && <p className="form-success-message"><FiCheckCircle /> {successMessage}</p>}

                    {/* Barre de recherche et filtres */}

                    <select
                        style={cardStyle}
                        value={filterCompanyId}
                        onChange={(e) => {
                            const newCompanyId = e.target.value;
                            setFilterCompanyId(newCompanyId);
                            setFilterDepartmentId(''); // Réinitialise le département quand la société change
                        }}
                        className="search-select"
                    >
                        <option  style={cardStyle} value="">Toutes les sociétés</option>
                        {companies.map(company => (
                            <option  style={cardStyle} key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>

                    {/* Champ de sélection pour le département */}
                    <select
                        style={cardStyle}
                        value={filterDepartmentId}
                        onChange={(e) => setFilterDepartmentId(e.target.value)}
                        className="search-select"
                    >
                        <option  style={cardStyle} value="">Tous les départements</option>
                        {departments
                            .filter(department => !filterCompanyId || department.company_id == filterCompanyId)
                            .map(department => (
                                <option  style={cardStyle} key={department.id} value={department.id}>
                                    {department.name} ({department.company?.name || 'N/A'})
                                </option>
                            ))}
                    </select>

                    <div className="form-group"  style={cardStyle}>
                        <label htmlFor="printer_id"  style={cardStyle}>Sélectionner l'Imprimante:</label>
                        <select
                            style={cardStyle}
                            id="printer_id"
                            value={selectedPrinterId}
                            onChange={(e) => {
                                setSelectedPrinterId(e.target.value);
                                setNewDepartmentId('');
                                setFormError('');
                                setSuccessMessage('');
                            }}
                            required
                        >
                            <option style={cardStyle} value="">-- Choisir une imprimante --</option>
                            {filteredPrinters.length > 0 ? (
                                filteredPrinters.map(printer => (
                                    <option style={cardStyle} key={printer.id} value={printer.id}>
                                        {printer.brand} {printer.model} (S/N: {printer.serial}) - Actuel: {printer.department?.name || 'N/A'} ({printer.company?.name || 'N/A'})
                                    </option>
                                ))
                            ) : (
                                <option style={cardStyle} value="" disabled>Aucune imprimante trouvée avec les filtres actuels</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group" style={cardStyle}>
                        <label htmlFor="new_department_id" style={cardStyle}>Nouveau Département:</label>
                        <select
                            style={cardStyle}
                            id="new_department_id"
                            value={newDepartmentId}
                            onChange={(e) => {
                                setNewDepartmentId(e.target.value);
                                setFormError('');
                                setSuccessMessage('');
                            }}
                            required
                            disabled={!selectedPrinterId}
                        >
                            <option style={cardStyle} value="">-- Sélectionner un département --</option>
                            {departmentsForSelection.length > 0 ? (
                                departmentsForSelection.map(department => (
                                    <option style={cardStyle} key={department.id} value={department.id}>
                                        {department.name} ({department.company?.name || 'N/A'})
                                    </option>
                                ))
                            ) : (
                                <option style={cardStyle} value="" disabled>Aucun département disponible</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group" style={cardStyle}>
                        <label htmlFor="mutation_notes" style={cardStyle}>Notes sur le déplacement (optionnel):</label>
                        <textarea
                            style={cardStyle}
                            id="mutation_notes"
                            value={mutationNotes}
                            onChange={(e) => setMutationNotes(e.target.value)}
                            rows="3"
                            placeholder="Ex: Remplacement dû à un déménagement de service..."
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="form-button submit">
                            <FiMove /> Déplacer l'Imprimante
                        </button>
                    </div>

                    
                </form>
            </div>
                            <div className="search-bar-container" style={cardStyle}>
                        <div className="search-input-group" style={cardStyle}>
                            <FiSearch className="search-icon" style={cardStyle}/>
                            <input
                                style={cardStyle}
                                type="text"
                                placeholder="Rechercher par modèle, marque, série, département, société..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                         <select
                            style={cardStyle}
                            value={filterCompanyId}
                            onChange={(e) => {
                                setFilterCompanyId(e.target.value);
                                setFilterDepartmentId(''); // Réinitialise le département si la société change
                            }}
                            className="search-select"
                        >
                            <option style={cardStyle} value="">Toutes les sociétés</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                        <select
                            style={cardStyle}
                            value={filterDepartmentId}
                            onChange={(e) => {
                                setFilterDepartmentId(e.target.value);
                                // setFilterCompanyId(''); // Réinitialise la société si le département change
                            }}
                            className="search-select"
                        >
                            <option style={cardStyle} value="all">Tous les départements</option>
                            {departments
                        .filter(department => !filterCompanyId || department.company_id == filterCompanyId)
                        .map(department => (
                            <option style={cardStyle} key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                        </select>
                       
                    </div>
            {/* Section Historique des Mouvements */}
            <div className="table-section-card" style={cardStyle}>
                <h3>Historique des Mouvements d'Imprimantes</h3>
                {filteredPrinterMovements.length === 0 && <p className="no-data-message"style={cardStyle} >Aucun mouvement d'imprimante trouvé avec les filtres actuels.</p>}
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Imprimante</th>
                                <th>Ancien Département</th>
                                <th>Nouveau Département</th>
                                <th>Date du Mouvement</th>
                                <th>Déplacé par</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrinterMovements.map(move => (
                                <tr style={cardStyle} key={move.id}>
                                    <td>{move.printer?.brand || 'N/A'} {move.printer?.model || 'N/A'} (S/N: {move.printer?.serial || 'N/A'})</td>
                                    <td>{move.old_department?.name || 'N/A'} ({move.old_department?.company?.name || 'N/A'})</td>
                                    <td>{move.new_department?.name || 'N/A'} ({move.new_department?.company?.name || 'N/A'})</td>
                                    <td>{formatDate(move.date_mouvement)}</td> {/* Format date */}
                                    <td>{move.moved_by?.name || 'Système'}</td>
                                    <td>{move.notes || 'Aucune'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showConfirmModal && (
                <ConfirmationModal
                    message={confirmMessage}
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelConfirmation}
                />
            )}
            {showConfirmModal &&
            <ConfirmationModal 
            message={confirmMessage} 
            onConfirm={handleConfirmAction} 
            onCancel={handleCancelConfirmation} 
            ref={confRef} 
            style={cardStyle} />}
        </div>
    );
};

export default PrinterMutationPage;
