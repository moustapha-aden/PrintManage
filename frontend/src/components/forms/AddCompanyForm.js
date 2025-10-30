// src/components/forms/AddCompanyForm.js

import React, { useState, useEffect ,forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/FormModal.css';

const AddCompanyForm = forwardRef(({ companyToEdit, onSave, onCloseForm,style },formRef) => {
    const [companyData, setCompanyData] = useState({
        name: '',
        address: '',
        zip_code: '',
        country: '',
        phone: '',
        email: '',
        contact_person: '',
        status: 'Active',
        quota_BW: 0,
        quota_Color: 0,
        quota_monthly: 0,
    });

    useEffect(() => {
        if (companyToEdit) {
            console.log(companyToEdit.status)
            setCompanyData({
                name: companyToEdit.name || '',
                address: companyToEdit.address || '',
                zip_code: companyToEdit.zip_code || '',
                country: companyToEdit.country || '',
                phone: companyToEdit.phone || '',
                email: companyToEdit.email || '',
                contact_person: companyToEdit.contact_person || '',
                status: companyToEdit.status || 'Active',
                quota_BW:companyToEdit.quota_BW || 0,
                quota_Color:companyToEdit.quota_Color || 0,
                quota_monthly:companyToEdit.quota_monthly || 0,
            });
        }
    }, [companyToEdit]);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prevData => ({
        ...prevData,
        [name]: ["quota_BW", "quota_Color", "quota_monthly"].includes(name)
            ? parseInt(value || 0, 10)
            : value
    }));
};

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!companyData.name) {
            alert("Le nom et l'email de la société sont requis.");
            return;
        }
        onSave(companyData);
    };

    return (
        <div className="modal-overlay" ref={formRef} style={style} >
            <div className="modal-content" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>{companyToEdit ? 'Modifier la Société' : 'Ajouter une Nouvelle Société'}</h2>
                    <button style={style} onClick={onCloseForm} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={style}>
                    <div className="form-group" style={style}>
                        <label htmlFor="name" style={style}>Nom de la Société:</label>
                        <input
                            style={style}
                            type="text"
                            id="name"
                            name="name"
                            value={companyData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="address" style={style}>Adresse:</label>
                        <input
                            style={style}
                            type="text"
                            id="address"
                            name="address"
                            value={companyData.address}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="country" style={style}>Pays:</label>
                        <input
                            style={style}
                            type="text"
                            id="country"
                            name="country"
                            value={companyData.country}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group"style={style}>
                        <label htmlFor="phone"style={style}>Téléphone:</label>
                        <input
                            style={style}
                            type="tel"
                            id="phone"
                            name="phone"
                            value={companyData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group"style={style}>
                        <label htmlFor="email"style={style}>Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={companyData.email}
                            onChange={handleChange}
                            style={{ width: '100%', height: '2.5rem',...style }}
                        />
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="contact_person"style={style}>Personne de Contact:</label>
                        <input
                            style={style}
                            type="text"
                            id="contact_person"
                            name="contact_person"
                            value={companyData.contact_person}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="status" style={style}>Statut:</label>
                        <select
                            style={style}
                            id="status"
                            name="status"
                            value={companyData.status}
                            onChange={handleChange}
                            required
                        >
                            <option style={style} value="active">Actif</option>
                            <option style={style} value="inactive">Inactif</option>
                        </select>
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="quota_monthly" style={style}>quota mensuel : </label>
                        <input
                            style={style}
                            type="text"
                            id="quota_monthly"
                            name="quota_monthly"
                            value={companyData.quota_monthly}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="quota_BW" style={style}>Pourcentage pour BW : </label>
                        <input
                            style={style}
                            type="text"
                            id="quota_BW"
                            name="quota_BW"
                            value={companyData.quota_BW}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="quota_Color"style={style}>Pourcentage pour Color : </label>
                        <input
                            style={style}
                            type=""
                            id="quota_Color"
                            name="quota_Color"
                            value={companyData.quota_Color}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onCloseForm} className="form-button cancel">Annuler</button>
                        <button type="submit" className="form-button submit">
                            {companyToEdit ? 'Mettre à jour' : 'Ajouter Société'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddCompanyForm;
