import React ,{forwardRef}from 'react'; // Pas besoin de useCallback si non utilisé
import { FiX } from 'react-icons/fi';
// --- ASSUREZ-VOUS QUE CETTE LIGNE EST PRÉSENTE ET CORRECTE ---
import {  getStatusDisplay, getPriorityDisplay, getInterventionTypeDisplay } from '../../utils/formatters';
// -----------------------------------------------------------
import '../styles/ManagementPage.css'; // Assurez-vous d'avoir les styles pour les modales

import { API_BASE_URL } from '../../api';

// NOUVEAU COMPOSANT : InterventionDetailModal (Déplacé ici et mémoïsé)
const InterventionDetailModal =forwardRef(({ intervention, currentUserRole, onClose,style },detailRef) => {
    if (!intervention) return null;

    const printerNameDisplay = intervention.printer ? `${intervention.printer.brand || 'N/A'} ${intervention.printer.model || 'N/A'}` : 'N/A';
    const technicianNameDisplay = intervention.technician ? (intervention.technician.name || 'N/A') : 'Non Assigné';
    const clientNameDisplay = intervention.client ? (intervention.client.name || 'N/A') : 'N/A';

    const clientCompanyName = intervention.client?.company?.name || 'N/A';
    const clientDepartmentName = intervention.client?.department?.name || 'N/A';

    const showClientField = currentUserRole === 'admin';

    const formatDuration = (start, end) => {
        const duration = new Date(end) - new Date(start);
        
        // Si la durée est négative ou invalide, retourner un message approprié
        if (duration < 0) {
            return "0h 0m 0s";
        }
        
        const totalMinutes = Math.floor(duration / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}h ${minutes}m ${seconds}s`;
    };

   const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    
    // Récupérer les composants de la date en UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

    console.log("InterventionDetailModal rendering with intervention:", intervention);

    return (
        <div className="modal-overlay" ref={detailRef} style={style}>
            <div className="modal-content detail-modal" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>Détails de l'Intervention #{intervention.numero_demande || intervention.id}</h2>
                    <button style={style} type="button" onClick={onClose} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <div style={style} className="modal-body">
                    <p style={style}><strong>Code d'Intervention:</strong> {intervention.numero_demande || 'N/A'}</p>
                    <p style={style}><strong>Imprimante:</strong> {printerNameDisplay}</p>
                    <p style={style}><strong>Numéro de série:</strong> {intervention.printer?.serial || 'N/A'}</p>
                    {showClientField && (
                        <>
                            <p style={style}><strong>Client:</strong> {clientNameDisplay}</p>
                            <p style={style}><strong>Société du Client:</strong> {clientCompanyName}</p>
                            <p style={style}><strong>Département:</strong> {intervention.printer?.department?.name || 'N/A'}</p>
                        </>
                    )}
                    <p style={style}><strong>Technicien Assigné:</strong> {technicianNameDisplay}</p>
                    <p style={style}><strong>Type d'Intervention:</strong> {getInterventionTypeDisplay(intervention.intervention_type)}</p>
                    <p style={style}><strong>Description:</strong> {intervention.description || 'Aucune'}</p>
                    <p style={style}><strong>solution:</strong> {intervention.solution || 'Aucune'}</p>
                    <p style={style}><strong>Statut:</strong> <span className={`status-${(intervention.status || '').toLowerCase().replace(/\s/g, '-')}`}>{getStatusDisplay(intervention.status)}</span></p>
                    <p style={style}><strong>Priorité:</strong> {getPriorityDisplay(intervention.priority)}</p>
                    <p style={style}><strong>Date d'intervention:</strong> {formatDate(intervention.start_date)}</p>
                    {intervention.date_previsionnelle && (
                        <p style={style}><strong>Date Prévisionnelle:</strong> {formatDate(intervention.date_previsionnelle)}</p>
                    )}
                    <p style={style}><strong>Date de Debut:</strong> {intervention.start_date_intervention ? formatDate(intervention.start_date_intervention) : 'N/A'}</p>
                    <p style={style}><strong>Date de Fin:</strong> {intervention.end_date ? formatDate(intervention.end_date) : 'N/A'}</p>

                    {intervention.start_date_intervention && intervention.end_date && (() => {
                        return (
                            <p style={style}>
                                <strong>Durée de l'Intervention:</strong>{" "}
                                {formatDuration(intervention.start_date_intervention, intervention.end_date)}
                            </p>
                        );
                    })()}
                    {intervention.image_path && (
                        <div className="intervention-photo-section" style={style}>
                            <h3 style={style}>Photo de l'intervention :</h3>
                            <img
                                src={`${API_BASE_URL}/storage/${intervention.image_path}`}
                                alt="Photo de l'intervention"
                                className="intervention-detail-photo"
                            />
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="form-button cancel">Fermer</button>
                </div>
            </div>
        </div>
    );
});

export default  React.memo(InterventionDetailModal);