import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import '../styles/ManagementPage.css'; // Assurez-vous d'avoir les styles pour les modales
import { formatDateOnly } from '../../utils/formatters'; // Importez la fonction de formatage
import {
    FiX,// Ajout de FiAlertCircle pour les messages d'erreur
} from 'react-icons/fi';
import { API_BASE_URL } from '../../api';

// NOUVEAU COMPOSANT : AssignInterventionModal
const AssignInterventionModal = forwardRef(({ intervention, onAssign, onClose, setError, style },AssiRef) => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(intervention.technician_id || '');
    const [provisionalDate, setProvisionalDate] = useState(
        intervention.date_previsionnelle ? new Date(intervention.date_previsionnelle).toISOString().split('T')[0] : ''
    );
    const [loadingTechnicians, setLoadingTechnicians] = useState(true);

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_BASE_URL}/users?role=technicien`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTechnicians(response.data);
            } catch (err) {
                console.error("Erreur lors du chargement des techniciens:", err.response ? err.response.data : err.message);
                setError('Erreur lors du chargement des techniciens.');
            } finally {
                setLoadingTechnicians(false);
            }
        };
        fetchTechnicians();
    }, [setError]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTechnicianId) {
            setError('Veuillez sélectionner un technicien.');
            return;
        }
        if (!provisionalDate) {
            setError('Veuillez sélectionner une date prévisionnelle.');
            return;
        }
        onAssign(intervention.id, selectedTechnicianId, provisionalDate);
    };

    return (
        <div className="modal-overlay" ref={AssiRef} style={style}>
            <div className="modal-content small-modal" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>Assigner l'Intervention #{intervention.numero_demande || intervention.id}</h2>
                    <button  style={style} type="button" onClick={onClose} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body" style={style}>
                    <div className="form-group" style={style}>
                        <label htmlFor="technician" style={style}>Technicien:</label>
                        {loadingTechnicians ? (
                            <p style={style}>Chargement des techniciens...</p>
                        ) : (
                            <select
                                style={style}
                                id="technician"
                                value={selectedTechnicianId}
                                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                required
                            >
                                <option style={style} value="">Sélectionner un technicien</option>
                                {technicians.map((tech) => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="provisionalDate" style={style}>Date Prévisionnelle:</label>
                        <input
                            style={style}
                            type="datetime-local"
                            id="provisionalDate"
                            value={provisionalDate}
                            onChange={(e) => setProvisionalDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="form-button success">Assigner</button>
                        <button type="button" onClick={onClose} className="form-button cancel">Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AssignInterventionModal;