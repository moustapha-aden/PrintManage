// src/components/tables/InterventionTableRow.jsx
import React from 'react';
import { FiEye, FiUserCheck, FiCheckCircle, FiSlash } from 'react-icons/fi';
// S'assurer que ces imports existent et sont correctement définis
import { formatDate, formatDateOnly, getStatusDisplay, getInterventionTypeDisplay } from '../../utils/formatters';
import '../styles/TableDisplay.css';

/**
 * Composant pour afficher une seule ligne d'intervention dans un tableau.
 * Il gère la logique d'affichage et les actions disponibles en fonction du rôle de l'utilisateur.
 *
 * @param {object} props - Les props du composant.
 * @param {object} props.intervention - L'objet d'intervention à afficher.
 * @param {Function} props.onFinish - Callback pour terminer une intervention.
 * @param {Function} props.onCancel - Callback pour annuler une intervention.
 * @param {Function} props.onViewDetails - Callback pour voir les détails.
 * @param {Function} props.onAssign - Callback pour assigner un technicien.
 * @param {string} props.currentUserRole - Rôle de l'utilisateur actuel ('admin', 'technicien', 'client').
 * @param {string} props.currentUserId - ID de l'utilisateur actuel.
 * @param {boolean} props.showClientColumn - Indique si les colonnes du client doivent être affichées.
 */
const InterventionTableRow = React.memo(({
    intervention,
    onFinish,
    onCancel,
    onViewDetails,
    onAssign,
    currentUserRole,
    currentUserId,
    showClientColumn
}) => {
    // Correction de l'erreur : Vérifier si l'objet 'intervention' est bien défini
    // avant d'essayer d'accéder à ses propriétés.
    // Cela évite le "Cannot read properties of undefined (reading 'printer')".
    if (!intervention) {
        console.error("InterventionTableRow a reçu une intervention invalide (null ou undefined).");
        return null;
    }

    // Utilisation de l'opérateur de chaînage optionnel pour éviter les erreurs d'accès
    // si les objets imbriqués sont null ou undefined.
    const printerDisplay = intervention.printer ? `${intervention.printer.brand} ${intervention.printer.model}` : 'N/A';
    const technicianDisplay = intervention.technician?.nom_complet || 'Non Assigné';
    const clientDisplay = intervention.client?.nom_complet || 'N/A';
    const clientCompanyDisplay = intervention.client?.company?.name || 'N/A';
    const interventionStatus = intervention.status || '';

    // Définition des conditions pour les actions
    const canChangeStatus = !['Terminée', 'Annulée'].includes(interventionStatus);
    const canAssign = currentUserRole === 'admin' && canChangeStatus && !intervention.technician_id;
    const isAssignedToCurrentUser = currentUserRole === 'technicien' &&
        intervention.technician_id === currentUserId;

    return (
        <tr>
            <td>{intervention.numero_demande || 'N/A'}</td>
            <td>{printerDisplay}</td>
            {showClientColumn && (
                <>
                    <td>{clientDisplay}</td>
                    <td>{clientCompanyDisplay}</td>
                </>
            )}
            <td>{technicianDisplay}</td>
            <td>{getInterventionTypeDisplay(intervention.intervention_type)}</td>
            <td className={`status-${interventionStatus.toLowerCase().replace(/\s/g, '-')}`}>
                {getStatusDisplay(interventionStatus)}
            </td>
            <td>{formatDate(intervention.created_at)}</td>
            <td>{intervention.date_previsionnelle ? formatDateOnly(intervention.date_previsionnelle) : 'N/A'}</td>
            <td>
                <div className="table-actions">
                    <button type="button" className="icon-button" onClick={() => onViewDetails(intervention)} title="Voir Détails">
                        <FiEye />
                    </button>
                    {canAssign && (
                        <button type="button" className="icon-button" onClick={() => onAssign(intervention)} title="Assigner Technicien">
                            <FiUserCheck />
                        </button>
                    )}
                    {isAssignedToCurrentUser && canChangeStatus && (
                        <>
                            <button type="button" className="icon-button success" onClick={() => onFinish(intervention)} title="Terminer Intervention">
                                <FiCheckCircle />
                            </button>
                            <button type="button" className="icon-button danger" onClick={() => onCancel(intervention)} title="Annuler Intervention">
                                <FiSlash />
                            </button>
                        </>
                    )}
                    {currentUserRole === 'admin' && canChangeStatus && !intervention.technician_id && (
                        <>
                            <button type="button" className="icon-button success" onClick={() => onFinish(intervention)} title="Terminer Intervention">
                                <FiCheckCircle />
                            </button>
                            <button type="button" className="icon-button danger" onClick={() => onCancel(intervention)} title="Annuler Intervention">
                                <FiSlash />
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
});

export default InterventionTableRow;
