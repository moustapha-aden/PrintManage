import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
    FiPlusCircle,
    FiAlertCircle,
    FiChevronLeft,
    FiChevronRight,
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';
import AddMaterielForm from '../forms/AddMaterielForm'; // ✅ Correction : formulaire dédié au matériel
import ConfirmationModal from '../modals/ConfirmationModal';
import MaterielDetailModal from '../modals/MaterielDetailModal';
import { API_BASE_URL } from '../../api';
import MaterielTable from '../modals/MaterielTable';

const MaterielManagementPage = () => {
    const location = useLocation();
    const [materiel, setMateriel] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingMateriel, setEditingMateriel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmPayload, setConfirmPayload] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const [selectedMateriel, setSelectedMateriel] = useState(null);

    const formRef = useRef(null);
    const confRef = useRef(null);
    const detailRef = useRef(null);

    const [isDarkMode, setIsDarkMode] = useState(false);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};

    useEffect(() => {
        const storedTheme = localStorage.getItem('isDarkMode');
        setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
    }, []);

    const currentUserRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');
    const API_MATERIEL_URL = `${API_BASE_URL}/materiel`;

    const fetchMateriel = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!authToken) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                setMateriel([]);
                return;
            }

            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            const response = await axios.get(API_MATERIEL_URL, { headers });
            setMateriel(response.data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Erreur API:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 401) {
                setError("Session expirée ou non autorisée. Veuillez vous reconnecter.");
                localStorage.removeItem('authToken');
            } else {
                setError("Erreur lors du chargement des matériels: " + (err.response?.data?.message || err.message));
            }
            setMateriel([]);
        } finally {
            setLoading(false);
        }
    }, [authToken, API_MATERIEL_URL]);

    useEffect(() => {
        fetchMateriel();
    }, [fetchMateriel]);

    // Scroll vers le formulaire
    useEffect(() => {
        if (showForm && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [showForm]);

    // Scroll vers la confirmation
    useEffect(() => {
        if (showConfirmModal && confRef.current) {
            confRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [showConfirmModal]);

    // Scroll vers le modal de détails
    useEffect(() => {
        if (selectedMateriel && detailRef.current) {
            detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedMateriel]);

    // Filtrage côté client
    const filteredMateriel = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return materiel.filter(item => {
            return (
                lowerCaseSearchTerm === '' ||
                String(item.id).includes(lowerCaseSearchTerm) ||
                (item.name && item.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (item.reference && item.reference.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (item.type && item.type.toLowerCase().includes(lowerCaseSearchTerm))
            );
        });
    }, [materiel, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredMateriel.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMateriel.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Actions
    const handleOpenAddForm = () => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à ajouter des matériels.");
            return;
        }
        setEditingMateriel(null);
        setShowForm(true);
        setError(null);
    };

    const handleOpenEditForm = (materiel) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à modifier des matériels.");
            return;
        }
        setEditingMateriel(materiel);
        setShowForm(true);
        setError(null);
    };

   const handleSaveMateriel = async (materielData) => {
    if (currentUserRole !== 'admin') {
        setError("Vous n'êtes pas autorisé à sauvegarder des matériels.");
        return;
    }
    try {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        };

        if (editingMateriel) {
            await axios.put(`${API_MATERIEL_URL}/${editingMateriel.id}`, materielData, { headers });
        } else {
            await axios.post(API_MATERIEL_URL, materielData, { headers });
        }

        setShowForm(false);
        setEditingMateriel(null);
        setError(null);
        fetchMateriel(); // refresh après sauvegarde
    } catch (err) {
        console.error("Erreur API SAVE:", err.response ? err.response.data : err.message);

        // 🔹 IMPORTANT : rejeter l'erreur pour que le formulaire la capture
        throw err;
    }
};


    const handleDeleteMateriel = async (materielId) => {
        if (currentUserRole !== 'admin') {
            setError("Vous n'êtes pas autorisé à supprimer des matériels.");
            return;
        }
        setConfirmMessage('Êtes-vous sûr de vouloir supprimer ce matériel ?');
        setConfirmAction(() => async () => {
            try {
                const headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                };
                await axios.delete(`${API_MATERIEL_URL}/${materielId}`, { headers });
                setError(null);
                fetchMateriel();
            } catch (err) {
                console.error("Erreur API DELETE:", err.response ? err.response.data : err.message);
                setError('Erreur lors de la suppression: ' + (err.response?.data?.message || err.message));
            }
        });
        setShowConfirmModal(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingMateriel(null);
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

    const handleViewDetails = (materiel) => {
        setSelectedMateriel(materiel);
    };

    const handleCloseDetails = () => {
        setSelectedMateriel(null);
    };

    if (loading) {
        return (
            <div style={cardStyle} className="management-page-container loading-overlay">
                <p style={cardStyle}>Chargement des matériels...</p>
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
                <h2>Gestion des Inventaires</h2>
                {currentUserRole === 'admin' && (
                    <button className="new-button" onClick={handleOpenAddForm}>
                        <FiPlusCircle /> Nouveau Matériel
                    </button>
                )}
            </div>

           {/* Input de recherche */}
            <input
                type="text"
                placeholder="Rechercher par Nom, Référence, Type ou ID..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Retour à la première page après la recherche
                }}
                // className="search_input"
                style={{ ...styles.searchInput, ...cardStyle }}
            />

            {/* Sélecteur du nombre d'éléments par page */}
            <div className="items-per-page-selector" style={cardStyle}>
                <label htmlFor="items-per-page" style={cardStyle}>Afficher :</label>
                <select
                    style={cardStyle}
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option style={cardStyle} value={5}>5</option>
                    <option style={cardStyle} value={10}>10</option>
                    <option style={cardStyle} value={20}>20</option>
                    <option style={cardStyle} value={50}>50</option>
                </select>
            </div>

            {/* 🛑 MODIFICATION : Utilisation du composant MaterielTable */}
            <MaterielTable
                style={cardStyle}
                materielList={currentItems} // Passage des éléments paginés
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteMateriel}
                onViewDetails={handleViewDetails}
                currentUserRole={currentUserRole}
            />
            {/* 🛑 SUPPRESSION : L'ancienne grille de cartes est remplacée par le tableau */}
            {/* <div className="printer-cards-grid" style={cardStyle}>
                {... ancien code MaterielCard.map ...}
            </div> */}

            {totalPages > 1 && (
                <div className="pagination" style={cardStyle}>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} style={cardStyle}>
                        <FiChevronLeft /> Précédent
                    </button>
                    {/* Logique pour les boutons de pagination (à conserver ou simplifier) */}
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
                <AddMaterielForm
                    style={cardStyle}
                    materielToEdit={editingMateriel}    // ✅ Correction
                    onSave={handleSaveMateriel}
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

            {selectedMateriel && (
                <MaterielDetailModal
                    materiel={selectedMateriel}
                    onClose={handleCloseDetails}
                    ref={detailRef}
                    style={cardStyle}
                />
            )}
        </div>
    );
};

export default MaterielManagementPage;

const styles = {
    searchInput: {
        width: '100%',
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '16px',
    }
};