import React, { useState } from 'react';
import axios from 'axios';
import { FiMail, FiArrowRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
// import '../styles/AuthPage.css'; // Remplacé par Tailwind (CDN)

import { API_BASE_URL } from '../../api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // Requête pour envoyer le lien de réinitialisation de mot de passe
            const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                withCredentials: true, // Important pour que les cookies de session/CSRF soient envoyés
            });

            setSuccessMessage(response.data.message || "Un lien de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.");
            setEmail(''); // Effacer l'email après l'envoi

        } catch (err) {
            console.error("Erreur lors de la demande de réinitialisation:", err);
            if (err.response) {
                if (err.response.status === 422 && err.response.data.errors) {
                    const validationErrors = Object.values(err.response.data.errors).flat();
                    setError(`Erreur de validation : ${validationErrors.join(', ')}`);
                } else if (err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError("Impossible d'envoyer le lien de réinitialisation. Veuillez réessayer.");
                }
            } else {
                setError("Impossible de se connecter au serveur. Vérifiez votre connexion.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-2xl shadow p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold mb-2">Mot de passe oublié ?</h2>
                        <p className="text-gray-600 text-sm">Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>
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
                                <FiMail className="text-red-600" />
                                Adresse Email
                            </label>
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transition shadow">
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Envoi du lien...</span>
                                </>
                            ) : (
                                <>
                                    <span>Envoyer le lien de réinitialisation</span>
                                    <FiArrowRight />
                                </>
                            )}
                        </button>

                        <div className="text-center text-sm">
                            <a href="/login" className="text-red-600 hover:text-red-700 hover:underline">Retour à la connexion</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
