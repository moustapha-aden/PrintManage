import React, { useState, useEffect, useMemo,useRef} from 'react';
import axios from 'axios';
import PrinterCard from './PrinterCard'; // Assuming PrinterCard is in components folder
import '../styles/ManagementPage.css'; // Reusing general management styles
import PrinterDetailModal from '../modals/PrinterDetailModal';
import { API_BASE_URL } from '../../api';

const ClientPrintersPage = () => {
    const [printers, setPrinters] = useState([]);
    const [clientDepartmentId, setClientDepartmentId] = useState(null);
    const [clientCompanyId, setClientCompanyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPrinter, setSelectedPrinter] = useState(null);
    const detailRef=useRef(null)

    const currentUserId = localStorage.getItem('userId');
    const currentUserRole = localStorage.getItem('userRole'); // Should be 'client' here
    const [isDarkMode, setIsDarkMode] = useState(false);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
        // Charger le dark mode au montage
        useEffect(() => {
            const storedTheme = localStorage.getItem('isDarkMode');
            setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
        }, []);

    // 1. Fetch the client's department ID
    useEffect(() => {
        const fetchClientDepartment = async () => {
            if (!currentUserId) {
                setError("ID client non trouvé. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('authToken');
                // Fetch the client's user data to get their department_id
                const response = await axios.get(`${API_BASE_URL}/users/${currentUserId}?with=department`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const clientData = response.data;
                if (clientData.department_id) {
                    setClientDepartmentId(clientData.department_id);
                } else if (clientData.company_id) {
                    setClientCompanyId(clientData.company_id);
                } else {
                    setError("Ni département ni société trouvés pour ce client.");
                    setLoading(false);
                }
            } catch (err) {
                setError("Erreur lors du chargement des informations du client.");
                console.error("Erreur API client:", err.response ? err.response.data : err.message);
                setLoading(false);
            }
        };

        fetchClientDepartment();
    }, [currentUserId]); // Depend on currentUserId to re-fetch if it changes

    // 2. Fetch printers filtered by the client's department ID
    useEffect(() => {
        const fetchPrinters = async () => {
            if (!clientDepartmentId && !clientCompanyId) {
                return;
            }
            setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            let url;
            if (clientDepartmentId) {
                url = `${API_BASE_URL}/printers?with=company,department&department_id=${clientDepartmentId}`;
            } else {
                url = `${API_BASE_URL}/printers?with=company,department&company_id=${clientCompanyId}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrinters(response.data);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des imprimantes.');
            console.error("Erreur API imprimantes:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchPrinters();
}, [clientDepartmentId, clientCompanyId]);

    // Filtering logic for search term (client-side filter)
    const filteredPrinters = useMemo(() => {
        if (!searchTerm) {
            return printers;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return printers.filter(printer =>
            String(printer.id).includes(lowerCaseSearchTerm) ||
            (printer.model && printer.model.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (printer.brand && printer.brand.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (printer.serial && printer.serial.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (printer.status && printer.status.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (printer.company?.name && printer.company.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (printer.department?.name && printer.department.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (printer.installDate && printer.installDate.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }, [printers, searchTerm]);

    // if (loading) {
    //     return <div className="management-page-container">Chargement de vos imprimantes...</div>;
    // }

    const handleViewPrinterDetails = async (printer) => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError("Non authentifié. Veuillez vous reconnecter.");
                    return;
                }
                const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` };
               const response = await axios.get(`${API_BASE_URL}/printers/${printer.id}?with=company,department,interventions,interventions.technician`, { headers });
                setSelectedPrinter(response.data);
            } catch (err) {
                console.error("Erreur lors du chargement des détails de l'imprimante:", err.response ? err.response.data : err.message);
                setError("Erreur lors du chargement des détails de l'imprimante.");
            }
        };
    
        const handleClosePrinterDetails = () => {
            setSelectedPrinter(null);
        };
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

    if (error) {
        return <p className="management-page-container" style={{ ...cardStyle, color: 'red' }}>Erreur: {error}</p>;
    }

    return (
        <div className="management-page-container" style={{ ...cardStyle }}>
            <div className="management-header">
                <h2>Mes Imprimantes</h2>
                {/* Clients do not have "Add Printer" button */}
            </div>

            <div className="filter-bar" style={{ ...cardStyle }}>
                <div className="search-input" style={{ ...cardStyle }}>
                    <input
                        style={{ ...cardStyle }}
                        type="text"
                        placeholder="Rechercher par modèle, marque, numéro de série..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* No status/company/department filters for clients, as they only see their own */}
            </div>

            <div className="printer-cards-grid" style={{ ...cardStyle }}>
                {filteredPrinters.length > 0 ? (
                    filteredPrinters.map((printer) => (
                        <PrinterCard
                            style={cardStyle}
                            key={printer.id}
                            printer={printer}
                            // Clients cannot edit or delete printers, so pass null/undefined for these props
                            onEdit={null}
                            onDelete={null}
                            currentUserRole={currentUserRole} // Pass role to PrinterCard for button visibility
                            onCardClick={handleViewPrinterDetails}
                        />
                    ))
                ) : (
                    <p style={{ ...cardStyle }}>Aucune imprimante trouvée pour votre département.</p>
                )}
            </div>

            {selectedPrinter && (
                            <PrinterDetailModal
                                style={cardStyle }
                                printer={selectedPrinter}
                                onClose={handleClosePrinterDetails}
                                ref={detailRef} 
                            />
                        )}
        </div>
    );
};

export default ClientPrintersPage;
