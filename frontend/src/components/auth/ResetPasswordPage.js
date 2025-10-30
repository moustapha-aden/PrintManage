import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom'; // ⭐ Importation de useLocation au lieu de useParams ⭐
// import '../styles/AuthPage.css'; // Remplacé par Tailwind (CDN)

import { API_BASE_URL } from '../../api';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation(); // ⭐ Utilisation de useLocation ⭐

    // Récupère le token et l'email des paramètres d'URL de requête
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenFromUrl = queryParams.get('token');
        const emailFromUrl = queryParams.get('email');

        setToken(tokenFromUrl);
        setEmail(emailFromUrl);

        if (!tokenFromUrl || !emailFromUrl) {
            setError("Lien de réinitialisation invalide ou incomplet. Veuillez vous assurer que le lien n'a pas été tronqué.");
            setLoading(false);
        }
    }, [location.search]); // Déclenche l'effet lorsque les paramètres de recherche changent

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        // Validation front-end rapide après avoir extrait les valeurs
        if (!token || !email) {
            setError("Jeton ou email manquant. Le lien de réinitialisation est invalide.");
            setLoading(false);
            return;
        }

        if (password !== passwordConfirmation) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/reset-password`, {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                // withCredentials: true, // Décommentez si votre API utilise des cookies/sessions pour les requêtes cross-origin
            });

            setSuccessMessage(response.data.message || "Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
            setPassword('');
            setPasswordConfirmation('');

            setTimeout(() => {
                navigate('/login');
            }, 3000); 

        } catch (err) {
            console.error("Erreur lors de la réinitialisation du mot de passe:", err);
            if (err.response) {
                if (err.response.status === 422 && err.response.data.errors) {
                    const validationErrors = Object.values(err.response.data.errors).flat();
                    setError(`Erreur de validation : ${validationErrors.join(', ')}`);
                } 
                else if (err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } 
                else {
                    setError("Impossible de réinitialiser le mot de passe. Le lien pourrait être invalide ou expiré.");
                }
            } else {
                setError("Impossible de se connecter au serveur. Vérifiez votre connexion.");
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (loading && !successMessage && !error) {
        return (
            <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow p-8 text-center">
                        <div className="inline-flex items-center gap-3">
                            <span className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></span>
                            <span>Chargement...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-2xl shadow p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold mb-2">Réinitialiser le mot de passe</h2>
                        <p className="text-gray-600 text-sm">Définissez votre nouveau mot de passe.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                                <FiAlertCircle className="mt-0.5" />
                                <p className="leading-relaxed">{error}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                                <FiCheckCircle className="mt-0.5" />
                                <p className="leading-relaxed">{successMessage}</p>
                            </div>
                        )}

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiLock className="text-red-600" />
                                Nouveau Mot de Passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="8"
                                    disabled={loading}
                                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    disabled={loading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 disabled:opacity-50"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiLock className="text-red-600" />
                                Confirmer Mot de Passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    required
                                    minLength="8"
                                    disabled={loading}
                                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    disabled={loading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 disabled:opacity-50"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transition shadow">
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Réinitialisation...</span>
                                </>
                            ) : (
                                <>
                                    <span>Réinitialiser le mot de passe</span>
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
