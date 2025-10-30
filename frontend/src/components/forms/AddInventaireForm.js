// src/components/forms/AddInventaireForm.js

import React, { useState, useEffect, forwardRef, useLayoutEffect } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/FormModal.css';
import { API_BASE_URL } from '../../api';
import axios from 'axios';

const AddInventaireForm = forwardRef(
    ({ inventaireToEdit, onSave, onCloseForm, setError, style }, formRef) => {
        const [materiels, setMateriels] = useState([]);
        const [allPrinters, setAllPrinters] = useState([]);
        const [companies, setCompanies] = useState([]);
        const [allDepartments, setAllDepartments] = useState([]);
        
        // États de sélection en cascade
        const [selectedCompanyId, setSelectedCompanyId] = useState('');
        const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
        const [filteredDepartments, setFilteredDepartments] = useState([]);
        const [filteredPrinters, setFilteredPrinters] = useState([]);

        const authToken = localStorage.getItem('authToken');
        const isEditMode = !!inventaireToEdit;

        const [inventaireData, setInventaireData] = useState({
            materiel_id: '',
            printer_id: '',
            quantite: 0,
            date_deplacement: '',
        });

        const [initialData, setInitialData] = useState(null);
        const [localError, setLocalError] = useState('');
        const [apiError, setApiError] = useState('');

        // Formatage de date
        const formatDate = (dateString) => {
            if (!dateString) return '';
            try {
                if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return dateString;
                }
                const date = new Date(dateString);
                if (isNaN(date)) return '';
                return date.toISOString().split('T')[0];
            } catch (e) {
                return '';
            }
        };

        // Récupération des données initiales
        useLayoutEffect(() => {
            const fetchData = async () => {
                try {
                    const headers = {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    };
                    const [materielsRes, printersRes, companiesRes, departmentsRes] = await Promise.all([
                        axios.get(`${API_BASE_URL}/materiel`, { headers }),
                        axios.get(`${API_BASE_URL}/printers`, { headers }),
                        axios.get(`${API_BASE_URL}/companies`, { headers }),
                        axios.get(`${API_BASE_URL}/departments`, { headers }),
                    ]);

                    setMateriels(materielsRes.data);
                    setAllPrinters(printersRes.data);
                    setCompanies(companiesRes.data);
                    setAllDepartments(departmentsRes.data);
                } catch (err) {
                    console.error("Erreur fetch données initiales:", err);
                    setApiError("Impossible de charger les listes nécessaires.");
                }
            };

            fetchData();
        }, [authToken, setError]);

        // 🔹 ÉTAPE 1 : Filtrage des départements selon la société sélectionnée
        useEffect(() => {
            if (selectedCompanyId) {
                const depts = allDepartments.filter(d => d.company_id === parseInt(selectedCompanyId, 10));
                setFilteredDepartments(depts);
                
                // Réinitialiser le département si plus valide
                if (selectedDepartmentId && !depts.find(d => d.id === parseInt(selectedDepartmentId, 10))) {
                    setSelectedDepartmentId('');
                }
            } else {
                setFilteredDepartments([]);
                setSelectedDepartmentId('');
            }
        }, [selectedCompanyId, allDepartments, selectedDepartmentId]);

        // 🔹 ÉTAPE 2 : Filtrage des imprimantes selon société ET département
        useEffect(() => {
            let printers = allPrinters;

            if (selectedCompanyId) {
                printers = printers.filter(p => p.company_id === parseInt(selectedCompanyId, 10));
            }

            if (selectedDepartmentId) {
                printers = printers.filter(p => p.department_id === parseInt(selectedDepartmentId, 10));
            }

            setFilteredPrinters(printers);

            // Réinitialiser l'imprimante si plus dans la liste filtrée
            if (inventaireData.printer_id && !printers.find(p => p.id === inventaireData.printer_id)) {
                setInventaireData(prev => ({ ...prev, printer_id: '' }));
            }
        }, [selectedCompanyId, selectedDepartmentId, allPrinters]);

        // Initialisation du formulaire (mode édition ou ajout)
        useLayoutEffect(() => {
            if (isEditMode && inventaireToEdit) {
                const printer = allPrinters.find(p => p.id === inventaireToEdit.printer_id);
                
                if (printer) {
                    setSelectedCompanyId(String(printer.company_id) || '');
                    setSelectedDepartmentId(String(printer.department_id) || '');
                }

                const editData = {
                    materiel_id: inventaireToEdit.materiel_id || '',
                    printer_id: inventaireToEdit.printer_id || '',
                    quantite: inventaireToEdit.quantite || 0,
                    date_deplacement: formatDate(inventaireToEdit.date_deplacement), 
                };
                setInventaireData(editData);
                setInitialData(editData);
            } else if (!isEditMode && materiels.length > 0) {
                setInventaireData(prev => ({
                    ...prev,
                    materiel_id: materiels[0].id,
                    quantite: 1,
                    date_deplacement: formatDate(new Date().toISOString()),
                }));
            }
            setLocalError('');
            setApiError('');
        }, [inventaireToEdit, isEditMode, materiels, allPrinters]);

        // Gestion des changements dans les champs normaux
        const handleChange = (e) => {
            const { name, value } = e.target;
            setInventaireData(prev => ({
                ...prev,
                [name]: ['materiel_id', 'printer_id', 'quantite'].includes(name) ? parseInt(value || 0, 10) : value
            }));
            setLocalError(''); // Reset erreurs lors de la modification
            setApiError('');
        };

        // Gestion du changement de société
        const handleCompanyChange = (e) => {
            const companyId = e.target.value;
            setSelectedCompanyId(companyId);
            setSelectedDepartmentId(''); // Reset département
            setInventaireData(prev => ({ ...prev, printer_id: '' })); // Reset imprimante
            setLocalError(''); // Reset erreurs
            setApiError('');
        };

        // Gestion du changement de département
        const handleDepartmentChange = (e) => {
            const deptId = e.target.value;
            setSelectedDepartmentId(deptId);
            setInventaireData(prev => ({ ...prev, printer_id: '' })); // Reset imprimante
            setLocalError(''); // Reset erreurs
            setApiError('');
        };

        // Soumission du formulaire
        const handleSubmit = async (e) => {
            e.preventDefault();
            setLocalError('');
            setApiError('');

            if (!inventaireData.materiel_id || !inventaireData.printer_id) {
                setLocalError('Veuillez sélectionner un matériel et une imprimante.');
                return;
            }
            if (inventaireData.quantite <= 0) {
                setLocalError('La quantité doit être supérieure à zéro.');
                return;
            }

            const dataToSave = isEditMode
                ? { ...inventaireData, id: inventaireToEdit.id }
                : inventaireData;

            try {
                await onSave(dataToSave);
            } catch (err) {
                console.error('Erreur sauvegarde inventaire:', err);
                const errorMsg = err?.response?.data?.message || 
                               err?.response?.data?.error ||
                               "Erreur lors de la sauvegarde.";
                setApiError(errorMsg);
            }
        };

        

        return (
            <div className="modal-overlay" ref={formRef} style={style}>
                <div className="modal-content" style={style}>
                    <div className="modal-header" style={style}>
                        <h2 style={style}>
                            {isEditMode ? 'Modifier l\'Inventaire' : 'Ajouter un Nouveau Mouvement d\'Inventaire'}
                        </h2>
                        <button style={style} onClick={onCloseForm} className="modal-close-button">
                            <FiX />
                        </button>
                    </div>

                    {localError && <div className="alert alert-error">{localError}</div>}
                    {apiError && <div className="alert alert-error">{apiError}</div>}

                    <form onSubmit={handleSubmit} style={style}>
                        
                        {/* MATÉRIEL */}
                        <div className="form-group">
                            <label htmlFor="materiel_id">Matériel :</label>
                            <select
                                id="materiel_id"
                                name="materiel_id"
                                value={inventaireData.materiel_id}
                                onChange={handleChange}
                                required
                                disabled={isEditMode}
                            >
                                <option value="">-- Sélectionner un matériel --</option>
                                {materiels.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.reference})</option>
                                ))}
                            </select>
                        </div>

                        {/* 🔹 ÉTAPE 1 : SOCIÉTÉ (obligatoire pour activer département) */}
                        <div className="form-group">
                            <label htmlFor="selectedCompanyId">Société * :</label>
                            <select
                                id="selectedCompanyId"
                                name="selectedCompanyId"
                                value={selectedCompanyId}
                                onChange={handleCompanyChange}
                                required
                                disabled={isEditMode}
                            >
                                <option value="">-- Sélectionner une société --</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 🔹 ÉTAPE 2 : DÉPARTEMENT (actif uniquement si société sélectionnée) */}
                        <div className="form-group">
                            <label htmlFor="selectedDepartmentId">Département * :</label>
                            <select
                                id="selectedDepartmentId"
                                name="selectedDepartmentId"
                                value={selectedDepartmentId}
                                onChange={handleDepartmentChange}
                                required
                                disabled={!selectedCompanyId || isEditMode}
                            >
                                <option value="">-- Sélectionner un département --</option>
                                {filteredDepartments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            {!selectedCompanyId && (
                                <small style={{ color: '#999' }}>Sélectionnez d'abord une société</small>
                            )}
                        </div>

                        {/* 🔹 ÉTAPE 3 : IMPRIMANTE (actif uniquement si département sélectionné) */}
                        <div className="form-group">
                            <label htmlFor="printer_id">Imprimante de destination * :</label>
                            <select
                                id="printer_id"
                                name="printer_id"
                                value={inventaireData.printer_id}
                                onChange={handleChange}
                                required
                                disabled={!selectedDepartmentId}
                            >
                                <option value="">-- Sélectionner une imprimante --</option>
                                {filteredPrinters.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.model} - {p.serial}
                                    </option>
                                ))}
                            </select>
                            {!selectedDepartmentId && (
                                <small style={{ color: '#999' }}>Sélectionnez d'abord un département</small>
                            )}
                            {selectedDepartmentId && filteredPrinters.length === 0 && (
                                <small style={{ color: '#ff6b6b' }}>Aucune imprimante disponible dans ce département</small>
                            )}
                        </div>

                        {/* QUANTITÉ */}
                        <div className="form-group">
                            <label htmlFor="quantite">Quantité :</label>
                            <input
                                type="number"
                                id="quantite"
                                name="quantite"
                                value={inventaireData.quantite}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>

                        {/* DATE */}
                        <div className="form-group">
                            <label htmlFor="date_deplacement">Date du mouvement :</label>
                            <input
                                type="date"
                                id="date_deplacement"
                                name="date_deplacement"
                                value={inventaireData.date_deplacement}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={onCloseForm} className="form-button cancel">Annuler</button>
                            <button type="submit" className="form-button submit">
                                {isEditMode ? 'Mettre à jour' : 'Ajouter Mouvement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
);

export default AddInventaireForm;