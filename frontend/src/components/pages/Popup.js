import React from 'react';
import { FiXCircle } from 'react-icons/fi';
import '../styles/Popup.css'; // Créez ce fichier CSS à l'étape 2

const Popup = ({ message, type, onClose }) => {
    if (!message) {
        return null;
    }

    const popupClassName = `popup-modal ${type || 'info'}`;

    return (
        <div className="popup-overlay">
            <div className={popupClassName}>
                <div className="popup-content">
                    <p>{message}</p>
                    <button className="popup-close-button" onClick={onClose}>
                        <FiXCircle />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;