// src/components/forms/AddPrinterForm.js
import React, { useState, useEffect, forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import '../styles/FormModal.css';

import { API_BASE_URL } from '../../api';

const AddPrinterForm = forwardRef(({ printerToEdit, onSave, onCloseForm,style }, ref) => {
    const [printerData, setPrinterData] = useState({
        model: '',
        brand: '',
        serial: '',
        status: 'active',
        statusDisplay: 'Active',
        company_id: '',
        department_id: '',
        monthly_quota_color: 0,
        monthly_quota_bw: 0,
        monthly_quota_color_large: 0,
        monthly_quota_bw_large: 0,
        interventions: 0,
        installDate: new Date().toISOString().split('T')[0],
        is_purchased: false,
    });

    
    const [loadingMarques, setLoadingMarques] = useState(true);
    const [errorMarques, setErrorMarques] = useState(null);
    const [loadingModels, setLoadingModels] = useState(true);
    const [errorModels, setErrorModels] = useState(null);


    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);

    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [errorCompanies, setErrorCompanies] = useState(null);


    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [errorDepartments, setErrorDepartments] = useState(null);

    const [formError, setFormError] = useState('');

    const API_BRANDS_URL = `${API_BASE_URL}/brands`;
    const API_MODELS_URL = `${API_BASE_URL}/printer-models`;

    // Charger marques + modèles
    // Correction dans useEffect qui charge les marques et modèles
useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const [brandsResponse, modelsResponse] = await Promise.all([
                axios.get(API_BRANDS_URL, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }),
                axios.get(API_MODELS_URL, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }),
            ]);

            // setBrands(brandsResponse.data);
            // setModels(modelsResponse.data);
             // ✅ La CORRECTION est ici : tu dois accéder à la clé "data" de la réponse de pagination
            setBrands(brandsResponse.data.data); // Supposons que l'API des marques renvoie un tableau direct
            setModels(modelsResponse.data.data); // <--- L'erreur vient d'ici, il faut extraire le tableau "data"
            
            // ✅ stop les loaders
            setLoadingMarques(false);
            setLoadingModels(false);
        } catch (error) {
            console.error("Erreur lors du chargement des données marques/models:", error);
            setErrorMarques("Impossible de charger les marques");
            setErrorModels("Impossible de charger les modèles");

            // ✅ stop aussi les loaders en cas d'erreur
            setLoadingMarques(false);
            setLoadingModels(false);
        }
    };
    fetchData();
}, []);

    // Charger sociétés
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoadingCompanies(true);
                setErrorCompanies(null);

                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_BASE_URL}/companies`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const activeCompanies = response.data.filter(company => company.status === 'active');
                setCompanies(activeCompanies);

                if (printerToEdit?.company_id) {
                    setPrinterData(prev => ({ ...prev, company_id: printerToEdit.company_id }));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des sociétés:", error);
                setErrorCompanies("Impossible de charger les sociétés. " + (error.response?.data?.message || error.message));
            } finally {
                setLoadingCompanies(false);
            }
        };

        fetchCompanies();
    }, [printerToEdit]);

    // Charger départements selon la société choisie
    useEffect(() => {
        const fetchDepartments = async () => {
            if (!printerData.company_id) {
                setDepartments([]);
                setPrinterData(prev => ({ ...prev, department_id: '' }));
                return;
            }

            try {
                setLoadingDepartments(true);
                setErrorDepartments(null);

                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_BASE_URL}/departments?company_id=${printerData.company_id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                setDepartments(response.data);

                if (printerToEdit?.department_id && response.data.some(d => d.id === printerToEdit.department_id)) {
                    setPrinterData(prev => ({ ...prev, department_id: printerToEdit.department_id }));
                } else {
                    setPrinterData(prev => ({ ...prev, department_id: '' }));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des départements:", error);
                setErrorDepartments("Impossible de charger les départements. " + (error.response?.data?.message || error.message));
            } finally {
                setLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, [printerData.company_id, printerToEdit]);

    // Pré-remplissage en édition
    useEffect(() => {
        if (printerToEdit) {
            setPrinterData({
                model: printerToEdit.model || '',
                brand: printerToEdit.brand || '',
                serial: printerToEdit.serial || '',
                status: printerToEdit.status || 'active',
                statusDisplay: printerToEdit.statusDisplay || 'Active',
                company_id: printerToEdit.company_id || '',
                department_id: printerToEdit.department_id || '',
                installDate: printerToEdit.installDate
                    ? new Date(printerToEdit.installDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                is_purchased: printerToEdit.is_purchased || false,
                monthly_quota_color: printerToEdit.monthly_quota_color || 0,
                monthly_quota_bw: printerToEdit.monthly_quota_bw || 0,
                monthly_quota_color_large: printerToEdit.monthly_quota_color_large || 0,
                monthly_quota_bw_large: printerToEdit.monthly_quota_bw_large || 0,
            });
        }
    }, [printerToEdit]);

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  const numericFields = [
    "monthly_quota_bw",
    "monthly_quota_color",
    "monthly_quota_bw_large",
    "monthly_quota_color_large"
  ];

  let newValue;
  if (type === "checkbox") {
    newValue = checked;
  } else if (numericFields.includes(name)) {
    newValue = value === "" ? 0 : parseInt(value, 10);
  } else {
    newValue = value;
  }

  setPrinterData((prev) => ({ ...prev, [name]: newValue }));
  setFormError("");
};

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!printerData.model || !printerData.brand || !printerData.company_id) {
            setFormError("Veuillez remplir le modèle, la marque et la société.");
            return;
        }
        if (printerData.company_id && departments.length > 0 && !printerData.department_id) {
            setFormError("Veuillez sélectionner un département.");
            return;
        }
        // ✅ Valider les champs de quota
        if (printerData.total_quota_pages <= 0) {
            setFormError("Le quota total de pages doit être un nombre positif.");
            return;
        }
        if (printerData.monthly_quota_bw < 0 ) {
             setFormError("Le monthly_quota_bw doit être un nombre positif pour les imprimantes couleur.");
            return;
        }
        if (printerData.monthly_quota_color < 0 ) {
             setFormError("Le monthly_quota_color doit être un nombre positif pour les imprimantes couleur.");
            return;
        }

       const { statusDisplay, interventions, ...dataToSend } = printerData;
       
    console.log(dataToSend)
        onSave(dataToSend);
    };

    return (
        <div className="modal-overlay" ref={ref} style={style}>
            <div className="modal-content"  style={style}>
                <div className="modal-header"  style={style}>
                    <h2  style={style}>{printerToEdit ? 'Modifier Imprimante' : 'Ajouter une Imprimante'}</h2>
                    <button onClick={onCloseForm} className="modal-close-button"  style={style}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit}  style={style}>
                    {formError && <p className="error-message"  style={style}>{formError}</p>}

                    <div className="form-group"  style={style}>
                        <label htmlFor="model"  style={style}>Modèle:</label>
                        {loadingModels ? <p  style={style}>Chargement...</p> : errorModels ? <p className="error-message"  style={style}>{errorModels}</p> : (
                            <select  style={style} id="model" name="model" value={printerData.model} onChange={handleChange} required>
                                <option  style={style} value="">-- Sélectionner un modèle --</option>
                                {models.map(m => <option  style={style} key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        )}
                        {/* <input type="text" id="model" name="model" value={printerData.model} onChange={handleChange} required /> */}
                    </div>
                    <div className="form-group"  style={style}>
                        <label htmlFor="brand"  style={style}>Marque:</label>
                        {loadingMarques ? <p  style={style}>Chargement...</p> : errorMarques ? <p   style={style} className="error-message">{errorMarques}</p> : (
                            <select  style={style} id="brand" name="brand" value={printerData.brand} onChange={handleChange} required>
                                <option  style={style} value="">-- Sélectionner une marque --</option>
                                {brands.map(m => <option  style={style} key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="form-group"  style={style}>
                        <label htmlFor="serial"  style={style}>Numéro de série :</label>
                        <input  style={style} type="text" id="serial" name="serial" value={printerData.serial} onChange={handleChange} />
                    </div>
                    <div className="form-group"  style={style}>
                        <label htmlFor="status"  style={style}>Statut:</label>
                        <select  style={style} id="status" name="status" value={printerData.status} onChange={handleChange} required>
                            <option  style={style} value="active">Active</option>
                            <option  style={style} value="maintenance">En maintenance</option>
                            <option  style={style} value="hors-service">Hors service</option>
                            <option  style={style} value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="form-group" style={style}>
                        <label htmlFor="company_id"  style={style}>Société:</label>
                        {loadingCompanies ? <p  style={style}>Chargement...</p> : errorCompanies ? <p className="error-message">{errorCompanies}</p> : (
                            <select  style={style} id="company_id" name="company_id" value={printerData.company_id} onChange={handleChange} required>
                                <option  style={style} value="">-- Sélectionner une société --</option>
                                {companies.map(c => <option  style={style} key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="form-group"  style={style}>
                        <label htmlFor="department_id" style={style}>Département:</label>
                        {loadingDepartments ? <p  style={style}>Chargement...</p> : errorDepartments ? <p className="error-message"  style={style}>{errorDepartments}</p> : (
                            <select  style={style} id="department_id" name="department_id" value={printerData.department_id} onChange={handleChange} required={!!printerData.company_id && departments.length > 0} disabled={!printerData.company_id || departments.length === 0}>
                                <option  style={style} value="">-- Sélectionner un département --</option>
                                {departments.map(d => <option  style={style} key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        )}
                    </div>

                        <div className="form-group"  style={style}>
                            <label  style={style} htmlFor="monthly_quota_bw"> Mensuel N&B :</label>
                            <input
                                style={style}
                                type="text"
                                id="monthly_quota_bw"
                                name="monthly_quota_bw"
                                value={printerData.monthly_quota_bw}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        {
                            printerData.model && printerData.model.includes("C") && (
                                <>
                                    <div className="form-group"  style={style}>
                                        <label htmlFor="monthly_quota_color"  style={style}>Mensuel Couleur :</label>
                                        <input
                                            style={style}
                                            type="text"
                                            id="monthly_quota_color"
                                            name="monthly_quota_color"
                                            value={printerData.monthly_quota_color}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group"  style={style}>
                                        <label htmlFor="monthly_quota_color_large"  style={style}>
                                            Mensuel Grand Format Couleur :
                                        </label>
                                        <input
                                             style={style}
                                            type="text"   // <-- maintenant c’est un champ texte
                                            id="monthly_quota_color_large"
                                            name="monthly_quota_color_large"
                                            value={printerData.monthly_quota_color_large}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </>
                            )
                        }

                        
                        <div className="form-group"  style={style}>
                            <label htmlFor="monthly_quota_bw_large"  style={style}> Mensuel Grand Format N&B :</label>
                            <input
                                style={style}
                                type="text"
                                id="monthly_quota_bw_large"
                                name="monthly_quota_bw_large"
                                value={printerData.monthly_quota_bw_large}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        
                    <div className="form-group"  style={style}>
                        <label  style={style} htmlFor="installDate">Installée le:</label>
                        <input  style={style} type="date" id="installDate" name="installDate" value={printerData.installDate} onChange={handleChange} />
                    </div>
                    <div className="form-group checkbox-group"  style={style}>
                        <label htmlFor="is_purchased"  style={style}>Achetée par la société:</label>
                        <input type="checkbox" id="is_purchased" name="is_purchased" checked={printerData.is_purchased} onChange={handleChange}  style={style} />
                    </div>
                    
                    
                    <div className="form-actions">
                        <button type="button" onClick={onCloseForm} className="form-button cancel">Annuler</button>
                        <button type="submit" className="form-button submit">{printerToEdit ? 'Enregistrer les modifications' : 'Ajouter Imprimante'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddPrinterForm;
