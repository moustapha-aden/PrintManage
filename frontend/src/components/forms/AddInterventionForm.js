import React, { useState, useEffect, useMemo,forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import '../styles/FormModal.css';

import { API_BASE_URL } from '../../api';

// Fonction pour obtenir la date locale au format datetime-local
const getLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AddInterventionForm = forwardRef(({
    interventionToEdit,
    onSave,
    onCloseForm,
    currentUserRole,
    currentUserId,
    clientDepartmentId,
    style,
    materielleData
},formRef) => {
    const [interventionData, setInterventionData] = useState({
        numero_demande: '',
        start_date: '',
        end_date: '',
        date_previsionnelle: '',
        client_id: '',
        printer_id: '',
        technician_id: '',
        status: 'En Attente',
        description: '',
        solution:'',
        start_date_intervention:'',
        priority: 'Moyenne',
        notes: '',
        intervention_type: 'Réparation',
        other_intervention_type: '',
    });
    // **NOUVEAU** : État pour le fichier photo
    const [photo, setPhoto] = useState(null);
    // **NOUVEAU** : État pour l'URL de la photo existante (en mode édition)
    const [existingPhotoUrl, setExistingPhotoUrl] = useState('');

    const [formError, setFormError] = useState('');

    const [allPrinters, setAllPrinters] = useState([]);
    const [clients, setClients] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [dataError, setDataError] = useState(null);

    const allowedStatuses = ['En Attente', 'En Cours', 'Terminée', 'Annulée'];

    const generate8DigitCode = () => {
        const randomNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
        return `HX${randomNumber}`;
    };

    useEffect(() => {
        const fetchDataForDropdowns = async () => {
            setLoadingData(true);
            setDataError(null);
            const token = localStorage.getItem('authToken');
            const headers = { Authorization: `Bearer ${token}` };

            try {
                const printersResponse = await axios.get(`${API_BASE_URL}/printers?with=company,department`, { headers });
                setAllPrinters(printersResponse.data);

                const usersResponse = await axios.get(`${API_BASE_URL}/users?with=company,department`, { headers });
                setClients(usersResponse.data.filter(user => user.role === 'client'));
                setTechnicians(usersResponse.data.filter(user => user.role === 'technicien'));

            } catch (err) {
                console.error("Erreur lors du chargement des données pour le formulaire d'intervention:", err.response ? err.response.data : err.message);
                setDataError("Impossible de charger les données nécessaires (imprimantes, clients, techniciens).");
            } finally {
                setLoadingData(false);
            }
        };
        fetchDataForDropdowns();
    }, []);

    useEffect(() => {
        if (interventionToEdit) {
            const predefinedTypes = ['Réparation', 'Installation', 'Maintenance Préventive', 'Démontage', 'Diagnostic'];
            const existingType = interventionToEdit.intervention_type;
            const isPredefined = predefinedTypes.includes(existingType);

            // test 
            console.log("date start_date",interventionToEdit.start_date );
            setInterventionData({
                numero_demande: interventionToEdit.numero_demande || '',
                start_date: interventionToEdit.start_date ? new Date(interventionToEdit.start_date).toISOString().slice(0, 16) : '',
                end_date: interventionToEdit.end_date ? new Date(interventionToEdit.end_date).toISOString().slice(0, 16) : '',
                date_previsionnelle: interventionToEdit.date_previsionnelle ? new Date(interventionToEdit.date_previsionnelle).toISOString().slice(0, 16) : '',
                client_id: interventionToEdit.client_id || '',
                printer_id: interventionToEdit.printer_id || '',
                technician_id: interventionToEdit.technician_id || '',
                status: allowedStatuses.includes(interventionToEdit.status) ? interventionToEdit.status : 'En Attente',
                description: interventionToEdit.description || '',
                priority: interventionToEdit.priority || 'Moyenne',
                notes: interventionToEdit.notes || '',
                solution:interventionToEdit.solution || '',
                start_date_intervention:interventionToEdit.start_date_intervention ? new Date(interventionToEdit.start_date_intervention).toISOString().slice(0, 16) : '',
                intervention_type: isPredefined ? existingType : 'Autre',
                other_intervention_type: isPredefined ? '' : existingType,
            });
            // **NOUVEAU** : Charger l'URL de la photo existante
            if (interventionToEdit.photo_path) {
                // Assurez-vous que l'URL est complète si elle est relative
                setExistingPhotoUrl(`${API_BASE_URL}/interventions/photos/${interventionToEdit.photo_path}`); // Adaptez le chemin si nécessaire
            } else {
                setExistingPhotoUrl('');
            }
            setPhoto(null); // Réinitialiser le fichier sélectionné lors de l'édition
        } else {
            setInterventionData(prev => ({
                ...prev,
                numero_demande: generate8DigitCode(),
                start_date: getLocalDateTime(),
                date_previsionnelle: '',
                client_id: currentUserRole === 'client' && currentUserId ? currentUserId : '',
                technician_id: currentUserRole === 'client' ? '' : (currentUserRole === 'technicien' && currentUserId ? currentUserId : ''),
                status: 'En Attente',
                description: '',
                intervention_type: 'Réparation',
                other_intervention_type: '',
            }));
            // **NOUVEAU** : Réinitialiser la photo pour une nouvelle intervention
            setPhoto(null);
            setExistingPhotoUrl('');
        }
    }, [interventionToEdit, currentUserRole, currentUserId]);

    const selectedClient = useMemo(() => {
        if (currentUserRole === 'client' && currentUserId) {
            return clients.find(client => String(client.id) === String(currentUserId));
        }
        return clients.find(client => String(client.id) === String(interventionData.client_id));
    }, [clients, interventionData.client_id, currentUserRole, currentUserId]);


    const filteredPrintersForDropdown = useMemo(() => {
        const targetDepartmentId = selectedClient?.department_id;
        const targetCompanyId = selectedClient?.company_id; // Nouveau : Obtenir l'ID de la société du client


         if (targetDepartmentId) {
        // Si un département est défini, filtrez uniquement par département
        return allPrinters.filter(printer =>
            printer.department_id && String(printer.department_id) === String(targetDepartmentId)
        );
    } 
    
    // Si le client n'a pas de département, mais a une société, filtrez par société
    if (!targetDepartmentId && targetCompanyId) {
        return allPrinters.filter(printer =>
            printer.department?.company_id && String(printer.department.company_id) === String(targetCompanyId)
        );
    }
    
    // Si ni département ni société n'est défini pour le client, affichez toutes les imprimantes
    return allPrinters;

    }, [allPrinters, selectedClient]);


    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            // **NOUVEAU** : Gérer le champ de fichier
            setPhoto(files[0]);
            setFormError('');
        } else {
            setInterventionData(prevData => {
                const newData = { ...prevData, [name]: value };

                if (name === 'client_id') {
                    newData.printer_id = '';
                    setFormError('');
                }

                if (name === 'intervention_type' && value !== 'Autre') {
                    newData.other_intervention_type = '';
                }

                if (name === 'technician_id' && value !== '' && prevData.status === 'En Attente') {
                    if (currentUserRole === 'admin' || currentUserRole === 'technicien') {
                        newData.status = 'En Cours';
                    }
                }
                return newData;
            });
            setFormError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        let finalInterventionType = interventionData.intervention_type;
        if (interventionData.intervention_type === 'Autre') {
            if (!interventionData.other_intervention_type.trim()) {
                setFormError("Veuillez spécifier le type d'intervention 'Autre'.");
                return;
            }
            finalInterventionType = interventionData.other_intervention_type.trim();
        }

        if (!interventionData.start_date || !interventionData.priority || !finalInterventionType) {
            setFormError("Veuillez remplir tous les champs obligatoires (Date de début, Priorité, Type d'intervention).");
            return;
        }

        if (currentUserRole === 'client') {
            // No specific client-side validation needed for disabled fields
        } else if (currentUserRole === 'admin' || currentUserRole === 'technicien') {
            if (!interventionData.client_id) {
                setFormError("Veuillez sélectionner un client pour cette intervention.");
                return;
            }
            if (!interventionData.technician_id && (currentUserRole === 'admin' || (currentUserRole === 'technicien' && !isEditingMode))) {
                setFormError("Veuillez sélectionner un technicien pour cette intervention.");
                return;
            }
            if (!interventionData.status) {
                setFormError("Veuillez sélectionner un statut pour cette intervention.");
                return;
            }
        }

        if (!interventionData.printer_id) {
            setFormError("Veuillez sélectionner une imprimante.");
            return;
        }

        if (interventionData.end_date) {
            const startDateObj = new Date(interventionData.start_date);
            const endDateObj = new Date(interventionData.end_date);
            if (endDateObj < startDateObj) {
                setFormError("La date de fin ne peut pas être antérieure à la date de début.");
                return;
            }
        }

        if (interventionData.date_previsionnelle) {
            const startDateObj = new Date(interventionData.start_date);
            const provisionalDateObj = new Date(interventionData.date_previsionnelle);
            startDateObj.setHours(0, 0, 0, 0);
            provisionalDateObj.setHours(0, 0, 0, 0);

            if (provisionalDateObj < startDateObj) {
                setFormError("La date prévisionnelle ne peut pas être antérieure à la date de début.");
                return;
            }
        }

        // **NOUVEAU** : Utiliser FormData pour envoyer les fichiers
        const formData = new FormData();

        // Ajouter tous les champs textuels à FormData
        for (const key in interventionData) {
            // Gérer les valeurs nulles
            let value = interventionData[key];
            if (key === 'client_id' || key === 'printer_id' || key === 'technician_id') {
                formData.append(key, value ? Number(value) : ''); // Assurez-vous que les IDs sont des nombres ou des chaînes vides
            } else if (key === 'end_date' || key === 'date_previsionnelle' || key === 'description' || key === 'notes') {
                formData.append(key, value || ''); // Envoyer des chaînes vides pour les champs nullables
            } else {
                formData.append(key, value);
            }
        }
        formData.set('intervention_type', finalInterventionType); // Mettre à jour avec le type final

        // **NOUVEAU** : Ajouter le fichier photo si sélectionné
        if (photo) {
            formData.append('photo', photo);
        } else if (isEditingMode && existingPhotoUrl && !photo) {
            // Si c'est une édition et qu'il y a une photo existante mais pas de nouvelle sélection
            // Vous pouvez envoyer une indication au backend de ne pas modifier la photo, ou l'URL existante.
            // Pour l'exemple, nous n'envoyons rien, ce qui signifie que le backend ne doit pas modifier la photo s'il n'y en a pas de nouvelle.
            // Si vous voulez explicitement dire au backend de garder l'ancienne photo, vous pourriez ajouter:
            // formData.append('keep_existing_photo', 'true');
        } else if (isEditingMode && !photo && !existingPhotoUrl) {
            // Si c'est en mode édition et qu'il n'y a pas de photo existante ni de nouvelle,
            // vous pourriez vouloir signaler au backend qu'il n'y a pas de photo.
            // Par exemple: formData.append('photo', ''); // ou null, selon votre backend
        }


        // IMPORTANT : Pour les requêtes avec FormData (upload de fichiers),
        // il faut généralement définir le 'Content-Type' sur 'multipart/form-data'.
        // Cependant, axios le fait automatiquement quand vous lui passez un objet FormData,
        // donc PAS BESOIN de le définir explicitement dans les headers.

        // Passez formData à la fonction onSave
        onSave(formData);
    };

    // if (loadingData) {
    //     return (
    //         <div className="modal-overlay">
    //             <div className="modal-content">
    //                 <p>Chargement des données pour le formulaire...</p>
    //             </div>
    //         </div>
    //     );
    // }

    if (dataError) {
        return (
            <div className="modal-overlay" style={style}>
                <div className="modal-content">
                    <p className="error-message">{dataError}</p>
                    <button onClick={onCloseForm} className="form-button cancel">Fermer</button>
                </div>
            </div>
        );
    }

    const isClientRole = currentUserRole === 'client';
    const isEditingMode = !!interventionToEdit;

    return (
        <div className="modal-overlay" ref={formRef} style={style}>
            <div className="modal-content" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>{isEditingMode ? 'Modifier Intervention' : 'Ajouter une Nouvelle Intervention'}</h2>
                    <button style={style} onClick={onCloseForm} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={style}>
                    {formError && <p className="form-error-message">{formError}</p>}
                    {currentUserRole !=='client' &&(
                        <div style={style} className="form-group">
                        <label style={style} htmlFor="start_date">Date de intervention:</label>
                        <input
                            style={style}
                            type="datetime-local"
                            id="start_date"
                            name="start_date"
                            value={interventionData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    )}
                    

                    {currentUserRole !== 'client' && (
                        <div className="form-group" style={style}>
                            <label htmlFor="date_previsionnelle" style={style}>Date prévisionnelle:</label>
                            <input
                                style={style}
                                type="datetime-local"
                                id="date_previsionnelle"
                                name="date_previsionnelle"
                                value={interventionData.date_previsionnelle}
                                onChange={handleChange}
                                placeholder="Sélectionnez une date" // Ajout du placeholder ici
                            />
                        </div>
                    )}
                    {(currentUserRole !== 'client' || currentUserRole !== 'technicien') && isEditingMode &&(
                        <div className="form-group" style={style}>
                            <label htmlFor="start_date" style={style}>Date du début :</label>
                            <input
                                style={style}
                                type="datetime-local"
                                id="start_date_intervention"
                                name="start_date_intervention"
                                value={interventionData.start_date_intervention}
                                onChange={handleChange}
                                
                            />
                        </div>
                    )}

                    {(currentUserRole !== 'client' || currentUserRole !== 'technicien') && isEditingMode &&(
                        <div className="form-group" style={style}>
                            <label htmlFor="solution" style={style}>Solution :</label>
                            <textarea
                                style={style}
                                id="solution"
                                name="solution"
                                value={interventionData.solution}
                                onChange={handleChange}
                                rows="4" // Ajoutez cette propriété pour contrôler la taille de la zone de texte
                                placeholder="Décrivez la solution apportée à l'intervention..."
                            />
                        </div>
                    )}

                    {(currentUserRole !== 'client' || currentUserRole !== 'technicien') && isEditingMode &&(
                        <div className="form-group" style={style}>
                            <label htmlFor="end_date" style={style}>Date fin :</label>
                            <input
                                style={style}
                                type="datetime-local"
                                id="end_date"
                                name="end_date"
                                value={interventionData.end_date}
                                onChange={handleChange}
                                
                            />
                        </div>
                    )}

                    {isClientRole ? (
                        <input style={style} type="hidden" name="client_id" value={currentUserId} />
                    ) : (
                        <div className="form-group" style={style}>
                            <label htmlFor="client_id" style={style}>Client:</label>
                            <select
                                style={style}
                                id="client_id"
                                name="client_id"
                                value={interventionData.client_id}
                                onChange={handleChange}
                                required
                            >
                                <option style={style} value="">-- Sélectionner un client --</option>
                                {clients.map(client => (
                                    <option style={style} key={client.id} value={client.id}>
                                        {client.name} ({client.company?.name || 'N/A'} - {client.department?.name || 'N/A'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group" style={style}>
                        <label htmlFor="printer_id" style={style}>Imprimante:</label>
                        <select
                            style={style}
                            id="printer_id"
                            name="printer_id"
                            value={interventionData.printer_id}
                            onChange={handleChange}
                            required
                        >
                            <option style={style} value="">-- Sélectionner une imprimante --</option>
                            {filteredPrintersForDropdown.length > 0 ? (
                                filteredPrintersForDropdown.map(printer => (
                                    <option style={style} key={printer.id} value={printer.id}>
                                        {printer.brand} {printer.model} (S/N: {printer.serial}) - {printer.department?.name || 'N/A'}
                                    </option>
                                ))
                            ) : (
                                <option style={style} value="" disabled>Aucune imprimante disponible pour ce département</option>
                            )}
                        </select>
                    </div>

                    {currentUserRole !== 'client' && (
                        <div className="form-group" style={style}>
                            <label htmlFor="technician_id" style={style}>Technicien:</label>
                            <select
                                style={style}
                                id="technician_id"
                                name="technician_id"
                                value={interventionData.technician_id}
                                onChange={handleChange}
                                required={currentUserRole === 'admin' || (currentUserRole === 'technicien' && !isEditingMode)}
                                disabled={isClientRole || (isEditingMode && currentUserRole === 'technicien')}
                            >
                                <option style={style} value="">-- Sélectionner un technicien --</option>
                                {/* Pour affiche uniquement les techniciens actifs */}
                                {technicians.filter(tech => tech.status === "active").map(tech => (
                                    <option style={style} key={tech.id} value={tech.id}>
                                        {tech.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {currentUserRole !== 'client' && (
                        <div className="form-group" style={style}>
                            <label htmlFor="status" style={style}>Statut:</label>
                            <select
                                style={style}
                                id="status"
                                name="status"
                                value={interventionData.status}
                                onChange={handleChange}
                                required={currentUserRole === 'admin' || (currentUserRole === 'technicien' && !isEditingMode)}
                                disabled={isClientRole || (isEditingMode && currentUserRole === 'technicien')}
                            >
                                {allowedStatuses.map(statusOption => (
                                    <option style={style} key={statusOption} value={statusOption}>
                                        {statusOption}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group" style={style}>
                        <label htmlFor="intervention_type" style={style}>Type d'Intervention:</label>
                        <select
                            style={style}
                            id="intervention_type"
                            name="intervention_type"
                            value={interventionData.intervention_type}
                            onChange={handleChange}
                            required
                        >
                            <option style={style} value="Réparation">Réparation</option>
                            <option style={style} value="Installation">Installation</option>
                            <option style={style} value="Maintenance Préventive">Maintenance Préventive</option>
                            <option style={style} value="Démontage">Démontage</option>
                            <option style={style} value="Diagnostic">Diagnostic</option>
                            <option style={style} value="Telephonique">Téléphonique</option>
                            <option style={style} value="Autre">Autre (préciser ci-dessous)</option>
                        </select>
                    </div>

                    {interventionData.intervention_type === 'Autre' && (
                        <div className="form-group" style={style}>
                            <label htmlFor="other_intervention_type" style={style}>Préciser le type d'intervention:</label>
                            <input
                                style={style}
                                type="text"
                                id="other_intervention_type"
                                name="other_intervention_type"
                                value={interventionData.other_intervention_type}
                                onChange={handleChange}
                                required={interventionData.intervention_type === 'Autre'}
                                placeholder="Ex: Remplacement de pièce, Réglage logiciel..."
                            />
                        </div>
                    )}

                    <div className="form-group" style={style}>
                        <label htmlFor="description" style={style}>Description:</label>
                        <textarea
                            style={style}
                            id="description"
                            name="description"
                            value={interventionData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Décrivez le problème ou l'intervention effectuée..."
                        ></textarea>
                    </div>

                    <div className="form-group" style={style}>
                        <label htmlFor="priority" style={style}>Priorité:</label>
                        <select
                            style={style}
                            id="priority"
                            name="priority"
                            value={interventionData.priority}
                            onChange={handleChange}
                            required
                        >
                            <option style={style} value="Haute">Haute</option>
                            <option style={style} value="Moyenne">Moyenne</option>
                            <option style={style} value="Basse">Basse</option>
                        </select>
                    </div>

                    {/* NOUVEAU : Champ de téléchargement de photo */}
                    <div className="form-group" style={style}>
                        <label htmlFor="photo" style={style}>Photo (Optionnel):</label>
                        <input
                            style={style}
                            type="file"
                            id="photo"
                            name="photo"
                            accept="image/*" // Accepte seulement les fichiers image
                            onChange={handleChange}
                        />
                        {/* Afficher la photo existante si en mode édition */}
                        {isEditingMode && existingPhotoUrl && (
                            <div className="existing-photo-preview" style={style}>
                                <p style={style}>Photo actuelle :</p>
                                <img src={existingPhotoUrl} alt="Photo existante" style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '10px' }} />
                                {/* Option pour supprimer la photo existante (si nécessaire) */}
                                {/* <button type="button" onClick={() => setExistingPhotoUrl('')}>Supprimer la photo actuelle</button> */}
                            </div>
                        )}
                        {/* Prévisualisation de la nouvelle photo sélectionnée */}
                        {photo && (
                            <div className="new-photo-preview">
                                <p>Nouvelle photo sélectionnée :</p>
                                <img src={URL.createObjectURL(photo)} alt="Nouvelle photo" style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '10px' }} />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCloseForm} className="form-button cancel">Annuler</button>
                        <button type="submit" className="form-button submit">
                            {isEditingMode ? 'Enregistrer les modifications' : 'Ajouter Intervention'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddInterventionForm;