import React, { useState, useEffect, forwardRef, useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import '../styles/FormModal.css';

import { API_BASE_URL } from '../../api';
const API_COMPANIES_URL = `${API_BASE_URL}/companies`;

const AddQuotaForm = forwardRef(({ quotaToEdit, printers, onSave, onCloseForm,style }, ref) => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [quotaData, setQuotaData] = useState({
        printer_id: '',
        monthly_quota_bw: 0,
        monthly_quota_color: 0,
        monthly_quota_bw_large: 0,
        monthly_quota_color_large: 0,
        date_prelevement: '',
        mois: '',
    });

    const isColorPrinter = useMemo(() => {
        if (!quotaData.printer_id || !printers) return false;
        const printer = printers.find(p => p.id === parseInt(quotaData.printer_id));
        return printer ? printer.model.includes("C") : false;
    }, [quotaData.printer_id, printers]);

    const [formError, setFormError] = useState('');
    const authToken = localStorage.getItem('authToken');

    // Récupérer la liste des sociétés et pré-remplir en mode édition
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` };
                const response = await axios.get(API_COMPANIES_URL, { headers });
                setCompanies(response.data);
            } catch (err) {
                console.error("Erreur API sociétés:", err);
            }
        };
        fetchCompanies();
    }, [authToken]);

    useEffect(() => {
        if (quotaToEdit) {
            // Trouver l'imprimante pour le pré-remplissage de la société
            const printer = printers.find(p => p.id === quotaToEdit.printer_id);
            if (printer) {
                setSelectedCompanyId(printer.company_id.toString());
            }

            // Pré-remplissage des données de quota
            const moisValue = quotaToEdit.mois ? quotaToEdit.mois.substring(0, 7) : '';
            setQuotaData({
                printer_id: quotaToEdit.printer_id || '',
                monthly_quota_bw: quotaToEdit.monthly_quota_bw || 0,
                monthly_quota_color: quotaToEdit.monthly_quota_color || 0,
                monthly_quota_bw_large: quotaToEdit.monthly_quota_bw_large || 0,
                monthly_quota_color_large: quotaToEdit.monthly_quota_color_large ?? 0,
                // Assurer que le format de la date est correct
                date_prelevement: quotaToEdit.date_prelevement ? new Date(quotaToEdit.date_prelevement).toISOString().substring(0, 10) : '',
                // Le champ "mois" est une chaîne 'YYYY-MM'
                mois: moisValue || '',
            });
        } else {
            // Mode ajout
            setQuotaData({
                printer_id: '',
                monthly_quota_bw: 0,
                monthly_quota_bw_large: 0,
                monthly_quota_color: 0,
                monthly_quota_color_large: 0,
                date_prelevement: '',
                mois: '',
            });
            setSelectedCompanyId(''); // Réinitialiser pour le mode ajout
        }
    }, [quotaToEdit, printers]);

    console.log("Edite quota",quotaToEdit);
    // Les autres fonctions handleChange, handleCompanyFilterChange, handleSubmit ne changent pas.
    const handleChange = (e) => {
  const { name, value } = e.target;
  const numericFields = [
    "monthly_quota_bw",
    "monthly_quota_color",
    "monthly_quota_bw_large",
    "monthly_quota_color_large"
  ];

  setQuotaData(prev => ({
    ...prev,
    [name]: numericFields.includes(name) ? parseInt(value, 10) || 0 : value,
  }));

  setFormError('');
};

    const handleCompanyFilterChange = (e) => {
        const companyId = e.target.value;
        setSelectedCompanyId(companyId);
        // Réinitialiser la sélection de l'imprimante
        setQuotaData(prev => ({ ...prev, printer_id: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!quotaData.printer_id) {
            setFormError("Veuillez sélectionner une imprimante.");
            return;
        }
        if (!quotaData.date_prelevement) {
            setFormError("Veuillez sélectionner une date de prélèvement.");
            return;
        }

        if (!quotaData.mois) {
            setFormError("Veuillez sélectionner un mois.");
            return;
        }

        onSave(quotaData);
    };

    const filteredPrinters = useMemo(() => {
        if (!selectedCompanyId || !printers) {
            return [];
        }
        return printers.filter(printer => printer.company_id === parseInt(selectedCompanyId));
    }, [printers, selectedCompanyId]);
    
    // Trouvez l'imprimante en mode édition pour l'affichage
    const printerToEdit = useMemo(() => {
        if (quotaToEdit && printers) {
            return printers.find(p => p.id === quotaToEdit.printer_id);
        }
        return null;
    }, [quotaToEdit, printers]);

    return (
        <div className="modal-overlay" ref={ref}>
            <div className="modal-content" style={style} >
                <div className="modal-header" style={style}>
                    <h2 style={style}>{quotaToEdit ? 'Modifier Quota' : 'Ajouter un Quota'}</h2>
                    <button style={style} onClick={onCloseForm} className="modal-close-button"><FiX /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {formError && <p className="error-message">{formError}</p>}

                    {/* Le champ de filtre de société s'affiche toujours */}
                    <div className="form-group" style={style}>
                        <label htmlFor="company_filter" style={style}>Sélectionner une Société :</label>
                        <select
                            style={style}
                            id="company_filter"
                            value={selectedCompanyId}
                            onChange={handleCompanyFilterChange}
                            required
                        >
                            <option style={style} value="">-- Sélectionner une société --</option>
                            {companies.map(c => (
                                <option style={style} key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={style}>
                        <label htmlFor="printer_id"style={style} >Imprimante:</label>
                        <select
                            style={style}
                            id="printer_id"
                            name="printer_id"
                            value={quotaData.printer_id}
                            onChange={handleChange}
                            required
                        >
                            <option style={style} value="">
                                {quotaToEdit ? '-- Imprimante sélectionnée --' : '-- Sélectionner une imprimante --'}
                            </option>
                            {quotaToEdit ? (
                                // Affiche l'imprimante éditée
                                printerToEdit && (
                                    <option style={style} key={printerToEdit.id} value={printerToEdit.id}>
                                        {`${printerToEdit.model} - ${printerToEdit.serial} (${printerToEdit.department?.name || 'N/A'})`}
                                    </option>
                                )
                            ) : (
                                // Affiche les imprimantes filtrées pour l'ajout
                                filteredPrinters.map(p => (
                                    <option style={style} key={p.id} value={p.id}>
                                        {`${p.model} - ${p.serial} (${p.department?.name  || 'N/A'})`}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-group" style={style}>
                        <label htmlFor="monthly_quota_bw" style={style}> Mensuel N&B :</label>
                        <input
                            style={style}
                            type="text"
                            id="monthly_quota_bw"
                            name="monthly_quota_bw"
                            value={quotaData.monthly_quota_bw}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                   {
                    isColorPrinter &&( 
                        <>
                            <div className="form-group" style={style}>
                            <label htmlFor="monthly_quota_color" style={style}> Mensuel Couleur :</label>
                            <input
                                style={style}
                                type="text"
                                id="monthly_quota_color"
                                name="monthly_quota_color"
                                value={quotaData.monthly_quota_color}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        <div className="form-group" style={style}>
                            <label htmlFor="monthly_quota_color_large" style={style}> Mensuel Couleur Grand Format :</label>
                            <input
                                style={style}
                                type="text"
                                id="monthly_quota_color_large"
                                name="monthly_quota_color_large"
                                value={quotaData.monthly_quota_color_large}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </>
                    )
                }
                    <div className="form-group" style={style}>
                            <label htmlFor="monthly_quota_bw_large" style={style}> Mensuel N&B Grand Format :</label>
                            <input
                                style={style}
                                type="text"
                                id="monthly_quota_bw_large"
                                name="monthly_quota_bw_large"
                                value={quotaData.monthly_quota_bw_large}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                    <div className="form-group" style={style}>
                        <label htmlFor="date_prelevement" style={style}>Date de prélèvement :</label>
                        <input
                            style={style}
                            type="date"
                            id="date_prelevement"
                            name="date_prelevement"
                            value={quotaData.date_prelevement}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group" style={style}>
                        <label htmlFor="mois" style={style}>Mois de prélèvement :</label>
                        <input
                            style={style}
                            type="month"
                            id="mois"
                            name="mois"
                            value={quotaData.mois}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCloseForm} className="form-button cancel">
                            Annuler
                        </button>
                        <button type="submit" className="form-button submit">
                            {quotaToEdit ? 'Enregistrer les modifications' : 'Ajouter Quota'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddQuotaForm;