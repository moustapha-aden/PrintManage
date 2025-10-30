import {
    FiUser,
    FiPrinter,
    FiCalendar,
    FiCheck,
    FiX,
    FiFileText,
    FiBriefcase,
    FiMapPin,
    FiTool,
    FiClock,
    FiMap
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
import '../styles/TableDisplay.css';
import '../styles/InterventionCard.css';
import { memo } from 'react';

const InterventionCard = memo(({ intervention, onFinish, onCancel, onViewDetails, onStart }) => {
    // Déterminer la classe de priorité
    const getPriorityClass = (priority) => {
        switch(priority) {
            case 'Urgent': return 'priority-urgent';
            case 'Haute': return 'priority-high';
            case 'Moyenne': return 'priority-medium';
            case 'Basse': return 'priority-low';
            case 'Faible': return 'priority-very-low';
            default: return 'priority-default';
        }
    };

    // Déterminer la classe de statut
    const getStatusClass = (status) => {
        switch(status) {
            case 'En Attente': return 'status-pending';
            case 'En Cours': return 'status-in-progress';
            case 'Terminée': return 'status-completed';
            case 'Annulée': return 'status-cancelled';
            default: return 'status-default';
        }
    };
    
    // Détermine le texte et l'action du bouton principal
    const isStarted = intervention.start_date_intervention !== null;
    const buttonText = isStarted ? 'Terminer' : 'Commencer';
    const buttonAction = isStarted ? onFinish : onStart;
    const buttonClass = isStarted ? 'finish-button' : 'start-button';

    return (
        <div className="intervention-card">
            <div className="card-header">
                <div className="intervention-number">
                    <strong>#{intervention.numero_demande}</strong>
                </div>
                <div className="card-status">
                    <span className={`intervention-status ${getStatusClass(intervention.status)}`}>
                        {intervention.status}
                    </span>
                    <span className={`intervention-priority ${getPriorityClass(intervention.priority)}`}>
                        {intervention.priority}
                    </span>
                </div>
            </div>
            
            <div className="card-body">
                <div className="intervention-info">
                    <div className="info-row">
                        <FiPrinter className="info-icon" />
                        <span><strong>Imprimante:</strong> {intervention.printer ?
                            `${intervention.printer.brand} ${intervention.printer.model} (${intervention.printer.serial})`
                            : 'N/A'}
                        </span>
                    </div>
                    
                    <div className="info-row">
                        <FiUser className="info-icon" />
                        <span><strong>Client:</strong> {intervention.client ?
                            `${intervention.client.name}`
                            : 'N/A'}
                        </span>
                    </div>
                    
                    <div className="info-row">
                        <FiBriefcase className="info-icon" />
                        <span><strong>Société:</strong> {intervention.client?.company?.name || 'N/A'}</span>
                    </div>
                    
                    <div className="info-row">
                        <FiMapPin className="info-icon" />
                        <span><strong>Département:</strong> {intervention.client?.department?.name || intervention.printer?.department?.name || 'N/A'}</span>
                    </div>
                    
                    <div className="info-row">
                        <FiTool className="info-icon" />
                        <span><strong>Type:</strong> {intervention.intervention_type || 'N/A'}</span>
                    </div>
                    
                    <div className="info-row">
                        <FiCalendar className="info-icon" />
                        <span><strong>Date prév.:</strong> {intervention.date_previsionnelle ?
                            new Date(intervention.date_previsionnelle).toLocaleDateString('fr-FR')
                            : 'Non définie'}
                        </span>
                    </div>
                    
                    {intervention.description && (
                        <div className="info-row description">
                            <FiFileText className="info-icon" />
                            <span><strong>Description:</strong> {intervention.description}</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="card-actions">
                <button
                    className="action-button view-button"
                    onClick={() => onViewDetails(intervention)}
                >
                    Voir détails
                </button>
                
                {/* Affichage conditionnel des boutons d'action principale et d'annulation */}
                {intervention.status !== 'Terminée' && intervention.status !== 'Annulée' && (
                    <>
                        <button
                            className={`action-button ${buttonClass}`}
                            onClick={() => buttonAction(intervention)}
                        >
                            {isStarted ? <FiCheck /> : null} {buttonText}
                        </button>
                        
                        <button
                            className="action-button cancel-button"
                            onClick={() => onCancel(intervention)}
                        >
                            <FiX /> Annuler
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});
export default InterventionCard;