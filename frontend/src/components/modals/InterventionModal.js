import React, { useEffect, useRef } from 'react'; // Ajout de useEffect et useRef
import { createPortal } from 'react-dom';       // Ajout de createPortal
import { FiXCircle, FiInfo } from 'react-icons/fi'; // Icône pour fermer et info (conservé comme vous l'avez défini)
import '../styles/InterventionModal.css'; // Assurez-vous que ce chemin est correct et que les styles CSS y sont définis

const InterventionModal = ({ isOpen, onClose, title, interventions, type = 'company' }) => {
    // Crée une référence pour le bouton de fermeture, pour l'auto-focus
    const closeButtonRef = useRef(null);
    // Crée une référence pour le contenu de la modale (pour un fallback de focus si nécessaire)
    const modalContentRef = useRef(null);

    // Effet pour gérer l'auto-focus et le défilement du corps
    useEffect(() => {
        if (isOpen) {
            // Empêche le défilement du corps de la page lorsque la modale est ouverte
            document.body.style.overflow = 'hidden';

            // Met le focus sur le bouton de fermeture
            if (closeButtonRef.current) {
                closeButtonRef.current.focus();
            } else if (modalContentRef.current) {
                // Fallback : Si le bouton de fermeture n'est pas trouvé/focusable, essayez le premier élément focusable dans la modale
                const focusableElements = modalContentRef.current.querySelectorAll(
                    'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }
        } else {
            // Rétablit le défilement du corps de la page lorsque la modale est fermée
            document.body.style.overflow = 'unset';
        }

        // Fonction de nettoyage à exécuter lorsque le composant est démonté ou isOpen change à false
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]); // L'effet se déclenche chaque fois que la valeur de isOpen change

    if (!isOpen) return null;

    // Utilise createPortal pour rendre la modale en dehors du DOM principal (directement dans le body)
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            {/* Empêche la propagation du clic sur le contenu de la modale pour ne pas la fermer */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()} ref={modalContentRef}>
                <div className="modal-header">
                    <h2><FiInfo className="modal-title-icon" /> {title}</h2> {/* Icône FiInfo conservée */}
                    <button
                        className="modal-close-button"
                        onClick={onClose}
                        ref={closeButtonRef} // Attache la référence pour l'auto-focus
                        aria-label="Fermer la modale" // Bonne pratique d'accessibilité
                    >
                        <FiXCircle /> {/* Icône FiXCircle conservée */}
                    </button>
                </div>
                <div className="modal-body">
                    {interventions.length > 0 ? (
                        <ul className="modal-intervention-list">
                            {interventions.map(intervention => (
                                <li key={intervention.id} className="modal-intervention-item">
                                    <div className="item-header">
                                        <span>ID: {intervention.numero_demande}</span>
                                        <span>Date: {intervention.created_at}</span>
                                    </div>
                                    <p>Type: {intervention.intervention_type || 'N/A'}</p>
                                    <p>Statut: <span className={`status-${intervention.status ? intervention.status.toLowerCase().replace(/\s/g, '-') : 'unknown'}`}>{intervention.status}</span></p>
                                    <p>Description: {intervention.description}</p>
                                    {type === 'company' && intervention.printer && (
                                        <p>Imprimante: {intervention.printer.model} (SN: {intervention.printer.serial})</p>
                                    )}
                                    {intervention.reported_by_user && (
                                        <p>Demandé par: {intervention.reported_by_user.name}</p>
                                    )}
                                    {intervention.assigned_to_user && (
                                        <p>Géré par: {intervention.assigned_to_user.name}</p>
                                    )}
                                    {intervention.status && intervention.status.toLowerCase() === 'terminée' && intervention.assigned_to_user && (
                                        <p>Technicien de fin: {intervention.assigned_to_user.name}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucune intervention trouvée pour cette {type}.</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="action-button" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </div>,
        document.body // Rend la modale directement dans le corps du document
    );
};

export default InterventionModal;