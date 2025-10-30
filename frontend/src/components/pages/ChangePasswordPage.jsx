import React, { useState } from 'react';
import axios from 'axios';
import { FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

// Le chemin est maintenant relatif à la base des composants.
// Vous pouvez réutiliser des styles de base ou les intégrer ici.
// import '../styles/ManagementPage.css';

import { API_BASE_URL } from '../../api';

const ChangePasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    // Fonction pour ouvrir la modale après validation initiale
    const handlePreSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Validation côté client
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('Le nouveau mot de passe et la confirmation ne correspondent pas.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        // Si tout est bon, ouvrir la modale de confirmation
        setIsConfirmationModalOpen(true);
    };

    // Fonction pour la soumission réelle après confirmation
    const handleConfirmPasswordChange = async () => {
        setIsConfirmationModalOpen(false); // Fermer la modale
        setLoading(true);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Vous n\'êtes pas authentifié. Veuillez vous reconnecter.');
            setLoading(false);
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('ID utilisateur non trouvé. Impossible de modifier le mot de passe.');
                setLoading(false);
                return;
            }

            await axios.put(
                `${API_BASE_URL}/users/${userId}/change-password`,
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmNewPassword,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            setMessage('Mot de passe mis à jour avec succès !');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            console.error("Erreur lors de la modification du mot de passe:", err.response ? err.response.data : err.message);
            if (err.response && err.response.data && err.response.data.errors) {
                const errors = Object.values(err.response.data.errors).flat();
                setError(`Erreurs de validation: ${errors.join('; ')}`);
            } else {
                setError('Erreur lors de la modification du mot de passe: ' + (err.response && err.response.data.message ? err.response.data.message : err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsConfirmationModalOpen(false);
    };

    return (
        <>
            <style jsx>{`
                /* Styles pour le conteneur principal et le header */
                .change-password-page {
                    font-family: 'Inter', sans-serif;
                    padding: 2rem;
                    background-color: #f7f9fc;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .change-password-page-header {
                    width: 100%;
                    max-width: 500px;
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .change-password-page-header h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                /* Styles pour la carte du formulaire */
                .form-card {
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    width: 100%;
                    max-width: 500px;
                    transition: all 0.3s ease;
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    // color: #555;
                }

                .form-group input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #dc2626;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);


                }

                .form-actions {
                    margin-top: 2rem;
                }

                .form-button {
                    width: 100%;
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: linear-gradient(145deg, #ef4444, #dc2626);
                    // box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                }

                .form-button:hover {
                    transform: translateY(-2px);
                    // box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
                }

                .form-button:disabled {
                    background: #d1d5db;
                    cursor: not-allowed;
                    box-shadow: none;
                    transform: none;
                }

                /* Styles pour les messages d'erreur et de succès */
                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 1rem;
                    background-color: #fee2e2;
                    color: #ef4444;
                    border-radius: 8px;
                    border: 1px solid #fca5a5;
                    margin-bottom: 1.5rem;
                    font-weight: 500;
                    animation: fadeIn 0.3s ease-out;
                }

                .success-message {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 1rem;
                    background-color: #d1fae5;
                    color: #10b981;
                    border-radius: 8px;
                    border: 1px solid #6ee7b7;
                    margin-bottom: 1.5rem;
                    font-weight: 500;
                    animation: fadeIn 0.3s ease-out;
                }

                /* Styles pour la modale de confirmation */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }

                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
                }

                .modal-content h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: #2c3e50;
                }

                .modal-content p {
                    color: #666;
                    margin-bottom: 1.5rem;
                }

                .modal-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                }

                .modal-actions button {
                    padding: 0.6rem 1.2rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .modal-confirm-button {
                    background-color: #ef4444;
                    color: white;
                }

                .modal-confirm-button:hover {
                    background-color: #dc2626;
                }

                .modal-cancel-button {
                    background-color: #e5e7eb;
                    color: #4b5563;
                }

                .modal-cancel-button:hover {
                    background-color: #d1d5db;
                }

                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

            `}</style>
            
            <div className="change-password-page">
                <div className="change-password-page-header">
                    <h2><FiLock /> Modifier le Mot de Passe</h2>
                </div>

                <div className="form-card">
                    {/* Message de succès */}
                    <AnimatePresence>
                        {message && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="success-message"
                            >
                                <FiCheckCircle /> {message}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Message d'erreur */}
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="error-message"
                            >
                                <FiAlertCircle /> {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handlePreSubmit}>
                        <div className="form-group">
                            <label htmlFor="current_password">Mot de passe actuel:</label>
                            <input
                                type="password"
                                id="current_password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password">Nouveau mot de passe:</label>
                            <input
                                type="password"
                                id="new_password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm_new_password">Confirmer le nouveau mot de passe:</label>
                            <input
                                type="password"
                                id="confirm_new_password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="form-button" disabled={loading}>
                                {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <AnimatePresence>
                {isConfirmationModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h3 className='text-red-500'>Confirmation Requise</h3>
                            <p>Êtes-vous sûr de vouloir changer votre mot de passe ? Cette action est irréversible.</p>
                            <div className="modal-actions">
                                <button onClick={handleCancel} className="modal-cancel-button">Annuler</button>
                                <button onClick={handleConfirmPasswordChange} className="modal-confirm-button">Confirmer</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChangePasswordPage;
