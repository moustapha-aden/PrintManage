import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import {
    FiPlusCircle,
    FiLoader,
    FiAlertCircle,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
    FiRotateCw,
    FiFileText, // Ajout de l'icône pour le rapport
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';
import AddQuotaForm from '../forms/AddQuotaForm';
import QuotaCard from '../modals/QuotaCard';
import ConfirmationModal from '../modals/ConfirmationModal';
import ReportModal from '../modals/ReportModal'; // Importation du nouveau modal

import { API_BASE_URL } from '../../api';

const QuotaManagementPage = () => {
    const [quotas, setQuotas] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [printers, setPrinters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingQuota, setEditingQuota] = useState(null);
    const [isediting, setIsediting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const confRef = useRef(null);
    const [filterCompanyId, setFilterCompanyId] = useState('all');
    const [filterDepartmentId, setFilterDepartmentId] = useState('all');
    const [filterMonth, setFilterMonth] = useState('');
    const [totalQuota,setTotalQuota]=useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showReportModal, setShowReportModal] = useState(false); // Nouvel état pour le modal de rapport
    const formRef = useRef(null);
    const RapRef = useRef(null);

    const currentUserRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');

    const API_QUOTAS_URL = `${API_BASE_URL}/quotas`;
    const API_COMPANIES_URL = `${API_BASE_URL}/companies`;
    const API_DEPARTMENTS_URL = `${API_BASE_URL}/departments`;
    const API_PRINTERS_URL = `${API_BASE_URL}/printers`;

        const [isDarkMode, setIsDarkMode] = useState(false);
        const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
    
        // Charger le dark mode au montage
        useEffect(() => {
            const storedTheme = localStorage.getItem('isDarkMode');
            setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
        }, []);

    // Fonction existante pour générer un rapport par imprimante (inchangée)
    // Dans QuotaManagementPage.js
const handleGenerateReport = useCallback(async (quotaId) => {
    setError(null);
    try {
        if (!authToken) throw new Error("Non authentifié");

        // 🚨 NOUVELLE URL : Requête sur la ressource du Quota spécifique
        // Il faut définir une nouvelle route API pour cela (voir Section 2)
        const reportUrl = `${API_BASE_URL}/quotas/${quotaId}/report`; 

        const headers = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        };
        const response = await axios.get(reportUrl, { headers, responseType: 'blob' });

        // ... (Le reste de la logique pour créer le Blob et télécharger reste identique)
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `rapport_quota_${quotaId}.pdf`; // Nom de fichier plus précis
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("Erreur API de rapport:", err.response ? err.response.data : err.message);
        setError('Erreur lors de la génération du rapport : ' + (err.response?.data?.message || err.message));
    }
}, [authToken]);

    // Nouvelle fonction pour gérer la génération de rapport global à partir des données du modal
    const handleGenerateGroupReport = useCallback(
        async ({ startDate, endDate, filterType, filterId }) => {
            setShowReportModal(false); // Fermer le modal
            setError(null);

            // --- DEBUT DES AJOUTS POUR LE NOM DE FICHIER ---

            // Fonction utilitaire pour nettoyer la chaîne pour un nom de fichier (slug)
            const slugify = (text) => {
                if (!text) return 'global';
                return text.toString().toLowerCase()
                    .replace(/\s+/g, '_')           // Remplacer les espaces par des tirets bas
                    .replace(/[^\w\-]+/g, '')       // Retirer tous les caractères non-alphanumériques
                    .replace(/\-\-+/g, '_')         // Remplacer les tirets multiples par un seul tiret bas
                    .replace(/^-+/, '')             // Retirer les tirets en début de chaîne
                    .replace(/-+$/, '');            // Retirer les tirets en fin de chaîne
            };

            let namePart = 'global';
            let companyName = '';
            let departmentName = '';

            if (filterType === "company" && filterId !== "all") {
                const company = companies.find(c => c.id === parseInt(filterId));
                companyName = company ? slugify(company.name) : 'societe_inconnue';
                namePart = companyName;
            } else if (filterType === "department" && filterId !== "all") {
                const department = departments.find(d => d.id === parseInt(filterId));
                departmentName = department ? slugify(department.name) : 'departement_inconnu';
                // Si on filtre par département, essayons de trouver sa compagnie mère si possible
                const printerWithDept = printers.find(p => p.department_id === parseInt(filterId));
                if (printerWithDept && printerWithDept.company) {
                    companyName = slugify(printerWithDept.company.name);
                    namePart = `${companyName}_${departmentName}`;
                } else {
                    namePart = departmentName;
                }
            }

            // Formatage des dates pour le nom du fichier (Afin d'être sûr d'avoir YYYY_MM_DD)
            const start = startDate ? startDate.replace(/-/g, '_') : 'debut';
            const end = endDate ? endDate.replace(/-/g, '_') : 'fin';
            const datePart = `${start}_a_${end}`;

            // Exemple de nom de fichier final : rapport_global_NOM_SOCIETE_DEBUT_a_FIN.pdf
            const finalFileName = `rapport_global_${namePart}_${datePart}.pdf`;

            // --- FIN DES AJOUTS POUR LE NOM DE FICHIER ---

            try {
                if (!authToken) throw new Error("Non authentifié");
                if (!startDate || !endDate) {
                    setError("Veuillez sélectionner une date de début et de fin.");
                    return;
                }

                const headers = {
                    Accept: "application/json",
                    Authorization: `Bearer ${authToken}`,
                };

                const queryParams = new URLSearchParams();
                queryParams.append("start_date", startDate);
                queryParams.append("end_date", endDate);

                if (filterType === "company" && filterId !== "all") {
                    queryParams.append("company_id", filterId);
                }
                if (filterType === "department" && filterId !== "all") {
                    queryParams.append("department_id", filterId);
                }

                const reportUrl = `${API_BASE_URL}/quotas/report?${queryParams.toString()}`;

                // Récupérer le PDF
                const response = await axios.get(reportUrl, { headers, responseType: "blob" });

                if (!response.data || response.data.size === 0) {
                    setError("Aucun quota trouvé pour ces critères.");
                    return;
                }

                // Créer un blob et forcer le téléchargement
                const blob = new Blob([response.data], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);

                // Ouvrir dans un nouvel onglet
                window.open(url, "_blank");

                // Téléchargement automatique
                const link = document.createElement("a");
                link.href = url;
                
                // --- UTILISATION DU NOUVEAU NOM DE FICHIER ICI ---
                link.download = finalFileName; 
                // --- FIN DE L'UTILISATION DU NOUVEAU NOM DE FICHIER ---
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error(
                    "Erreur API de rapport groupé:",
                    err.response ? err.response.data : err.message
                );
                setError(
                    "Erreur lors de la génération du rapport : " +
                    (err.response?.data?.message || err.message)
                );
            }
        },
        [authToken, companies, departments, printers] // Ajouter les dépendances nécessaires
    );


    // Fetch quotas
    const fetchQuotas = useCallback(async (companyId = 'all', departmentId = 'all', mois = '') => {
    setError(null);
    setLoading(true);
    try {
        if (!authToken) throw new Error("Non authentifié");
        const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
        const queryParams = new URLSearchParams();

        if (companyId !== 'all') queryParams.append('company_id', companyId);
        if (departmentId !== 'all') queryParams.append('department_id', departmentId);
        if (mois) queryParams.append('mois', mois);

        const url = `${API_QUOTAS_URL}?${queryParams.toString()}`;
        const response = await axios.get(url, { headers });
        setQuotas(response.data);
        setTotalQuota(response.data.length);
        setCurrentPage(1);
    } catch (err) {
        console.error("Erreur API quotas:", err.response ? err.response.data : err.message);
        setError(err.message || 'Erreur lors du chargement des quotas');
        setQuotas([]);
    } finally {
        setLoading(false);
    }
}, [authToken]);

    // Fetch companies
    const fetchCompanies = useCallback(async () => {
        try {
            if (!authToken) return;
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
            const response = await axios.get(API_COMPANIES_URL, { headers });
            setCompanies(response.data);
        } catch (err) {
            console.error("Erreur API sociétés:", err);
            setCompanies([]);
        }
    }, [authToken]);

    // Fetch departments
    const fetchDepartments = useCallback(async () => {
        try {
            if (!authToken) return;
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
            const response = await axios.get(API_DEPARTMENTS_URL, { headers });
            setDepartments(response.data);
        } catch (err) {
            console.error("Erreur API départements:", err);
            setDepartments([]);
        }
    }, [authToken]);

    // Fetch printers
    const fetchPrinters = useCallback(async () => {
        try {
            if (!authToken) return;
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
            const response = await axios.get(`${API_PRINTERS_URL}?include=company,department`, { headers });
            setPrinters(response.data);
        } catch (err) {
            console.error("Erreur API printers:", err);
            setPrinters([]);
        }
    }, [authToken]);

    const filteredDepartments = useMemo(() => {
    if (!filterCompanyId || filterCompanyId === 'all') return departments;
    return departments.filter(d => d.company_id === parseInt(filterCompanyId));
}, [departments, filterCompanyId]);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            await fetchPrinters();
            await fetchQuotas();
            await fetchCompanies();
            await fetchDepartments();
        };
        loadInitialData();
    }, [fetchQuotas, fetchCompanies, fetchDepartments, fetchPrinters]);

    // Scroll vers formulaire
    useEffect(() => {
        if (showForm && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    
     useEffect(() => {
        if (showReportModal && RapRef.current) {
            RapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [showReportModal]);

    // Map printers on quotas
    const quotasWithPrinters = useMemo(() => {
        return quotas.map(quota => {
            const printer = printers.find(p => p.id === quota.printer_id);
            return { ...quota, printer };
        });
    }, [quotas, printers]);

    // Search and filter
    const filteredQuotas = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return quotasWithPrinters.filter(quota => {
            const companyName = quota.printer?.company?.name?.toLowerCase() || '';
            const departmentName = quota.printer?.department?.name?.toLowerCase() || '';
            return (
                lowerSearch === '' ||
                String(quota.id).includes(lowerSearch) ||
                (quota.description && quota.description.toLowerCase().includes(lowerSearch)) ||
                companyName.includes(lowerSearch) ||
                departmentName.includes(lowerSearch)
            );
        });
    }, [quotasWithPrinters, searchTerm]);

    const formatMonthLabel = (monthValue) => {
    if (!monthValue) return '';
    const [year, month] = monthValue.split('-');
    const date = new Date(year, month - 1);
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
};

    // Pagination
    const totalPages = Math.ceil(filteredQuotas.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredQuotas.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = pageNumber => {
        if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    // Handlers
    const handleSearchChange = e => { setSearchTerm(e.target.value); setCurrentPage(1); };
    const handleOpenAddForm = () => { if (currentUserRole !== 'admin') { setError("Non autorisé"); return; } setEditingQuota(null); setShowForm(true); setError(null); };
    const handleOpenEditForm = (quota) => {
        if (currentUserRole !== 'admin') {
            setError("Non autorisé");
            return;
        }
        if (!quota || !quota.printer || !quota.printer.id) {
            setError("Impossible d'éditer ce quota, données manquantes.");
            return;
        }
        const quotaData = {
            id: quota.id,
            printer_id: quota.printer.id,
            monthly_quota_bw: quota.monthly_quota_bw,
            monthly_quota_color: quota.monthly_quota_color,
            total_quota: quota.total_quota || quota.monthly_quota_bw + quota.monthly_quota_color,
            mois:quota.mois,
            date_prelevement:quota.date_prelevement,
        };
        setEditingQuota(quotaData);
        setShowForm(true);
        setError(null);
    };

    const handleSaveQuota = async (quotaData) => {
        console.log("donnes a modifie ",quotaData);
        if (currentUserRole !== 'admin') {
            setError("Non autorisé");
            return;
        }
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };
            quotaData.total_quota = (quotaData.monthly_quota_bw || 0) + (quotaData.monthly_quota_color || 0);
            console.log("lors de mise a jpur",editingQuota);
            if (editingQuota) {
                await axios.put(`${API_QUOTAS_URL}/${editingQuota.id}`, quotaData, { headers });
            } else {
                await axios.post(API_QUOTAS_URL, quotaData, { headers });
            }
            await fetchQuotas(filterCompanyId);
            setShowForm(false);
            setEditingQuota(null);
            setError(null);
        } catch (err) {
            console.error("Erreur API SAVE:", err.response ? err.response.data : err.message);
            setError('Erreur lors de la sauvegarde du quota: ' + (err.response?.data?.message || err.message));
        }
    };
    const handleDeleteQuota = quotaId => {
        if (currentUserRole !== 'admin') { setError("Non autorisé"); return; }
        setConfirmMessage('Êtes-vous sûr de vouloir supprimer ce quota ?');
        setConfirmAction(() => async () => {
            try { const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` }; await axios.delete(`${API_QUOTAS_URL}/${quotaId}`, { headers }); await fetchQuotas(filterCompanyId); setError(null); }
            catch (err) { console.error("Erreur API DELETE:", err.response ? err.response.data : err.message); setError('Erreur suppression: ' + (err.response?.data?.message || err.message)); }
        });
        setShowConfirmModal(true);
    };
    const handleCloseForm = () => { setShowForm(false); setEditingQuota(null); setError(null); };
    const handleConfirmAction = () => { if (confirmAction) confirmAction(); setShowConfirmModal(false); setConfirmAction(null); setConfirmMessage(''); };
    const handleCancelConfirmation = () => { setShowConfirmModal(false); setConfirmAction(null); setConfirmMessage(''); };

    if (loading) return (<div style={cardStyle} className="management-page-container loading-overlay"><FiLoader className="loading-spinner-icon" /><p>Chargement des quotas...</p></div>);
    if (error) return (<p className="alert alert-error"><FiAlertCircle className="alert-icon" /><p>Erreur: {error}</p></p>);

    return (
        <div className="management-page-container" style={cardStyle} >
            <div className="management-header" style={cardStyle} >
                <h2>Managed Print Services</h2>
                {currentUserRole === 'admin' && (
                    <div className="action-buttons" >
                        <button className="new-button" onClick={handleOpenAddForm}>
                            <FiPlusCircle /> Nouveau Relever
                        </button>
                        <button className="new-button report-button" onClick={() => setShowReportModal(true)} style={{ margin:12 }}>
                            <FiFileText /> Rapport G.Societe(Dept)
                        </button>
                    </div>
                )}
            </div>

            <div className="filter-bar" style={cardStyle} >
                <div style={cardStyle}  className="search-input">
                    <FiSearch />
                    <input
                        style={cardStyle} 
                        type="text"
                        placeholder="Rechercher par société, description..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <select style={cardStyle}  value={filterCompanyId} onChange={e => { setFilterCompanyId(e.target.value); fetchQuotas(e.target.value); }}>
                    <option style={cardStyle}  value="all">Toutes les sociétés</option>
                    {companies.map(c => <option style={cardStyle}  key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {/* Filtre département */}
                <select
                        style={cardStyle} 
                        value={filterDepartmentId} 
                        onChange={e => { 
                            setFilterDepartmentId(e.target.value); 
                            fetchQuotas(filterCompanyId, e.target.value, filterMonth); 
                        }}
                    >
                        <option style={cardStyle}  value="all">Tous les départements</option>
                        {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                {/* Filtre mois */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        marginRight: '1rem',
                        alignItems:'center',
                        fontFamily: 'Inter, sans-serif',
                        ...cardStyle,
                    }}
                >
                    <label
                        htmlFor="filter-month"
                        style={{
                            fontSize: '0.85rem',
                            color: '#333',
                            margin:"5px",
                            marginBottom: '0.25rem',
                            ...cardStyle,
                        }}
                    >
                        Mois :
                    </label>
                    <input
                        
                        type="month"
                        id="filter-month"
                        value={filterMonth}
                        onChange={e => {
                            setFilterMonth(e.target.value);
                            fetchQuotas(filterCompanyId, filterDepartmentId, e.target.value);
                        }}
                        style={{
                            padding: '0.4rem 0.6rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            ...cardStyle,
                        }}
                    />
                </div>



                <button onClick={() => fetchQuotas(filterCompanyId, filterDepartmentId, filterMonth)} className="refresh-button">
                    <FiRotateCw />
                </button>
            </div>

            <div className="items-per-page-selector" style={cardStyle} >
                <label htmlFor="items-per-page"style={cardStyle} >Afficher :</label>
                <select style={cardStyle}  id="items-per-page" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                    <option style={cardStyle}  value={5}>5</option>
                    <option style={cardStyle}  value={10}>10</option>
                    <option style={cardStyle}  value={20}>20</option>
                    <option style={cardStyle}  value={50}>50</option>
                </select>
                <p style={{ fontSize: '0.85rem', ...cardStyle }} >(Total Quotas: {totalQuota})</p>
            </div>

            <div className="quota-cards-grid" style={cardStyle} >
                {currentItems.length > 0 ? currentItems.map(quota => (
                    <QuotaCard
                        style={cardStyle} 
                        key={quota.id}
                        quota={quota}
                        onEdit={handleOpenEditForm}
                        onDelete={handleDeleteQuota}
                        onGenerateReport={() => handleGenerateReport(quota.id)}
                        companyName={quota.printer?.company?.name || 'N/A'}
                        departmentName={quota.printer?.department?.name || 'N/A'}
                        currentUserRole={currentUserRole}
                    />
                )) : <p style={cardStyle} >Aucun quota trouvé avec les critères actuels.</p>}
            </div>

            {totalPages > 1 && (
                <div className="pagination" style={cardStyle} >
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}style={cardStyle} ><FiChevronLeft /> Précédent</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => paginate(page)} className={currentPage === page ? 'active' : ''}>{page}</button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} style={cardStyle} >Suivant <FiChevronRight /></button>
                </div>
            )}

            {showForm && (
                <AddQuotaForm
                    style={cardStyle}
                    quotaToEdit={editingQuota}
                    onSave={handleSaveQuota}
                    onCloseForm={handleCloseForm}
                    printers={printers}
                    ref={formRef}
                    setIsediting={setIsediting}
                />
            )}
            {showConfirmModal && <ConfirmationModal message={confirmMessage} onConfirm={handleConfirmAction} onCancel={handleCancelConfirmation} ref={confRef} />}

            {/* AFFICHE LE MODAL DE RAPPORT SI L'ÉTAT showReportModal EST VRAI */}
            {showReportModal && (
                <ReportModal 
                    style={cardStyle} 
                    companies={companies} 
                    departments={departments} 
                    onGenerate={handleGenerateGroupReport} 
                    onClose={() => setShowReportModal(false)} 
                    ref={RapRef}
                />
            )}
        </div>
    );
};

export default QuotaManagementPage;