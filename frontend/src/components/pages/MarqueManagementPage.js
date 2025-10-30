import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiPlusCircle, FiEdit, FiTrash2, FiAlertCircle, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';
import AddBrandForm from '../forms/AddBrandForm';
import ConfirmationModal from '../modals/ConfirmationModal';

import { API_BASE_URL } from '../../api';

// Ligne de tableau pour une marque
const BrandTableRow = React.memo(({ brand, onEdit, onDelete }) => (
    <tr>
        <td>{brand.name}</td>
        <td>
            <div className="table-actions">
                <button className="icon-button" onClick={() => onEdit(brand)} title="Modifier"><FiEdit /></button>
                <button className="icon-button trash" onClick={() => onDelete(brand.id)} title="Supprimer"><FiTrash2 /></button>
            </div>
        </td>
    </tr>
));

const MarqueManagementPage = () => {
    const [brands, setBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBrandForm, setShowBrandForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const brandFormRef = useRef(null);
    const confRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // États pour la pagination côté serveur
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalBrandsCount, setTotalBrandsCount] = useState(0);
    const [brandsPerPage, setBrandsPerPage] = useState(10);

    const API_BRANDS_URL = `${API_BASE_URL}/brands`;
    const authToken = localStorage.getItem('authToken');
    const currentUserRole = localStorage.getItem('userRole');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
        // Charger le dark mode au montage
        useEffect(() => {
            const storedTheme = localStorage.getItem('isDarkMode');
            setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
        }, []);
    
    // Vérifie le rôle de l'utilisateur
    useEffect(() => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à accéder à cette page.");
            setLoading(false);
        }
    }, [currentUserRole]);

    /**
     * @brief Fetches brands from the API with pagination and search filters.
     * @param {string} searchTermParam - The search term to filter brands by.
     * @param {number} page - The page number to fetch.
     * @param {number} perPage - The number of brands per page.
     */
    const fetchBrands = useCallback(async (page, perPage, searchTermParam) => {
        setError(null);
        setLoading(true);
        try {
            if (!authToken) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                setBrands([]);
                setLoading(false);
                return;
            }

            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
            const queryParams = new URLSearchParams();
            queryParams.append('page', page);
            queryParams.append('per_page', perPage);
            if (searchTermParam.trim() !== '') {
                queryParams.append('search_term', searchTermParam);
            }

            const url = `${API_BRANDS_URL}?${queryParams.toString()}`;
            const response = await axios.get(url, { headers });
            
            // Assurez-vous que la réponse API est bien paginée (comme Laravel)
            if (response.data && Array.isArray(response.data.data)) {
                setBrands(response.data.data);
                setTotalBrandsCount(response.data.total);
                setLastPage(response.data.last_page);
            } else {
                // Fallback pour une API non paginée, mais la logique ci-dessus est la cible
                setBrands(response.data);
                setTotalBrandsCount(response.data.length);
                setLastPage(1);
            }
        } catch (err) {
            console.error("Erreur API marques:", err.response ? err.response.data : err.message);
            setError("Erreur lors du chargement des marques: " + (err.response?.data?.message || err.message));
            setBrands([]);
        } finally {
            setLoading(false);
        }
    }, [authToken, API_BRANDS_URL]);

    // Hook pour déclencher le fetch initial et les recherches/changements de pagination
    useEffect(() => {
        if (currentUserRole !== 'admin') return;
        
        // Effacer le timeout précédent s'il existe
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Mettre en place un nouveau timeout de 500ms
        searchTimeoutRef.current = setTimeout(() => {
            fetchBrands(currentPage, brandsPerPage, searchTerm);
        }, 500);

        // Cleanup function pour effacer le timeout si le composant est démonté
        return () => clearTimeout(searchTimeoutRef.current);
    }, [fetchBrands, searchTerm, brandsPerPage, currentPage, currentUserRole]);
    
    // Formulaire ajout/édition
    const handleOpenAddBrandForm = () => { setEditingBrand(null); setShowBrandForm(true); setError(null); };
    const handleOpenEditBrandForm = (brand) => { setEditingBrand(brand); setShowBrandForm(true); setError(null); };
    const handleCloseBrandForm = () => { setShowBrandForm(false); setEditingBrand(null); setError(null); };

    const handleSaveBrand = async (brandData) => {
        if (!authToken) return;
        setLoading(true);
        try {
            const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` };
            if (editingBrand) {
                await axios.put(`${API_BRANDS_URL}/${editingBrand.id}`, brandData, { headers });
            } else {
                await axios.post(API_BRANDS_URL, brandData, { headers });
            }
            await fetchBrands(currentPage, brandsPerPage, searchTerm);
            setShowBrandForm(false);
            setEditingBrand(null);
            toast.success(editingBrand ? "Marque modifiée !" : "Marque ajoutée !");
        } catch (err) {
            console.error("Erreur SAVE marque:", err.response ? err.response.data : err.message);
            toast.error('Erreur lors de la sauvegarde de la marque.');
        } finally {
            setLoading(false);
        }
    };

    // Suppression
    const handleDeleteBrand = (brandId) => {
        setConfirmMessage('Êtes-vous sûr de vouloir supprimer cette marque ?');
        setConfirmAction(() => async () => {
            setLoading(true);
            try {
                const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
                await axios.delete(`${API_BRANDS_URL}/${brandId}`, { headers });
                await fetchBrands(currentPage, brandsPerPage, searchTerm);
                toast.success("Marque supprimée !");
            } catch (err) {
                console.error("Erreur DELETE marque:", err.response ? err.response.data : err.message);
                toast.error('Échec de la suppression de la marque.');
            } finally {
                setLoading(false);
            }
        });
        setShowConfirmModal(true);
    };

    const handleConfirmAction = () => { if (confirmAction) confirmAction(); setShowConfirmModal(false); setConfirmAction(null); setConfirmMessage(''); };
    const handleCancelConfirmation = () => { setShowConfirmModal(false); setConfirmAction(null); setConfirmMessage(''); };

    // Logique de changement de page et du nombre d'éléments par page
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
        }
    }, [lastPage]);

    const handleBrandsPerPageChange = useCallback((e) => {
        setBrandsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1); // Retour à la première page
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Réinitialise à la page 1 pour la nouvelle recherche
    };
    
    if (loading) return (<div style={cardStyle} className="management-page-container loading-overlay"><FiLoader className="loading-spinner-icon" /><p>Chargement des marques...</p></div>);
    if (error) return (<p className="management-page-container alert alert-error"><FiAlertCircle className="alert-icon" /><p>Erreur: {error}</p></p>);

    return (
        <div className="management-page-container"style={cardStyle}>
            <div className="management-header" style={cardStyle}><h2 style={cardStyle}>Gestion des Marques</h2></div>

            <div className="filter-bar"style={cardStyle}>
                <div className="search-input"style={cardStyle}>
                    <FiSearch />
                    <input style={cardStyle} type="text" placeholder="Rechercher par nom..." value={searchTerm} onChange={handleSearchChange} />
                </div>
            </div>

            <section className="management-section"style={cardStyle}>
                <div className="section-header"style={cardStyle}>
                    <h3 style={cardStyle}>Marques</h3>
                    {currentUserRole === 'admin' && (
                        <button style={cardStyle} className="new-button" onClick={handleOpenAddBrandForm}><FiPlusCircle /> Nouvelle Marque</button>
                    )}
                </div>
                <div className="table-responsive" style={cardStyle}>
                    <table className="data-table" style={cardStyle}>
                        <thead style={cardStyle}>
                            <tr style={cardStyle}><th>Nom de la Marque</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {brands.length > 0 ? (
                                brands.map((brand) => (
                                    <BrandTableRow key={brand.id} brand={brand} onEdit={handleOpenEditBrandForm} onDelete={handleDeleteBrand} />
                                ))
                            ) : (
                                <tr><td colSpan="2" style={{ textAlign: 'center' }}>Aucune marque trouvée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {brands.length > 0 && totalBrandsCount > 0 && (
                    <div className="pagination-controls"style={cardStyle}>
                        <div className="items-per-page"style={cardStyle}>
                            <label htmlFor="perPage"style={cardStyle}>Marques par page:</label>
                            <select style={cardStyle} id="perPage" value={brandsPerPage} onChange={handleBrandsPerPageChange}>
                                <option style={cardStyle} value={5}>5</option>
                                <option style={cardStyle} value={10}>10</option>
                                <option style={cardStyle} value={20}>20</option>
                                <option style={cardStyle} value={50}>50</option>
                            </select>
                        </div>
                        <div className="page-navigation" style={cardStyle}>
                            <button
                                style={cardStyle}
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-button"
                            >
                                <FiChevronLeft />
                            </button>
                            <span className="page-info" style={cardStyle}>
                                Page {currentPage} sur {lastPage} ({totalBrandsCount} au total)
                            </span>
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className="pagination-button"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {showBrandForm && <AddBrandForm brandToEdit={editingBrand} onSave={handleSaveBrand} onCloseForm={handleCloseBrandForm} setError={setError} ref={brandFormRef} style={cardStyle} />}
            {showConfirmModal && <ConfirmationModal message={confirmMessage} onConfirm={handleConfirmAction} onCancel={handleCancelConfirmation} ref={confRef} style={cardStyle}  />}
        </div>
    );
};

export default MarqueManagementPage;