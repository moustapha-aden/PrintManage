import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiPlusCircle, FiEdit, FiTrash2, FiAlertCircle, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';
import AddModelForm from '../forms/AddPrinterModelForm';
import ConfirmationModal from '../modals/ConfirmationModal';

import { API_BASE_URL } from '../../api';

// Ligne de tableau pour un modèle
const ModelTableRow = React.memo(({ model, onEdit, onDelete }) => (
    <tr>
        <td>{model.name}</td>
        <td>
            <div className="table-actions">
                <button className="icon-button" onClick={() => onEdit(model)} title="Modifier"><FiEdit /></button>
                <button className="icon-button trash" onClick={() => onDelete(model.id)} title="Supprimer"><FiTrash2 /></button>
            </div>
        </td>
    </tr>
));

const ModelManagementPage = () => {
    const [models, setModels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModelForm, setShowModelForm] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const modelFormRef = useRef(null);
    const confRef = useRef(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const API_MODELS_URL = `${API_BASE_URL}/printer-models`;
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
     * @brief Fetches all models from the API.
     */
    const fetchModels = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            if (!authToken) {
                setError("Non authentifié. Veuillez vous reconnecter.");
                setModels([]);
                setLoading(false);
                return;
            }

            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
            const response = await axios.get(API_MODELS_URL, { headers });

            if (Array.isArray(response.data)) {
                setModels(response.data);
            } else if (response.data?.data) {
                setModels(response.data.data);
            } else {
                setModels([]);
            }
        } catch (err) {
            console.error("Erreur API modèles:", err.response ? err.response.data : err.message);
            setError("Erreur lors du chargement des modèles: " + (err.response?.data?.message || err.message));
            setModels([]);
        } finally {
            setLoading(false);
        }
    }, [authToken, API_MODELS_URL]);

    // Charger tous les modèles au montage
    useEffect(() => {
        if (currentUserRole === 'admin') {
            fetchModels();
        }
    }, [fetchModels, currentUserRole]);

    // Filtrage en mémoire côté client
    const filteredModels = useMemo(() => {
        if (!searchTerm.trim()) return models;
        return models.filter((m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [models, searchTerm]);

    // Formulaire ajout/édition
    const handleOpenAddModelForm = () => { setEditingModel(null); setShowModelForm(true); setError(null); };
    const handleOpenEditModelForm = (model) => { setEditingModel(model); setShowModelForm(true); setError(null); };
    const handleCloseModelForm = () => { setShowModelForm(false); setEditingModel(null); setError(null); };

    const handleSaveModel = async (modelData) => {
        if (!authToken) return;
        setLoading(true);
        try {
            const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` };
            if (editingModel) {
                await axios.put(`${API_MODELS_URL}/${editingModel.id}`, modelData, { headers });
            } else {
                await axios.post(API_MODELS_URL, modelData, { headers });
            }
            await fetchModels();
            setShowModelForm(false);
            setEditingModel(null);
            toast.success(editingModel ? "Modèle modifié !" : "Modèle ajouté !");
        } catch (err) {
            console.error("Erreur SAVE modèle:", err.response ? err.response.data : err.message);
            toast.error('Erreur lors de la sauvegarde du modèle.');
        } finally {
            setLoading(false);
        }
    };

    // Suppression
    const handleDeleteModel = (modelId) => {
        setConfirmMessage('Êtes-vous sûr de vouloir supprimer ce modèle ?');
        setConfirmAction(() => async () => {
            setLoading(true);
            try {
                const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
                await axios.delete(`${API_MODELS_URL}/${modelId}`, { headers });
                await fetchModels();
                toast.success("Modèle supprimé !");
            } catch (err) {
                console.error("Erreur DELETE modèle:", err.response ? err.response.data : err.message);
                toast.error('Échec de la suppression du modèle.');
            } finally {
                setLoading(false);
            }
        });
        setShowConfirmModal(true);
    };

    const handleConfirmAction = () => { if (confirmAction) confirmAction(); setShowConfirmModal(false); setConfirmAction(null); setConfirmMessage(''); };
    const handleCancelConfirmation = () => { setShowConfirmModal(false); setConfirmAction(null); setConfirmMessage(''); };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    if (loading) return (<div style={cardStyle} className="management-page-container loading-overlay"><FiLoader className="loading-spinner-icon" /><p>Chargement des modèles...</p></div>);
    if (error) return (<p className="management-page-container alert alert-error"><FiAlertCircle className="alert-icon" /><span>Erreur: {error}</span></p>);

    return (
        <div className="management-page-container" style={cardStyle} >
            <div className="management-header" style={cardStyle}><h2>Gestion des Modèles d'appareils</h2></div>

            <div className="filter-bar" style={cardStyle}>
                <div className="search-input" style={cardStyle}>
                    <FiSearch />
                    <input
                        style={cardStyle}
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <section className="management-section" style={cardStyle} >
                <div className="section-header" style={cardStyle} >
                    <h3>Modèles</h3>
                    {currentUserRole === 'admin' && (
                        <button className="new-button" onClick={handleOpenAddModelForm}><FiPlusCircle /> Nouveau Modèle</button>
                    )}
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr><th>Nom du Modèle</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filteredModels.length > 0 ? (
                                filteredModels.map((model) => (
                                    <ModelTableRow key={model.id} model={model} onEdit={handleOpenEditModelForm} onDelete={handleDeleteModel} />
                                ))
                            ) : (
                                <tr><td colSpan="2" style={{ textAlign: 'center' }}>Aucun modèle trouvé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {showModelForm && <AddModelForm modelToEdit={editingModel} onSave={handleSaveModel} onCloseForm={handleCloseModelForm} setError={setError} ref={modelFormRef} style={cardStyle} />}
            {showConfirmModal && <ConfirmationModal message={confirmMessage} onConfirm={handleConfirmAction} onCancel={handleCancelConfirmation} ref={confRef} style={cardStyle} />}
        </div>
    );
};

export default ModelManagementPage;
