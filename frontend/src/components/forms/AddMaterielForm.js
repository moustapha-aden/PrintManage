// src/components/forms/AddMaterielForm.js

import React, { useState, useEffect, forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/FormModal.css';

const AddMaterielForm = forwardRef(({ materielToEdit, onSave, onCloseForm, setError, style }, formRef) => {
    const [materielData, setMaterielData] = useState({
        name: '',
        reference: '',
        type: '',
        quantite: 0,
        sortie: 0,
    });

    const [initialData, setInitialData] = useState(null);
    const [localError, setLocalError] = useState('');

    // Initialisation du formulaire
    useEffect(() => {
        if (materielToEdit) {
            const editData = {
                name: materielToEdit.name || '',
                reference: materielToEdit.reference || '',
                type: materielToEdit.type || '',
                quantite: materielToEdit.quantite || 0,
                sortie: materielToEdit.sortie || 0,
            };
            setMaterielData(editData);
            setInitialData(editData); // ✅ Sauvegarder l'état initial
        } else {
            setMaterielData({
                name: '',
                reference: '',
                type: '',
                quantite: 0,
                sortie: 0,
            });
            setInitialData(null);
        }
        setLocalError('');
    }, [materielToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMaterielData(prev => ({
            ...prev,
            [name]: name === "quantite" || name === "sortie" ? parseInt(value || 0, 10) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    setError('');
    
    console.log('📤 Données envoyées:', materielData); // ✅ Debug
    
        // Validation simple
        if (!materielData.name || !materielData.reference) {
            setLocalError('Le nom et la référence sont obligatoires.');
            return;
        }

        // Vérification des modifications (mode édition)
        if (materielToEdit && initialData) {
            const hasChanges = Object.keys(materielData).some(
                key => materielData[key] !== initialData[key]
            );
            if (!hasChanges) {
                setLocalError('Aucune modification détectée.');
                return;
            }
        }

        // Appel de la fonction onSave passée en props
        try {
            // ✅ TOUJOURS envoyer tous les champs (mode ajout ET modification)
            await onSave(materielData);
        } catch (err) {
            if (err?.response?.data?.errors?.reference) {
                setError("Cette référence est déjà utilisée par un autre matériel.");
            } else {
                setError(err?.response?.data?.message || "Erreur lors de la sauvegarde.");
            }
        }
    };

    return (
        <div className="modal-overlay" ref={formRef} style={style}>
            <div className="modal-content" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>
                        {materielToEdit ? 'Modifier le Matériel' : 'Ajouter un Nouveau Matériel'}
                    </h2>
                    <button style={style} onClick={onCloseForm} className="modal-close-button">
                        <FiX />
                    </button>
                </div>

                {localError && <div className="alert alert-error">{localError}</div>}

                <form onSubmit={handleSubmit} style={style}>
                    <div className="form-group">
                        <label htmlFor="name">Nom du matériel :</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={materielData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reference">Référence :</label>
                        <input
                            type="text"
                            id="reference"
                            name="reference"
                            value={materielData.reference}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Type :</label>
                        <input
                            type="text"
                            id="type"
                            name="type"
                            value={materielData.type}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="quantite">Quantité :</label>
                        <input
                            type="number"
                            id="quantite"
                            name="quantite"
                            value={materielData.quantite}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sortie">Sortie :</label>
                        <input
                            type="number"
                            id="sortie"
                            name="sortie"
                            value={materielData.sortie}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCloseForm} className="form-button cancel">Annuler</button>
                        <button type="submit" className="form-button submit">
                            {materielToEdit ? 'Mettre à jour' : 'Ajouter Matériel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddMaterielForm;