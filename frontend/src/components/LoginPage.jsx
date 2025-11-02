import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { 
    FiPrinter, 
    FiMail, 
    FiLock, 
    FiEye, 
    FiEyeOff, 
    FiArrowRight,
    FiShield,
  FiTool,
  FiBarChart2,
  FiAlertCircle,
  FiTrendingUp,
    FiUsers,
  FiFileText,
  FiBell,
    FiClock,
    FiCheckCircle,
  FiStar,
  FiX,
  FiMenu
} from 'react-icons/fi';

// Constants
const MEDIA_ITEMS = [
  { type: 'image', src: '/images/image1.jpg', alt: "Équipe gérant des imprimantes 1", objectPosition: 'center' },
  { type: 'image', src: '/images/image2.jpg', alt: "Équipe gérant des imprimantes 2", objectPosition: 'center' },
  { type: 'image', src: '/images/image3.jpg', alt: "Équipe gérant des imprimantes 3", objectPosition: 'center' },
  { type: 'image', src: '/images/image4.jpg', alt: "Équipe gérant des imprimantes 4", objectPosition: 'center' },
  { type: 'image', src: '/images/image5.jpg', alt: "Équipe gérant des imprimantes 5", objectPosition: 'center' },
  { type: 'image', src: '/images/image6.jpg', alt: "Équipe gérant des imprimantes 6", objectPosition: 'center' },
  { type: 'video', src: '/images/video.mp4', alt: 'Présentation vidéo', objectPosition: 'center' },
];

// Composant Media Carousel
const MediaCarousel = React.memo(({ mediaItems, currentIndex, onPrev, onNext, onSelect }) => {
  return (
    <div className="relative w-full h-[400px] sm:h-[450px] md:h-[520px] lg:h-[600px] overflow-hidden rounded-3xl shadow-2xl bg-black group">
      {/* Images/Video avec effet de zoom subtil */}
      {mediaItems.map((item, index) => (
        <div
          key={`${item.type}-${index}`}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          aria-hidden={index !== currentIndex}
        >
          {item.type === 'image' ? (
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover"
              style={{ objectPosition: item.objectPosition || 'center' }}
              loading="lazy"
              decoding="async"
              onError={onNext}
            />
          ) : (
            <video
              src={item.src}
              className="w-full h-full object-cover"
              style={{ objectPosition: item.objectPosition || 'center' }}
              autoPlay
              muted
              loop
              playsInline
              onEnded={onNext}
              onError={onNext}
            />
          )}
          {/* Overlay gradient pour améliorer la visibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
        </div>
      ))}

      {/* Controls améliorés */}
                        <button
        type="button"
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white backdrop-blur-sm text-gray-900 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
        aria-label="Précédent"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
                        </button>
                                <button
        type="button"
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white backdrop-blur-sm text-gray-900 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
        aria-label="Suivant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
                                </button>

      {/* Dots améliorés avec overlay */}
      <div className="absolute bottom-0 left-0 right-0 pb-6 pt-12 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
        <div className="flex items-center justify-center gap-3 z-10">
          {mediaItems.map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'w-8 h-2.5 bg-white shadow-lg' 
                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80 hover:scale-125'
              }`}
              aria-label={`Aller à l'élément ${i + 1}`}
            />
          ))}
                            </div>
                        </div>
                        
      {/* Badge indicateur */}
      <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
        {currentIndex + 1} / {mediaItems.length}
                        </div>
                    </div>
  );
});

