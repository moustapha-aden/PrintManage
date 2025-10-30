import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    FiSearch,
    FiPrinter,
    FiAlertCircle,
    FiBarChart,
    FiTool,
    FiCalendar,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiTarget,
    FiBriefcase,
    FiHardDrive,
    FiLoader,
    FiChevronLeft,
    FiChevronRight
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InterventionModal from '../modals/InterventionModal';
import FrequentErrorsPieChart from '../common/FrequentErrorsPieChart';
import '../styles/ManagementPage.css';
import '../styles/AnalysisPage.css';
import { formatDate} from '../../utils/formatters';
import { API_BASE_URL } from '../../api';

const COLORS = ['#FF4081', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4', '#FF9800', '#795548', '#607D8B'];


const AnalysisPage = () => {
    // États pour les données analytiques générales
    const [overviewStats, setOverviewStats] = useState({
        totalInterventions: 0,
        resolvedInterventions: 0,
        pendingInterventions: 0,
        resolutionRate: 0,
        averageResolutionTime: 'N/A'
    });
    const [companyStats, setCompanyStats] = useState([]);
    const [frequentErrors, setFrequentErrors] = useState([]);
    const [printersNeedingAttention, setPrintersNeedingAttention] = useState([]);
    const [interventionsByMonthByType, setInterventionsByMonthByType] = useState([]);
    const [departmentsWithInterventions, setDepartmentsWithInterventions] = useState([]);

    // États pour les listes de filtres complètes
    const [allCompanies, setAllCompanies] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [allPrinters, setAllPrinters] = useState([]);

    const [allInterventions, setAllInterventions] = useState([]);
    
    // États pour les filtres
    const [analysisPeriod, setAnalysisPeriod] = useState('Mois');
    const [filterCompanyId, setFilterCompanyId] = useState('all');
    const [filterDepartmentId, setFilterDepartmentId] = useState('all');
    const [filterPrinterId, setFilterPrinterId] = useState('all');

    // États pour la recherche intelligente (imprimante)
    const [searchTerm, setSearchTerm] = useState('');
    const [foundPrinters, setFoundPrinters] = useState(null);

    // NOUVEAUX ÉTATS POUR LA RECHERCHE ET LA PAGINATION DU TABLEAU
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // NOUVEAUX ÉTATS DE CHARGEMENT SÉPARÉS
    const [loadingOverview, setLoadingOverview] = useState(true);
    const [loadingCompanyStats, setLoadingCompanyStats] = useState(true);
    const [loadingFrequentErrors, setLoadingFrequentErrors] = useState(true);
    const [loadingPrintersAttention, setLoadingPrintersAttention] = useState(true);
    const [loadingInterventionsByMonthByType, setLoadingInterventionsByMonthByType] = useState(true);
    const [loadingDepartmentsWithInterventions, setLoadingDepartmentsWithInterventions] = useState(true);
    const [loadingAllInterventions, setLoadingAllInterventions] = useState(true);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [loadingPrinterSearch, setLoadingPrinterSearch] = useState(false);

    const [error, setError] = useState(null);

    // États pour la modale d'interventions
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInterventions, setModalInterventions] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState('');

    const [isDarkMode, setIsDarkMode] = useState(false);
        const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
    
        // Charger le dark mode au montage
        useEffect(() => {
            const storedTheme = localStorage.getItem('isDarkMode');
            setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
        }, []);
    
    const authToken = localStorage.getItem('authToken');

    // Fonction pour récupérer les listes de filtres
    const fetchFilterLists = useCallback(async () => {
        if (!authToken) return;
        setLoadingFilters(true);
        try {
            const [companiesRes, departmentsRes, printersRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/companies`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/departments`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/printers`, { headers: { Authorization: `Bearer ${authToken}` } })
            ]);
            setAllCompanies(companiesRes.data);
            setAllDepartments(departmentsRes.data);
            setAllPrinters(printersRes.data);
        } catch (err) {
            console.error("Erreur lors du chargement des listes de filtres:", err);
            setError('Erreur lors du chargement des listes de filtres.');
        } finally {
            setLoadingFilters(false);
        }
    }, [API_BASE_URL, authToken]);

    // Fonction asynchrone pour récupérer toutes les données analytiques
    const fetchAnalyticsData = useCallback(async () => {
        setError(null);
        if (!authToken) {
            setError("Non authentifié. Veuillez vous reconnecter.");
            return;
        }

        const headers = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        };

        const queryParams = new URLSearchParams();
        queryParams.append('period', analysisPeriod);
        if (filterCompanyId !== 'all') queryParams.append('company_id', filterCompanyId);
        if (filterDepartmentId !== 'all') queryParams.append('department_id', filterDepartmentId);
        if (filterPrinterId !== 'all') queryParams.append('printer_id', filterPrinterId);
        const queryString = queryParams.toString();

        setLoadingOverview(true);
        setLoadingCompanyStats(true);
        setLoadingFrequentErrors(true);
        setLoadingPrintersAttention(true);
        setLoadingInterventionsByMonthByType(true);
        setLoadingDepartmentsWithInterventions(true);
        setLoadingAllInterventions(true);

        try {
            await Promise.all([
                axios.get(`${API_BASE_URL}/analytics/overview?${queryString}`, { headers }).then(res => {
                    setOverviewStats(res.data);
                    setLoadingOverview(false);
                }),
                axios.get(`${API_BASE_URL}/analytics/companies?${queryString}`, { headers }).then(res => {
                    setCompanyStats(res.data);
                    setLoadingCompanyStats(false);
                }),
                axios.get(`${API_BASE_URL}/analytics/frequent-errors?${queryString}`, { headers }).then(res => {
                    setFrequentErrors(res.data);
                    setLoadingFrequentErrors(false);
                }),
                axios.get(`${API_BASE_URL}/analytics/printers-attention?${queryString}`, { headers }).then(res => {
                    setPrintersNeedingAttention(res.data);
                    setLoadingPrintersAttention(false);
                }),
                axios.get(`${API_BASE_URL}/analytics/interventions-by-type-over-time?${queryString}`, { headers }).then(res => {
                    setInterventionsByMonthByType(res.data);
                    setLoadingInterventionsByMonthByType(false);
                }),
                axios.get(`${API_BASE_URL}/analytics/departments-with-interventions?${queryString}`, { headers }).then(res => {
                    setDepartmentsWithInterventions(res.data);
                    setLoadingDepartmentsWithInterventions(false);
                }),
                axios.get(`${API_BASE_URL}/analytics/all-interventions?${queryString}`, { headers }).then(res => {
                    setAllInterventions(res.data);
                    setCurrentPage(1);
                    setLoadingAllInterventions(false);
                })
            ]);
        } catch (err) {
            console.error("Erreur API Analyses:", err.response ? err.response.data : err.message);
            if (err.response?.status === 401) {
                setError("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                localStorage.removeItem('authToken');
            } else {
                setError('Erreur lors du chargement des données analytiques: ' + (err.response?.data?.message || err.message));
            }
            setLoadingOverview(false);
            setLoadingCompanyStats(false);
            setLoadingFrequentErrors(false);
            setLoadingPrintersAttention(false);
            setLoadingInterventionsByMonthByType(false);
            setLoadingDepartmentsWithInterventions(false);
            setLoadingAllInterventions(false);
        }
    }, [API_BASE_URL, authToken, analysisPeriod, filterCompanyId, filterDepartmentId, filterPrinterId]);

    const searchPrintersLive = useCallback(async (term) => {
        if (!term.trim()) {
            setFoundPrinters(null);
            setError(null);
            return;
        }

        setLoadingPrinterSearch(true);
        setError(null);

        if (!authToken) {
            setError("Non authentifié. Veuillez vous reconnecter.");
            setLoadingPrinterSearch(false);
            return;
        }

        try {
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };
            const response = await axios.get(`${API_BASE_URL}/printers/search?numero_demande=${term}`, { headers });

            if (!response.data || Object.keys(response.data).length === 0) {
                setError(`Aucune imprimante trouvée pour le numéro de demande "${term}".`);
                setFoundPrinters(null);
                return;
            }
            setFoundPrinters(Array.isArray(response.data) ? response.data[0] : response.data);
        } catch (err) {
            console.error("Erreur API Recherche Imprimante:", err.response ? err.response.data : err.message);
            if (err.response?.status === 404) {
                setError(`Aucune imprimante trouvée pour le numéro de demande "${term}".`);
                setFoundPrinters(null);
            } else {
                setError('Erreur lors de la recherche de l\'imprimante: ' + (err.response?.data?.message || err.message));
                setFoundPrinters(null);
            }
        } finally {
            setLoadingPrinterSearch(false);
        }
    }, [API_BASE_URL, authToken]);

    const openInterventionsModal = useCallback(async (id, name, typeOfEntity = 'company') => {
        setModalInterventions([]);
        setModalTitle('');
        setModalType('');
        setError(null);
        setLoadingAllInterventions(true);

        if (!authToken) {
            setError("Non authentifié. Veuillez vous reconnecter.");
            setLoadingAllInterventions(false);
            return;
        }

        try {
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            let response;
            let title = '';

            switch (typeOfEntity) {
                case 'company':
                    response = await axios.get(`${API_BASE_URL}/companies/${id}/interventions`, { headers });
                    title = `Interventions pour la société: ${name}`;
                    break;
                case 'printer':
                    response = await axios.get(`${API_BASE_URL}/printers/${id}/interventions`, { headers });
                    title = `Interventions pour l'imprimante: ${name}`;
                    break;
                case 'department':
                    response = await axios.get(`${API_BASE_URL}/analytics/interventions/department/${id}`, { headers });
                    title = `Interventions pour le département: ${name}`;
                    break;
                default:
                    console.error("Type de modal inconnu:", typeOfEntity);
                    setError("Type d'information non pris en charge.");
                    setLoadingAllInterventions(false);
                    return;
            }

            setModalInterventions(response.data);
            setModalTitle(title);
            setModalType(typeOfEntity);
            setIsModalOpen(true);
        } catch (err) {
            console.error(`Erreur API Interventions (${typeOfEntity}):`, err.response ? err.response.data : err.message);
            setError(`Erreur lors du chargement des interventions pour ${name}: ` + (err.response?.data?.message || err.message));
        } finally {
            setLoadingAllInterventions(false);
        }
    }, [API_BASE_URL, authToken]);

    const closeInterventionsModal = useCallback(() => {
        setIsModalOpen(false);
        setModalInterventions([]);
        setModalTitle('');
        setModalType('');
        setError(null);
    }, []);

    // Gérer le changement du filtre Société, en réinitialisant les filtres suivants
    const handleCompanyChange = useCallback((e) => {
        const companyId = e.target.value;
        setFilterCompanyId(companyId);
        setFilterDepartmentId('all');
        setFilterPrinterId('all');
    }, []);

    // Gérer le changement du filtre Département, en réinitialisant le filtre suivant
    const handleDepartmentChange = useCallback((e) => {
        const departmentId = e.target.value;
        setFilterDepartmentId(departmentId);
        setFilterPrinterId('all');
    }, []);

    // Gérer le changement du filtre Imprimante
    const handlePrinterChange = useCallback((e) => {
        const printerId = e.target.value;
        setFilterPrinterId(printerId);
    }, []);

    const handlePeriodChange = useCallback((period) => {
        setAnalysisPeriod(period);
        setSearchTerm('');
        setFoundPrinters(null);
        setTableSearchTerm('');
        setCurrentPage(1);
        setError(null);
    }, []);

    useEffect(() => {
        fetchFilterLists();
    }, [fetchFilterLists]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchPrintersLive(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchPrintersLive]);

    // Filtrer les départements et les imprimantes en fonction des sélections
    const filteredDepartments = useMemo(() => {
        if (filterCompanyId === 'all') {
            return allDepartments;
        }
        return allDepartments.filter(dept => dept.company_id == filterCompanyId);
    }, [allDepartments, filterCompanyId]);

    const filteredPrinters = useMemo(() => {
        if (filterDepartmentId === 'all') {
            return allPrinters.filter(printer => printer.company_id == filterCompanyId);
        }
        return allPrinters.filter(printer => printer.department_id == filterDepartmentId);
    }, [allPrinters, filterDepartmentId, filterCompanyId]);

    const getStatusIcon = (status) => {
        if (!status) return null;
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'terminée' || lowerStatus === 'résolue' || lowerStatus === 'active') {
            return <FiCheckCircle className="status-icon status-success" />;
        } else if (lowerStatus === 'en cours' || lowerStatus === 'en attente' || lowerStatus === 'maintenance') {
            return <FiClock className="status-icon status-warning" />;
        } else if (lowerStatus === 'hors service' || lowerStatus === 'problème' || lowerStatus === 'inactive') {
            return <FiXCircle className="status-icon status-error" />;
        }
        return null;
    };

    const getResolutionRateColor = useMemo(() => {
        if (overviewStats.resolutionRate >= 90) {
            return 'resolution-rate-high';
        } else if (overviewStats.resolutionRate >= 70) {
            return 'resolution-rate-medium';
        } else {
            return 'resolution-rate-low';
        }
    }, [overviewStats.resolutionRate]);

    const formattedChartData = useMemo(() => {
        if (!Array.isArray(interventionsByMonthByType) || interventionsByMonthByType.length === 0) {
            return [];
        }
        return interventionsByMonthByType.map(item => {
            if (typeof item !== 'object' || item === null || !item.hasOwnProperty('name')) {
                return { name: 'Invalid Data' };
            }
            return { ...item, name: item.name };
        });
    }, [interventionsByMonthByType]);

    const interventionTypes = useMemo(() => {
        const types = new Set();
        if (Array.isArray(interventionsByMonthByType) && interventionsByMonthByType.length > 0) {
            interventionsByMonthByType.forEach(item => {
                for (const key in item) {
                    if (item.hasOwnProperty(key) && key !== 'name') {
                        types.add(key);
                    }
                }
            });
        }
        return Array.from(types);
    }, [interventionsByMonthByType]);

    const filteredAndPaginatedInterventions = useMemo(() => {
        let filtered = allInterventions;

        if (tableSearchTerm) {
            const lowerCaseSearchTerm = tableSearchTerm.toLowerCase();
            filtered = allInterventions.filter(intervention =>
                Object.values(intervention).some(value =>
                    String(value).toLowerCase().includes(lowerCaseSearchTerm)
                ) ||
                (intervention.printer?.model?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (intervention.assigned_to?.name?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (intervention.reported_by?.name?.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

        return {
            currentItems,
            totalPages: Math.ceil(filtered.length / itemsPerPage),
            totalFilteredItems: filtered.length
        };
    }, [allInterventions, tableSearchTerm, currentPage, itemsPerPage]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="management-page-container" style={cardStyle}>
            <div className="management-header" style={cardStyle}>
                <h2>Tableau de Bord Analytique</h2>
                <div className="header-icons"><FiBarChart /></div>
            </div>

            {/* Filtres de période et de société/département */}
            {loadingFilters ? (
                <div className="loading-card-small" style={cardStyle}><FiLoader className="loading-spinner" /><p style={cardStyle}>Chargement des filtres...</p></div>
            ) : (
                <div className="filter-bar analysis-filters" style={cardStyle}>
                    <div className="filter-group" style={cardStyle}>
                        <FiCalendar className="filter-icon" />
                        <label style={cardStyle}>Période:</label>
                        <div className="period-buttons" style={cardStyle}>
                            <button type="button" className={analysisPeriod === 'Semaine' ? 'active' : ''} onClick={() => handlePeriodChange('Semaine')}>Semaine</button>
                            <button type="button" className={analysisPeriod === 'Mois' ? 'active' : ''} onClick={() => handlePeriodChange('Mois')}>Mois</button>
                            <button type="button" className={analysisPeriod === 'Année' ? 'active' : ''} onClick={() => handlePeriodChange('Année')}>Année</button>
                            <button type="button" className={analysisPeriod === 'Total' ? 'active' : ''} onClick={() => handlePeriodChange('Total')}>Total</button>
                        </div>
                    </div>
                    {/* Filtre Société */}
                    <div className="filter-group" style={cardStyle}>
                        <FiBriefcase className="filter-icon" />
                        <label htmlFor="company-filter" style={cardStyle}>Société:</label>
                        <select style={cardStyle} id="company-filter" value={filterCompanyId} onChange={handleCompanyChange}>
                            <option style={cardStyle} value="all">Toutes les sociétés</option>
                            {allCompanies.map(company => (<option style={cardStyle} key={company.id} value={company.id}>{company.name}</option>))}
                        </select>
                    </div>
                    {/* Filtre Département (dépend de la société) */}
                    <div className="filter-group" style={cardStyle}>
                        <FiHardDrive className="filter-icon" />
                        <label style={cardStyle} htmlFor="department-filter">Département:</label>
                        <select style={cardStyle} id="department-filter" value={filterDepartmentId} onChange={handleDepartmentChange} disabled={filterCompanyId === 'all'}>
                            <option style={cardStyle} value="all">Tous les départements</option>
                            {filteredDepartments.map(department => (<option style={cardStyle} key={department.id} value={department.id}>{department.name}</option>))}
                        </select>
                    </div>
                    {/* Filtre Imprimante (dépend du département) */}
                    <div className="filter-group" style={cardStyle}>
                        <FiPrinter className="filter-icon" style={cardStyle}/>
                        <label htmlFor="printer-filter" style={cardStyle}>Imprimante:</label>
                        <select style={cardStyle} id="printer-filter" value={filterPrinterId} onChange={handlePrinterChange} disabled={filterDepartmentId === 'all'}>
                            <option style={cardStyle} value="all">Toutes les imprimantes</option>
                            {filteredPrinters.map(printer => (<option style={cardStyle} key={printer.id} value={printer.id}>{printer.model} ({printer.serialNumber})</option>))}
                        </select>
                    </div>
                </div>
            )}

            {/* Affichage des résultats de recherche */}
            {searchTerm.trim() !== '' && (
                <div className="analysis-section-card search-results-card" style={cardStyle}>
                    {loadingPrinterSearch ? (
                        <p className="loading-message" style={cardStyle}><FiLoader className="loading-spinner-icon" /> Recherche en cours...</p>
                    ) : error ? (
                        <p className="error-message" style={cardStyle}><FiAlertCircle /> {error}</p>
                    ) : foundPrinters ? (
                        <>
                            <h3 style={cardStyle}><FiSearch className="card-icon" /> Résultat de la recherche pour "{searchTerm}"</h3>
                            <div className="printer-attention-card" style={cardStyle}>
                                <h4 style={cardStyle}>{foundPrinters.model} (SN: {foundPrinters.serialNumber})</h4>
                                <p style={cardStyle}>Société: {foundPrinters.company_name}</p>
                                <p style={cardStyle}>État: {getStatusIcon(foundPrinters.status)} <span className={`status-${foundPrinters.status ? foundPrinters.status.toLowerCase().replace(/\s/g, '-') : 'unknown'}`}>{foundPrinters.status || 'Inconnu'}</span></p>
                                <p style={cardStyle}>Numéro de demande: <strong>{foundPrinters.numero_demande || 'N/A'}</strong></p>
                                <p style={cardStyle}>Lieu: {foundPrinters.location || 'N/A'}</p>
                                <p style={cardStyle}>Interventions récentes ({foundPrinters.interventions ? foundPrinters.interventions.length : 0}):</p>
                                {foundPrinters.interventions && foundPrinters.interventions.length > 0 ? (
                                    <ul className="intervention-list"style={cardStyle}>
                                        {foundPrinters.interventions.map(intervention => (
                                            <li key={intervention.id}>
                                                <strong style={cardStyle}>[{new Date(intervention.created_at).toLocaleDateString()}]</strong> {intervention.description} (<strong>{intervention.status}</strong>)
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={cardStyle}>Aucune intervention récente pour cette imprimante.</p>
                                )}
                                <button type="button" className="action-button small" onClick={() => openInterventionsModal(foundPrinters.id, `${foundPrinters.model} (SN: ${foundPrinters.serialNumber})`, 'printer')}>
                                    Voir détails complets
                                </button>
                            </div>
                        </>
                    ) : (
                        <p style={cardStyle}>Saisissez un numéro de demande pour rechercher une imprimante.</p>
                    )}
                </div>
            )}

            {/* Vue d'Ensemble Système */}
            {searchTerm.trim() === '' && (
                <div className="analysis-section-card"style={cardStyle}>
                    <h3 style={cardStyle}><FiBarChart className="card-icon" /> Vue d'Ensemble Système (ce {analysisPeriod.toLowerCase()})</h3>
                    {loadingOverview ? (
                        <div className="loading-card-small" style={cardStyle}><FiLoader className="loading-spinner" /><p style={cardStyle}>Chargement des statistiques...</p></div>
                    ) : (
                        <div className="overview-grid">
                            <div className="overview-item animate-in"><p className="overview-value">{overviewStats.totalInterventions}</p><p className="overview-label">Interventions totales</p></div>
                            <div className="overview-item animate-in delay-1"><p className="overview-value">{overviewStats.resolvedInterventions}</p><p className="overview-label">Interventions résolues</p></div>
                            <div className="overview-item animate-in delay-2"><p className="overview-value">{overviewStats.pendingInterventions}</p><p className="overview-label">En cours/En attente</p></div>
                            <div className="overview-item animate-in delay-3"><p className={`overview-value ${getResolutionRateColor}`}>{overviewStats.resolutionRate}%</p><p className="overview-label">Taux de résolution</p></div>
                            <div className="overview-item animate-in delay-4"><FiTarget className="overview-icon" /><p className="overview-value">{overviewStats.averageResolutionTime}</p><p className="overview-label">Délai moyen de résolution</p></div>
                        </div>
                    )}
                </div>
            )}

            {/* Histogramme des Interventions par Type et par Mois */}
            {searchTerm.trim() === '' && (
                <div className="analysis-section-card" style={cardStyle}>
                    <h3 style={cardStyle}><FiBarChart className="card-icon" /> Interventions par Type et par Période</h3>
                    {loadingInterventionsByMonthByType ? (
                        <div  style={cardStyle}className="loading-card-small"><FiLoader className="loading-spinner" /><p style={cardStyle}>Chargement du graphique...</p></div>
                    ) : formattedChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={formattedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickFormatter={(tick) => (tick && typeof tick === 'string' && tick.match(/^\d{4}-\d{2}$/) ? tick : tick)} />
                                <YAxis domain={[0, 'dataMax + 1']} allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                {interventionTypes.map((type, index) => (<Bar key={type} dataKey={type} fill={COLORS[index % COLORS.length]} />))}
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={cardStyle}>Aucune donnée d'interventions par type et période disponible pour le moment.</p>
                    )}
                </div>
            )}

            {/* Statistiques par Société */}
            {searchTerm.trim() === '' && (
                <div style={cardStyle} className="analysis-section-card">
                    <h3 style={cardStyle}><FiTool className="card-icon" /> Statistiques par Société</h3>
                    {loadingCompanyStats ? (
                        <div style={cardStyle} className="loading-card-small"><FiLoader className="loading-spinner" /><p style={cardStyle}>Chargement des statistiques par société...</p></div>
                    ) : (
                        <div className="company-stats-list">
                            {companyStats.length > 0 ? (
                                companyStats
                                    .filter(company => company.totalInterventions > 0)
                                    .sort((a, b) => b.totalInterventions - a.totalInterventions)
                                    .slice(0, 5)
                                    .map(company => (
                                        <div key={company.id} className="company-stat-item">
                                            <h4>{company.name}</h4>
                                            <p>Imprimantes: {company.printerCount}</p>
                                            <p>Total Interventions: {company.totalInterventions}</p>
                                            <p>Moy. pannes/imprimante: {company.avgFailuresPerPrinter}</p>
                                            <button type="button" className="action-button small" onClick={() => openInterventionsModal(company.id, company.name, 'company')}>
                                                Voir Interventions
                                            </button>
                                        </div>
                                    ))
                            ) : (<p>Aucune statistique de société disponible pour cette période.</p>)}
                        </div>
                    )}
                </div>
            )}

            {/* Pannes Plus Fréquentes */}
            {searchTerm.trim() === '' && (
                <div style={cardStyle} className="analysis-section-card">
                    <h3 style={cardStyle}><FiAlertCircle className="card-icon" /> Pannes Plus Fréquentes</h3>
                    {loadingFrequentErrors ? (
                        <div style={cardStyle} className="loading-card-small"><FiLoader className="loading-spinner" /><p style={cardStyle}>Chargement des erreurs fréquentes...</p></div>
                    ) : frequentErrors.length > 0 ? (
                        <>
                            <FrequentErrorsPieChart data={frequentErrors} totalInterventions={overviewStats.totalInterventions} />
                            <div className="frequent-errors-list" style={{ marginTop: '20px' }}>
                                {frequentErrors.map((error, index) => (
                                    <p key={index}>
                                        <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: COLORS[index % COLORS.length], marginRight: '8px', borderRadius: '50%' }}></span>
                                        {error.intervention_type || error.type}: <strong>{error.count} occurrences</strong> (
                                        {(overviewStats.totalInterventions > 0 ? ((error.count / overviewStats.totalInterventions) * 100) : 0).toFixed(1)}%
                                        )
                                    </p>
                                ))}
                            </div>
                        </>
                    ) : (<p>Aucune panne fréquente enregistrée pour le moment.</p>)}
                </div>
            )}

            {/* Top 5 Départements avec Interventions */}
            {searchTerm.trim() === '' && (
                <div className="analysis-section-card animate-in delay-6" style={cardStyle}>
                    <h3 style={cardStyle}><FiHardDrive /> Top 5 Départements avec Interventions</h3>
                    {loadingDepartmentsWithInterventions ? (
                        <div style={cardStyle} className="loading-card-small"><FiLoader className="loading-spinner" /><p style={cardStyle}>Chargement des départements...</p></div>
                    ) : (
                        <div className="list-container">
                            {departmentsWithInterventions.length > 0 ? (
                                departmentsWithInterventions.map(department => (
                                    <div style={cardStyle} key={department.department_id} className="list-item">
                                        <p style={cardStyle}><strong>Département: {department.department_name}</strong></p>
                                        <p style={cardStyle}>Nombre d'interventions ({analysisPeriod.toLowerCase()}): {department.interventions_count || 0}</p>
                                        <button type="button" className="action-button small" onClick={() => openInterventionsModal(department.department_id, `Département: ${department.department_name}`, 'department')}>
                                            Voir détails
                                        </button>
                                    </div>
                                ))
                            ) : (<p style={cardStyle}>Aucun département avec des interventions pour le moment.</p>)}
                        </div>
                    )}
                </div>
            )}

            {/* Section pour le Grand Tableau de toutes les interventions */}
            {searchTerm.trim() === '' && (
                <div className="analysis-section-card animate-in delay-7" style={cardStyle}>
                    <h3 style={cardStyle}><FiTool /> Toutes les Interventions</h3>
                    <div className="table-controls" style={cardStyle}>
                        <div className="search-bar-table" style={cardStyle}>
                            <FiSearch className="search-icon" />
                            <input
                                style={cardStyle}
                                type="text"
                                placeholder="Rechercher dans le tableau..."
                                value={tableSearchTerm}
                                onChange={(e) => {
                                    setTableSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className="items-per-page-selector" style={cardStyle}>
                            <label style={cardStyle} htmlFor="items-per-page">Afficher :</label>
                            <select style={cardStyle} id="items-per-page" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                <option style={cardStyle} value={5}>5</option>
                                <option style={cardStyle} value={10}>10</option>
                                <option style={cardStyle} value={20}>20</option>
                                <option style={cardStyle} value={50}>50</option>
                            </select>
                        </div>
                    </div>
                    {loadingAllInterventions ? (
                        <div className="loading-card-small"><FiLoader className="loading-spinner" /><p>Chargement de toutes les interventions...</p></div>
                    ) : (
                        <div className="table-responsive">
                            {filteredAndPaginatedInterventions.currentItems.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID Demande</th>
                                            <th>Statut</th>
                                            <th>Type</th>
                                            <th>Créé le</th>
                                            <th>Complété le</th>
                                            <th>Temps Rés. (heure)</th>
                                            <th>Imprimante</th>
                                            <th>N° Série</th>
                                            <th>Compagnie</th>
                                            <th>Département</th>
                                            <th>Assigné à</th>
                                            <th>Signalé par</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndPaginatedInterventions.currentItems.map(intervention => (
                                            <tr key={intervention.id}>
                                                <td>{intervention.numero_demande}</td>
                                                <td><span className={`status-tag status-${intervention.status ? intervention.status.toLowerCase().replace(/\s/g, '-') : 'unknown'}`}>{intervention.status || 'N/A'}</span></td>
                                                <td>{intervention.intervention_type}</td>
                                                <td>{formatDate(intervention.created_at)}</td>
                                                <td>{intervention.end_date ? formatDate(intervention.end_date) : 'N/A'}</td>
                                                <td>{intervention.resolution_time_minutes || 'N/A'}</td>
                                                <td>{intervention.printer?.model ?? 'N/A'}</td>
                                                <td>{intervention.printer?.serial ?? 'N/A'}</td>
                                                <td>{intervention.printer?.company_name ?? 'N/A'}</td>
                                                <td>{intervention.printer?.department_name ?? 'N/A'}</td>
                                                <td>{intervention.assigned_to?.name ?? 'Non assigné'}</td>
                                                <td>{intervention.reported_by?.name ?? 'Inconnu'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (<p>Aucune intervention trouvée pour les filtres actuels ou la recherche.</p>)}

                            {filteredAndPaginatedInterventions.totalPages > 1 && (
                                <div className="pagination">
                                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><FiChevronLeft /> Précédent</button>
                                    {Array.from({ length: filteredAndPaginatedInterventions.totalPages }, (_, i) => i + 1).map(page => (
                                        <button key={page} onClick={() => paginate(page)} className={currentPage === page ? 'active' : ''}>{page}</button>
                                    ))}
                                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === filteredAndPaginatedInterventions.totalPages}>Suivant <FiChevronRight /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <InterventionModal
                isOpen={isModalOpen}
                onClose={closeInterventionsModal}
                title={modalTitle}
                interventions={modalInterventions}
                type={modalType}
            />
        </div>
    );
};

export default AnalysisPage;
