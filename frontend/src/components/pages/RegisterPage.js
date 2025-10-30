// src/pages/RegisterPage.js (Inscription Client Uniquement)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css'; // Assurez-vous que ce fichier CSS existe

// URL de l'API Laravel
const API_BASE_URL = 'http://localhost:8000/api';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [company, setCompany] = useState(''); // Le champ compagnie est toujours présent pour un client
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role: 'client', // Rôle hardcodé à 'client' pour l'inscription
        company, // La compagnie est toujours envoyée
      };

      const response = await axios.post(`${API_BASE_URL}/register`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });

      // console.log('Inscription réussie:', response.data);
      setSuccessMessage(response.data.message || 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
      
      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        navigate('/'); // Redirige vers la page de connexion
      }, 2000); // 2 secondes de délai

    } catch (apiError) {
      console.error("Erreur d'inscription via API:", apiError);
      if (apiError.response) {
        console.error('Données de l\'erreur:', apiError.response.data);
        console.error('Statut de l\'erreur:', apiError.response.status);

        if (apiError.response.status === 422 && apiError.response.data.errors) {
          const errors = Object.values(apiError.response.data.errors).flat();
          setError(`Erreur de validation : ${errors.join(' ')}`);
        } else if (apiError.response.data && apiError.response.data.message) {
          setError(apiError.response.data.message);
        } else {
          setError('Erreur serveur lors de l\'inscription. Veuillez réessayer.');
        }
      } else if (apiError.request) {
        setError('Impossible de joindre le serveur. Assurez-vous que le backend est lancé et que le CORS est configuré.');
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-box">
        <h2>Inscription Client</h2> {/* Titre mis à jour */}
        <p className="subtitle">Créez votre compte client PrintManager</p>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
          {successMessage && <p className="success-message" style={{ color: 'green' }}>{successMessage}</p>}

          <div className="input-group">
            <label htmlFor="name">Nom Complet</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input type="password" id="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
            <input type="password" id="password_confirmation" placeholder="********" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required disabled={loading} />
          </div>

          {/* Le champ de sélection de rôle est supprimé */}
          {/* Le champ compagnie est maintenant toujours visible */}
          <div className="input-group">
            <label htmlFor="company">Nom de la Compagnie</label>
            <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} disabled={loading} />
          </div>
          
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="login-text">
          Vous avez déjà un compte ? <a href="/">Se connecter</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
