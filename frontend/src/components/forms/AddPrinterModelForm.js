// src/components/forms/AddPrinterModelForm.js
import React, { useState, useEffect, forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/FormModal.css'; // Assurez-vous d'avoir ce fichier CSS pour le style de la modale

const AddPrinterModelForm = forwardRef(({ modelToEdit, onSave, onCloseForm, setError,style }, ref) => {
    const [modelName, setModelName] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [formError, setFormError] = useState('');

    // Pré-remplir le formulaire en mode édition
    useEffect(() => {
        if (modelToEdit) {
            setModelName(modelToEdit.name || '');
            setSelectedBrandId(modelToEdit.brand_id || '');
        } else {
            setModelName('');
            setSelectedBrandId('');
        }
        setFormError(''); // Réinitialiser les erreurs lors de l'ouverture
    }, [modelToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setError(null); // Clear global error
        if (!modelName.trim()) {
            setFormError("Le nom du modèle est requis.");
            return;
        }
        
        onSave({ name: modelName.trim(), brand_id: selectedBrandId });
    };

    return (
        <div className="modal-overlay" ref={ref} style={style}>
            <div className="modal-content" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>{modelToEdit ? 'Modifier le Modèle' : 'Ajouter un Modèle'}</h2>
                    <button style={style} onClick={onCloseForm} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={style}>
                    {formError && <p className="error-message">{formError}</p>}
                    <div className="form-group" style={style}>
                        <label htmlFor="modelName" style={style}>Nom du modèle:</label>
                        <input
                            style={style}
                            type="text"
                            id="modelName"
                            name="modelName"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onCloseForm} className="form-button cancel">Annuler</button>
                        <button type="submit" className="form-button submit">
                            {modelToEdit ? 'Enregistrer les modifications' : 'Ajouter le Modèle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddPrinterModelForm;
