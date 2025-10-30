// src/components/forms/AddBrandForm.js
import React, { useState, useEffect, forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/FormModal.css'; // Assurez-vous d'avoir ce fichier CSS pour le style de la modale

const AddBrandForm = forwardRef(({ brandToEdit, onSave, onCloseForm, setError,style }, ref) => {
    const [brandName, setBrandName] = useState('');
    const [formError, setFormError] = useState('');

    // Pré-remplir le formulaire en mode édition
    useEffect(() => {
        if (brandToEdit) {
            setBrandName(brandToEdit.name || '');
        } else {
            setBrandName('');
        }
        setFormError(''); // Réinitialiser les erreurs lors de l'ouverture
    }, [brandToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setError(null); // Clear global error
        if (!brandName.trim()) {
            setFormError("Le nom de la marque est requis.");
            return;
        }
        onSave({ name: brandName.trim() });
    };

    return (
        <div className="modal-overlay" ref={ref} style={style}>
            <div className="modal-content" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>{brandToEdit ? 'Modifier la Marque' : 'Ajouter une Marque'}</h2>
                    <button onClick={onCloseForm} className="modal-close-button" style={style}>
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit}  style={style}>
                    {formError && <p   style={style}className="error-message">{formError}</p>}
                    <div className="form-group"  style={style}>
                        <label htmlFor="brandName"  style={style}>Nom de la marque:</label>
                        <input
                            style={style}
                            type="text"
                            id="brandName"
                            name="brandName"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions"  style={style}>
                        <button type="button" onClick={onCloseForm} className="form-button cancel">Annuler</button>
                        <button type="submit" className="form-button submit">
                            {brandToEdit ? 'Enregistrer les modifications' : 'Ajouter la Marque'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddBrandForm;
