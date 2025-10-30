// src/forms/AddDepartmentForm.js

import React, { useState, useEffect, forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/FormModal.css'; // Re-use existing modal styles

const AddDepartmentForm = forwardRef(({ departmentToEdit, onSave, onCloseForm, companies,style },formRef) => {
    const [departmentData, setDepartmentData] = useState({
        name: '',
        company_id: '',
        quota_monthly:0,
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (departmentToEdit) {
            setDepartmentData({
                name: departmentToEdit.name || '',
                company_id: departmentToEdit.company_id || '',
                quota_monthly:departmentToEdit.quota_monthly || 0,
            });
        } else {
            setDepartmentData({
                name: '',
                company_id: '',
                quota_monthly:0,
            });
        }
        setFormError('');
    }, [departmentToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDepartmentData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!departmentData.name || !departmentData.company_id) {
            setFormError("Veuillez remplir tous les champs obligatoires (Nom du département, Société).");
            return;
        }

        // Ensure company_id is a number if your backend expects it as such
        const dataToSend = {
            ...departmentData,
            company_id: Number(departmentData.company_id)
        };

        onSave(dataToSend);
    };
// Trouver la société sélectionnée
const selectedCompany = companies?.find(c => c.id === Number(departmentData.company_id));

    return (
        <div className="modal-overlay" ref={formRef} style={style}>
            <div className="modal-content"style={style}>
                <div className="modal-header"style={style}>
                    <h2 style={style}>{departmentToEdit ? 'Modifier Département' : 'Ajouter un Nouveau Département'}</h2>
                    <button style={style} onClick={onCloseForm} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {formError && <p className="form-error-message">{formError}</p>}

                    <div className="form-group"style={style}>
                        <label htmlFor="name"style={style}>Nom du Département:</label>
                        <input
                            style={style}
                            type="text"
                            id="name"
                            name="name"
                            value={departmentData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group"style={style}>
                        <label htmlFor="company_id"style={style}>Société:</label>
                        <select
                            style={style}
                            id="company_id"
                            name="company_id"
                            value={departmentData.company_id}
                            onChange={handleChange}
                            required
                        >
                            <option style={style} value="">Sélectionnez une société</option>
                            {Array.isArray(companies) && companies.map(company => (
                                <option style={style} key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                   {selectedCompany && selectedCompany.quota_monthly === 0 && (
                        <div className="form-group" style={style}>
                            <label htmlFor="quota_monthly" style={style}>Quota mensuel :</label>
                            <input
                                style={style}
                            type="number"
                            id="quota_monthly"
                            name="quota_monthly"
                            value={departmentData.quota_monthly}
                            onChange={handleChange}
                            />
                        </div>
                    )}
                    <div className="form-actions">
                        <button type="button" onClick={onCloseForm} className="form-button cancel">Annuler</button>
                        <button type="submit" className="form-button submit">
                            {departmentToEdit ? 'Enregistrer les modifications' : 'Ajouter Département'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddDepartmentForm;
