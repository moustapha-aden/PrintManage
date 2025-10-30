import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiSave, FiXCircle, FiTool, FiLock } from 'react-icons/fi';
import Popup from './Popup'; // Importez le nouveau composant
import '../styles/UserProfilePage.css';

import { API_BASE_URL } from '../../api';

const UserProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // L'état 'error' est toujours là pour les erreurs de chargement initiales
    const [isEditing, setIsEditing] = useState(false);
    const [popup, setPopup] = useState({ message: '', type: '' }); // État pour le popup
    const [formData, setFormData] = useState({
        old_password: '',
        password: '',
        password_confirmation: ''
    });

        const [isDarkMode, setIsDarkMode] = useState(false);
    const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};

    useEffect(() => {
        const storedTheme = localStorage.getItem('isDarkMode');
        setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
    }, []);
    
    const currentUserRole = localStorage.getItem('userRole');
    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!currentUserId) {
                setError("ID utilisateur non trouvé. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_BASE_URL}/users/${currentUserId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
                setFormData({
                    ...response.data,
                    old_password: '',
                    password: '',
                    password_confirmation: ''
                });
                setLoading(false);
                setError(null); // Réinitialise l'erreur après un chargement réussi
            } catch (err) {
                setError("Erreur lors du chargement du profil utilisateur."); // Ceci est pour les erreurs de chargement initiales
                console.error("Erreur API profil (chargement):", err.response ? err.response.data : err.message);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [currentUserId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Fonction pour fermer le popup
    const closePopup = () => {
        setPopup({ message: '', type: '' });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!['admin', 'technicien','client'].includes(currentUserRole)) {
            setPopup({ message: "Vous n'êtes pas autorisé à modifier votre profil.", type: 'error' });
            return;
        }

        const newPasswordEntered = formData.password.length > 0;

        if (newPasswordEntered) {
            if (formData.password !== formData.password_confirmation) {
                setPopup({ message: "Le nouveau mot de passe et sa confirmation ne correspondent pas.", type: 'error' });
                return;
            }
            if (formData.old_password.length === 0) {
                setPopup({ message: "Veuillez entrer votre ancien mot de passe pour le confirmer.", type: 'warning' });
                return;
            }
        }

        try {
            const token = localStorage.getItem('authToken');
            const dataToUpdate = { ...formData };

            if (!newPasswordEntered) {
                delete dataToUpdate.password;
                delete dataToUpdate.password_confirmation;
                delete dataToUpdate.old_password;
            }

            if (currentUserRole !== 'admin') {
                delete dataToUpdate.role;
            }

            await axios.put(`${API_BASE_URL}/users/${user.id}`, dataToUpdate, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Mise à jour de l'utilisateur avec les nouvelles données incluant le téléphone
            const updatedUser = { ...user, ...formData };
            delete updatedUser.password;
            delete updatedUser.password_confirmation;
            delete updatedUser.old_password;
            setUser(updatedUser);

            setIsEditing(false);
            setFormData(prev => ({
                ...updatedUser,
                old_password: '',
                password: '',
                password_confirmation: ''
            }));
            
            setPopup({ message: "Profil mis à jour avec succès !", type: 'success' }); // Message de succès
            // Ne pas réinitialiser 'error' ici, car il est pour les erreurs de chargement initiales
        } catch (err) {
            // Supprimé: setError("Erreur lors de la mise à jour du profil.");
            console.error("Erreur API SAVE profil:", err.response ? err.response.data : err.message);
            
            let message = 'Erreur lors de la mise à jour.';
            let popupType = 'error';

            if (err.response && err.response.status === 422 && err.response.data && err.response.data.errors) {
                const errors = err.response.data.errors;
                if (errors.old_password && errors.old_password.length > 0) {
                    message = errors.old_password[0];
                    popupType = 'error';
                } else if (errors.password && errors.password.length > 0) { // Pour les erreurs de validation du nouveau mot de passe
                    message = errors.password[0];
                    popupType = 'error';
                } else if (errors.phone && errors.phone.length > 0) { // Gestion des erreurs de téléphone
                    message = errors.phone[0];
                    popupType = 'error';
                } else {
                    message = 'Erreurs de validation: \n';
                    for (const field in errors) {
                        message += `- ${field}: ${errors[field].join(', ')}\n`;
                    }
                    popupType = 'error';
                }
            } else if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
                if (err.response.status === 403) {
                    popupType = 'error';
                } else {
                    popupType = 'error';
                }
            } else {
                message = "Une erreur inattendue est survenue. Veuillez réessayer.";
                popupType = 'error';
            }
            
            setPopup({ message, type: popupType }); // Affiche le popup d'erreur
        }
    };

    const handleEditClick = () => {
        if (!['admin', 'technicien','client'].includes(currentUserRole)) {
            setPopup({ message: "Vous n'êtes pas autorisé à modifier votre profil.", type: 'error' });
            return;
        }
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            ...user,
            old_password: '',
            password: '',
            password_confirmation: ''
        });
    };

    // L'affichage de l'erreur est maintenant seulement pour les problèmes de chargement initial
    if (error && !loading && !user) {
        return <p className="profile-container" style={{ color: 'red' }}>Erreur: {error}</p>;
    }

    if (!user && !loading) {
        return <div className="profile-container" style={cardStyle}>Aucun profil utilisateur trouvé.</div>;
    }

    // Affiche un indicateur de chargement si nécessaire
    if (loading) {
        return <div className="profile-container" style={cardStyle}>Chargement du profil utilisateur...</div>;
    }

    const canEdit = ['admin', 'technicien','client'].includes(currentUserRole);
    const isTechnician = currentUserRole === 'technicien';

    return (
        <div className="profile-container" style={cardStyle}>
            {/* Affiche le popup s'il y a un message */}
            <Popup message={popup.message} type={popup.type} onClose={closePopup} />

            <div className="profile-header" style={cardStyle}>
                <h2 style={cardStyle}>
                    {isTechnician && <FiTool className="technician-icon" />}
                    Profil de {user.name}
                </h2>
                <div className="profile-actions" >
                    {canEdit && !isEditing && (
                        <button className="edit-button" onClick={handleEditClick}>
                            <FiEdit /> Modifier le profil
                        </button>
                    )}
                    {canEdit && isEditing && (
                        <>
                            <button className="save-button" onClick={handleSaveProfile}>
                                <FiSave /> Enregistrer
                            </button>
                            <button className="cancel-button" onClick={handleCancelEdit}>
                                <FiXCircle /> Annuler
                            </button>
                        </>
                    )}
                </div>
            </div>

            <form className="profile-form" style={cardStyle} onSubmit={handleSaveProfile}>
                <div className="form-group" style={cardStyle}>
                    <label htmlFor="name" style={cardStyle}>Nom :</label>
                    <input
                        style={cardStyle}
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        readOnly={true}
                        className={(!isEditing || !canEdit) ? 'read-only' : ''}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email" style={cardStyle}>Email :</label>
                    <input
                        style={cardStyle}
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        readOnly={true}
                        className={(!isEditing || !canEdit) ? 'read-only' : ''}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role" style={cardStyle}>Rôle :</label>
                    <input
                        style={cardStyle}
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role || ''}
                        readOnly={true}
                        className="read-only"
                    />
                </div>
                    
                <div className="form-group">
                    <label htmlFor="Societe" style={cardStyle}>Societe :</label>
                    <input
                        style={cardStyle}
                        type="text"
                        id="Societe"
                        name="Societe"
                        value={formData.company?.name || ''}
                        readOnly={true}
                        className="read-only"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="Departement" style={cardStyle}>Departement :</label>
                    <input
                        style={cardStyle}
                        type="text"
                        id="Departement"
                        name="Departement"
                        value={formData.department?.name || ''}
                        readOnly={true}
                        className="read-only"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="phone" style={cardStyle}>Téléphone :</label>
                    <input
                        style={cardStyle}
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        readOnly={!isEditing || !canEdit}
                        className={(!isEditing || !canEdit) ? 'read-only' : ''}
                        placeholder={isEditing ? "Entrez votre numéro de téléphone" : ""}
                    />
                </div>

                {canEdit && isEditing && (
                    <>
                        <div className="form-group password-group">
                            <label htmlFor="old_password" style={cardStyle}><FiLock /> Ancien mot de passe :</label>
                            <input
                                style={cardStyle}
                                type="password"
                                id="old_password"
                                name="old_password"
                                value={formData.old_password}
                                onChange={handleChange}
                                placeholder="Entrez votre ancien mot de passe"
                                required={formData.password.length > 0}
                            />
                        </div>
                        <div className="form-group password-group">
                            <label htmlFor="password" style={cardStyle}><FiLock /> Nouveau mot de passe :</label>
                            <input
                                style={cardStyle}
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Laisser vide pour ne pas changer"
                            />
                        </div>
                        <div className="form-group password-group">
                            <label htmlFor="password_confirmation" style={cardStyle}>Confirmer nouveau mot de passe :</label>
                            <input
                                style={cardStyle}
                                type="password"
                                id="password_confirmation"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                placeholder="Confirmer le nouveau mot de passe"
                            />
                        </div>
                    </>
                )}

                {canEdit && isEditing && (
                    <button type="submit" className="submit-form-button">
                        Enregistrer les modifications
                    </button>
                )}
            </form>
        </div>
    );
};

export default UserProfilePage;