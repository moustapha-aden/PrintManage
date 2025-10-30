import '../styles/ManagementPage.css';  // Créez ce fichier CSS
import {
    FiX,// Ajout de FiAlertCircle pour les messages d'erreur
} from 'react-icons/fi';
import  { forwardRef } from 'react';
const ConfirmationModal = forwardRef(({ message, onConfirm, onCancel,style},confRef) => {
    return (
        <div className="modal-overlay" style={style} ref={confRef}>
            <div className="modal-content small-modal" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>Confirmation</h2>
                    <button style={style} type="button" onClick={onCancel} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <div className="modal-body" style={style}>
                    <p style={style}>{message}</p>
                </div>
                <div className="modal-footer" style={style}>
                    <button type="button" onClick={onConfirm} className="form-button success">Confirmer</button>
                    <button type="button" onClick={onCancel} className="form-button cancel">Annuler</button>
                </div>
            </div>
        </div>
    );
});

export default ConfirmationModal;