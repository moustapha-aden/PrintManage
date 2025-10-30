import React from 'react'; // Pas besoin de useCallback si non utilisé
// --- ASSUREZ-VOUS QUE CETTE LIGNE EST PRÉSENTE ET CORRECTE ---
import { formatDate, formatDateOnly, getStatusDisplay, getInterventionTypeDisplay } from '../../utils/formatters';
import { FiCheckCircle, FiSlash, FiEye, FiUserCheck, FiTool,FiEdit } from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';

const InterventionTableRow = React.memo(({ intervention, onFinish, onCancel, onViewDetails, onStart,onEdit,onAssign, currentUserRole, currentUserId, showClientColumn }) => {
    // Logique pour les données d'affichage
    const printerDisplay = intervention.printer ? `${intervention.printer.brand} ${intervention.printer.model}` : 'N/A';
    const technicianDisplay = intervention.technician ? intervention.technician.name : 'Non Assigné';
    const clientDisplay = intervention.client ? intervention.client.name : 'N/A';
    const clientCompanyDisplay = intervention.client?.company?.name || 'N/A';
    const departmentDisplay = intervention.printer?.department ? intervention.printer.department.name : 'N/A';

    // Logique pour l'affichage conditionnel des boutons
    const isFinishedOrCancelled = ['Terminée', 'Annulée'].includes(intervention.status);
    const canChangeStatus = !isFinishedOrCancelled;

    // Conditions pour les boutons en fonction du rôle
    const showFinishButton = canChangeStatus && currentUserRole !== 'technicien';
    const showCancelButton = canChangeStatus && currentUserRole !== 'technicien';
    const showAssignButton = currentUserRole === 'admin';

    // On s'assure que le technicien ne peut que voir le bouton s'il est lui-même assigné et que le statut le permet.
    const showTechButtons = currentUserRole === 'technicien' && intervention.technician_id == currentUserId && canChangeStatus;
    
    // Logique du bouton 'Commencer'
    const isStarted = intervention.start_date_intervention !== null;
    const buttonText = isStarted ? 'Terminer' : 'Commencer';
    const buttonAction = isStarted ? onFinish : onStart;
    const buttonClass = isStarted ? 'finish-button' : 'start-button';
    const canAssign = currentUserRole === 'admin' && (intervention.status === 'En Attente' || !intervention.technician_id);

    const cando=currentUserRole==="admin" && (intervention.technician_id==5 || intervention.technician_id==currentUserId);

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


    return (
        <tr>
            <td>{intervention.numero_demande || 'N/A'}</td>
            <td>{printerDisplay}</td>
            {showClientColumn && (
                <>
                    <td>{clientDisplay}</td>
                    <td>{clientCompanyDisplay}</td>
                    <td>{departmentDisplay}</td>
                </>
            )}
            <td>{technicianDisplay}</td>
            <td>{getInterventionTypeDisplay(intervention.intervention_type)}</td>
            <td className={`status-${(intervention.status || '').toLowerCase().replace(/\s/g, '-')}`}>{getStatusDisplay(intervention.status)}</td>
            <td>{formatDate(intervention.start_date)}</td>
            <td>
                <div className="table-actions">
                    <button type="button" className="icon-button" onClick={() => onViewDetails(intervention)} title="Voir Détails">
                        <FiEye />
                    </button>
                    {
                        (currentUserRole === 'admin' ) && (
                            <button type="button" className="icon-button" onClick={() => onEdit(intervention)} title="Modifier Intervention">
                                <FiEdit />
                            </button>
                        )
                    }
                    {showAssignButton && canAssign && (
                        <button type="button" className="icon-button" onClick={() => onAssign(intervention)} title="Assigner Technicien">
                            <FiUserCheck />
                        </button>
                    )}
                    
                    {/* Les boutons 'Terminer' et 'Annuler' sont maintenant basés sur des conditions claires */}
                    {
                        (showFinishButton || showTechButtons) &&  cando &&(
                            <button type="button" className={`icon-button ${buttonClass}`} onClick={() => buttonAction(intervention)} title={buttonText + " Intervention"}>
                                {isStarted ? <FiCheckCircle /> : <FiTool />}
                            </button>
                        )
                    }
                    {((showCancelButton && canAssign)  || intervention.technician_id === currentUserId )&& (
                        <button type="button" className="icon-button danger" onClick={() => onCancel(intervention)} title="Annuler Intervention">
                            <FiSlash />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
});

export default InterventionTableRow;