// Composant Login Modal
const LoginModal = React.memo(({
  showModal,
  onClose,
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  showPassword,
  setShowPassword,
  error,
  successMessage,
  loading,
  onSubmit
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={onClose}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-gray-900">Connexion</h3>
                            <button
            onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                                aria-label="Fermer"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
                                    {error}
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-700 text-sm font-medium flex items-center gap-2">
                                    <FiCheckCircle className="flex-shrink-0" />
                                    {successMessage}
                                </div>
                            )}

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FiMail className="text-red-600" />
                                    Adresse email
                                </label>
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
              required
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FiLock className="text-red-600" />
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                required
                                        className="w-full px-4 py-3.5 pr-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 disabled:opacity-50"
                                    >
                                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer group select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={loading}
                                        className="w-5 h-5 rounded border-2 border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
                                    />
              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                Se souvenir de moi
              </span>
                                </label>
                                <a href="/forgot-password" className="text-red-600 font-semibold hover:text-red-700 transition-colors hover:underline">
                                    Mot de passe oublié ?
                                </a>
                            </div>

                            <button
            type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25 hover:shadow-xl hover:-translate-y-0.5 group"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Connexion en cours...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Se connecter</span>
                                        <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                                    </div>
                                )}
                            </button>
        </form>

                        <div className="mt-8 pt-6 border-t-2 border-gray-100">
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <FiShield className="text-red-600" />
                                <span className="font-medium">Connexion sécurisée SSL/TLS</span>
                            </div>
                        </div>
                    </div>
                </div>
  );
});

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const navigate = useNavigate();

  const features = [
    {
      icon: <FiPrinter className="w-8 h-8" />,
      title: "Gestion du parc d'imprimantes",
      description: "Centralisez l'inventaire complet de vos imprimantes avec modèles, marques et localisations."
    },
    {
      icon: <FiTool className="w-8 h-8" />,
      title: "Suivi des interventions en temps réel",
      description: "Créez, assignez et résolvez les interventions techniques en quelques clics."
    },
    {
      icon: <FiBarChart2 className="w-8 h-8" />,
      title: "Rapports et analytics",
      description: "Visualisez vos données avec des tableaux de bord interactifs et des métriques précises."
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Mouvements d'imprimantes",
      description: "Tracez les déplacements d'équipements entre départements avec historique complet."
    },
    {
      icon: <FiBell className="w-8 h-8" />,
      title: "Notifications automatiques",
      description: "Recevez des alertes instantanées pour les pannes, maintenances et événements critiques."
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Interface multi-rôles",
      description: "Interfaces adaptées pour Admin, Technicien et Client avec permissions granulaires."
    },
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: "Export PDF des rapports",
      description: "Générez et exportez vos rapports au format PDF pour archivage et partage."
    }
  ];

  const stats = [
    { value: "1000+", label: "Imprimantes gérées", icon: <FiPrinter /> },
    { value: "500+", label: "Interventions/mois", icon: <FiTool /> },
    { value: "99.9%", label: "Disponibilité", icon: <FiCheckCircle /> },
    { value: "24/7", label: "Support", icon: <FiClock /> }
  ];

  const steps = [
    {
      number: "01",
      title: "Connectez-vous",
      description: "Accédez à votre espace en vous connectant avec vos identifiants. Une fois authentifié, vous accédez à votre tableau de bord personnalisé selon votre rôle (Admin, Technicien ou Client)."
    },
    {
      number: "02",
      title: "Créez une intervention",
      description: "Remplissez le formulaire avec les informations nécessaires : type d'intervention, imprimante concernée, description du problème, priorité et département. Le ticket est automatiquement créé et assigné."
    },
    {
      number: "03",
      title: "Suivez et résolvez",
      description: "Consultez l'état de vos interventions en temps réel, recevez des notifications par email à chaque mise à jour, et suivez la progression jusqu'à la résolution complète."
    }
  ];

  const testimonials = [
    {
      name: "Moustapha Aden",
      avatar: "MA",
      rating: 5,
      text: "Xerox PrintManager a transformé notre gestion d'imprimantes. Nous avons réduit nos coûts de maintenance de 40% en 6 mois."
    },
    {
      name: "Abdourahman Anwar",
      avatar: "AA",
      rating: 5,
      text: "L'interface est intuitive et le suivi des interventions en temps réel nous a fait gagner un temps précieux."
    },
    {
      name: "Salah Bedri",
      avatar: "SB",
      rating: 5,
      text: "Le meilleur outil de gestion de parc que nous ayons utilisé. Support réactif et fonctionnalités complètes."
    }
  ];

  const benefits = [
    "Réduisez vos coûts d'exploitation jusqu'à 40%",
    "Augmentez la productivité de vos équipes techniques",
    "Optimisez l'utilisation de vos ressources d'impression",
    "Conformité RGPD et sécurité des données garantie",
    "Déploiement rapide sans installation complexe",
    "Formation et support inclus"
  ];

  // Vérification initiale de l'authentification
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (authToken && userRole && authToken !== 'demo-token-123') {
      const routes = {
        'admin': '/admin/dashboard',
        'client': '/client/dashboard',
        'technicien': '/technician/dashboard'
      };

      const route = routes[userRole];
      if (route) {
        navigate(route, { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [navigate]);

  // Auto-rotation du carrousel
  useEffect(() => {
    const currentItem = MEDIA_ITEMS[currentMediaIndex];
    if (!currentItem) return;

    let timeoutId;
    if (currentItem.type === 'image') {
      timeoutId = setTimeout(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % MEDIA_ITEMS.length);
      }, 5000);
    } else {
      timeoutId = setTimeout(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % MEDIA_ITEMS.length);
      }, 20000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentMediaIndex]);

  const goToPrev = useCallback(() => {
    setCurrentMediaIndex((prev) => (prev - 1 + MEDIA_ITEMS.length) % MEDIA_ITEMS.length);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentMediaIndex((prev) => (prev + 1) % MEDIA_ITEMS.length);
  }, []);

  const handleMediaSelect = useCallback((index) => {
    setCurrentMediaIndex(index);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: email.trim(),
        password,
        remember: rememberMe,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
        timeout: 10000,
      });

      const { token, user } = response.data;

      // Stockage des informations utilisateur
      const userData = {
        authToken: token,
        userName: user.name,
        userId: user.id,
        userEmail: user.email,
        userRoles: JSON.stringify(user.roles || [user.role]),
        userRole: user.role
      };

      Object.entries(userData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      setSuccessMessage(`Connexion réussie ! Bienvenue ${user.name}. Redirection en cours...`);

      setTimeout(() => {
        const routes = {
          'admin': '/admin/dashboard',
          'client': '/client/dashboard',
          'technicien': '/technician/dashboard'
        };

        const route = routes[user.role] || '/unauthorized';
        navigate(route);
      }, 1500);

    } catch (apiError) {
      console.error("Erreur de connexion:", apiError);

      // Gestion d'erreur améliorée
      if (axios.isCancel(apiError)) {
        setError('Requête annulée');
      } else if (apiError.code === 'NETWORK_ERROR') {
        setError('Erreur réseau. Vérifiez votre connexion internet.');
      } else if (apiError.code === 'TIMEOUT_ERROR') {
        setError('La connexion a expiré. Veuillez réessayer.');
      } else if (apiError.response) {
        const { status, data } = apiError.response;

        switch (status) {
          case 401:
            setError('Identifiants incorrects ou non autorisés.');
            break;
          case 422:
            const validationErrors = data.errors ? Object.values(data.errors).flat() : ['Données invalides'];
            setError(`Erreur de validation : ${validationErrors.join(', ')}`);
            break;
          case 429:
            setError('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
            break;
          case 500:
            setError('Erreur interne du serveur. Veuillez contacter le support.');
            break;
          default:
            setError(data?.message || `Erreur du serveur (${status}).`);
        }
      } else if (apiError.request) {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      } else {
        setError('Une erreur inattendue est survenue.');
      }

      // Nettoyage en cas d'erreur
      ['authToken', 'userRole', 'userName', 'userId', 'userEmail', 'userRoles'].forEach(key => {
        localStorage.removeItem(key);
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <FiPrinter className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Xerox PrintManager</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-red-600 transition-colors">Fonctionnalités</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-red-600 transition-colors">Comment ça marche</a>
              <a href="#testimonials" className="text-gray-700 hover:text-red-600 transition-colors">Témoignages</a>
              <a href="#contact" className="text-gray-700 hover:text-red-600 transition-colors">Contact</a>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Connexion
              </button>
            </div>

            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Témoignages</a>
              <a href="#contact" className="block text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <button
                onClick={() => {
                  setShowModal(true);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-center px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
              >
                Connexion
              </button>
            </div>
          )}
        </nav>
      </header>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Simplifiez la gestion de votre{' '}
              <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                parc d'imprimantes
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Transformez votre gestion d'impression avec une plateforme intuitive qui centralise toutes vos opérations. 
              Créez des interventions en quelques clics, suivez leur progression en temps réel et optimisez vos ressources 
              grâce à des analytics avancées. La solution tout-en-un qui fait gagner du temps à vos équipes et réduit vos coûts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
              >
                Se connecter
              </button>
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-3xl blur-3xl opacity-25 animate-pulse"></div>
            <div className="relative">
              <MediaCarousel
                mediaItems={MEDIA_ITEMS}
                currentIndex={currentMediaIndex}
                onPrev={goToPrev}
                onNext={goToNext}
                onSelect={handleMediaSelect}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 group-hover:bg-red-500 transition-colors duration-200">
                  <div className="text-red-600 group-hover:text-white transition-colors duration-200 text-2xl">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités complètes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre parc d'imprimantes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-lg mb-4 text-red-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Démarrez en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-white text-2xl font-bold mb-6 shadow-lg relative z-10">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 h-0.5 bg-gradient-to-r from-red-300 to-red-500 z-0" style={{ left: 'calc(50% + 40px)', right: 'calc(-74% + 40px)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Xerox PrintManager
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les avantages qui font la différence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <FiCheckCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez ce que disent nos clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-red-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à transformer votre gestion d'imprimantes ?
          </h2>
          <p className="text-xl mb-10 text-red-100">
            Rejoignez des centaines d'entreprises qui optimisent leur parc avec Xerox PrintManager
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              Commencer maintenant
              <FiArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <FiPrinter className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Xerox PrintManager</span>
              </div>
              <p className="text-sm text-gray-400">
                La solution SaaS de référence pour la gestion de parc d'imprimantes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-red-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-red-400 transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-red-400 transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">CGU/CGV</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Xerox PrintManager. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <FiShield className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-400">Certifié ISO 27001</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiShield className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-400">Conforme RGPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de connexion */}
      <LoginModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        error={error}
        successMessage={successMessage}
        loading={loading}
        onSubmit={handleSubmit}
      />
        </div>
    );
}

export default LoginPage;
