import React, { useState,forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/FormModal.css';

// Fonction utilitaire pour formater la date/heure pour l'input datetime-local avec secondes
const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const formatDateTimeLocalNoUTC = (isoString) => {
    if (!isoString) return '';
    // isoString attendu : "2025-08-31T11:45:00"
    const [datePart, timePart] = isoString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes, seconds] = timePart.split(':');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Fonction pour obtenir la date/heure locale actuelle avec secondes
const getCurrentLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Ajoutez currentTechnicianId aux props
const StatusUpdateModal =forwardRef(({ intervention, statusToApply, onSave, onClose, currentTechnicianId },updateRef) => {
    const [solution, setSolution] = useState(intervention.solution || '');
    // Initialise la date de fin à la date de fin existante ou à la date/heure actuelle si 'Terminée'
    const [end_date, setEnd_date] = useState(
        statusToApply === 'Terminée'
            ? (intervention.end_date ? formatDateTimeLocal(intervention.end_date) : formatDateTimeLocal(new Date().toISOString()))
            : '' // Pas de date de fin si ce n'est pas pour terminer
    );
    const [formError, setFormError] = useState('');

    const minEndDate = intervention.start_date ? formatDateTimeLocalNoUTC(intervention.start_date) : '';

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!solution.trim()) {
            setFormError("Veuillez saisir une solution pour ce changement de statut.");
            return;
        }

        // La validation de la date de fin n'est pertinente que pour le statut 'Terminée'
        if (statusToApply === 'Terminée') {
            if (!end_date) {
                setFormError("Veuillez saisir une date de fin.");
                return;
            }
            
            const parseDateTimeLocal = (dateTimeStr) => {
                const [datePart, timePart] = dateTimeStr.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                return { year, month, day, hours, minutes };
            };

            const start = parseDateTimeLocal(intervention.start_date);
            const end = parseDateTimeLocal(end_date);

            // Comparaison simple : année → mois → jour → heure → minute
            if (
                end.year < start.year ||
                (end.year === start.year && end.month < start.month) ||
                (end.year === start.year && end.month === start.month && end.day < start.day) ||
                (end.year === start.year && end.month === start.month && end.day === start.day && end.hours < start.hours) ||
                (end.year === start.year && end.month === start.month && end.day === start.day && end.hours === start.hours && end.minutes < start.minutes)
            ) {
                setFormError("La date de fin ne peut pas être antérieure à la date de début de l'intervention.");
                return;
            }
        }

        // Passe end_date seulement si le statut est 'Terminée', sinon null
        onSave(
            intervention.id,
            statusToApply,
            solution,
            statusToApply === 'Terminée' ? end_date : null,
            currentTechnicianId
        );
    };

    return (
        <div className="modal-overlay" ref={updateRef}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{statusToApply === 'Terminée' ? 'Terminer Intervention' : 'Annuler Intervention'} #{intervention.id}</h2>
                    <button onClick={onClose} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {formError && <p className="form-error-message">{formError}</p>}
                    <div className="form-group">
                        <label htmlFor="solution">Solution apportée :</label>
                        <textarea
                            id="solution"
                            name="solution"
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            required
                            rows="5"
                            placeholder={`Saisissez la description pour l'intervention #${intervention.id} avec le statut ${statusToApply}...`}
                        ></textarea>
                    </div>

                    {/* Rend le champ date de fin UNIQUEMENT si le nouveau statut est 'Terminée' */}
                    {statusToApply === 'Terminée' && (
                        <div className="form-group">
                            <label htmlFor="end_date">Date de Fin :</label>
                            <input
                                type="datetime-local"
                                id="end_date"
                                name="end_date"
                                value={end_date}
                                onChange={(e) => setEnd_date(e.target.value)}
                                min={minEndDate}
                                step="1"
                                required={statusToApply === 'Terminée'} // Rendre obligatoire si 'Terminée'
                            />
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="form-button cancel">Annuler</button>
                        <button type="submit" className="form-button submit">Confirmer</button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default StatusUpdateModal;