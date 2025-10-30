import React, { useState, useEffect } from 'react';
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
    FiZap,
    FiGlobe,
    FiAward,
    FiUsers,
    FiClock,
    FiCheckCircle,
    FiX
} from 'react-icons/fi';

// Composant Fonctionnalité
const FeatureItem = ({ icon, text, description }) => (
    <li className="flex items-start gap-4 text-gray-700 transition-all duration-300 p-5 rounded-2xl group hover:bg-gradient-to-br hover:from-red-50 hover:to-white hover:shadow-md border border-transparent hover:border-red-100">
        <div className="text-red-600 text-2xl mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{icon}</div>
        <div className="flex flex-col gap-1.5">
            <span className="text-base font-bold text-gray-900">{text}</span>
            {description && <span className="text-gray-600 text-sm leading-relaxed">{description}</span>}
        </div>
    </li>
);

// Composant Stat
const StatItem = ({ number, label, icon }) => (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center transition-all duration-300 hover:border-red-200 hover:shadow-lg hover:-translate-y-1 group">
        <div className="text-red-600 text-3xl mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-gray-900 text-3xl font-black mb-2">{number}</div>
        <div className="text-gray-500 text-xs uppercase tracking-widest font-semibold">{label}</div>
    </div>
);

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const year = new Date().getFullYear();

    // Vérification initiale de l'authentification
    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');

        if (authToken && userRole && authToken !== 'demo-token-123') {
            switch (userRole) {
                case 'admin':
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case 'client':
                    navigate('/client/dashboard', { replace: true });
                    break;
                case 'technicien':
                    navigate('/technician/dashboard', { replace: true });
                    break;
                default:
                    navigate('/login', { replace: true });
                    break;
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email,
                password,
                remember: rememberMe,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });

            const { token, user } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userRoles', JSON.stringify(user.roles || [user.role])); 
            localStorage.setItem('userRole', user.role);

            setSuccessMessage(`Connexion réussie ! Bienvenue ${user.name}. Redirection en cours...`);

            setTimeout(() => {
                const primaryRole = user.role;
                switch (primaryRole) {
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'client':
                        navigate('/client/dashboard');
                        break;
                    case 'technicien':
                        navigate('/technician/dashboard');
                        break;
                    default:
                        navigate('/Unauthorized');
                        break;
                }
            }, 1500);
            
        } catch (apiError) {
            console.error("Erreur de connexion:", apiError);
            if (apiError.response) {
                if (apiError.response.status === 401) {
                    setError('Identifiants incorrects ou non autorisés.');
                } else if (apiError.response.status === 422 && apiError.response.data.errors) {
                    const validationErrors = Object.values(apiError.response.data.errors).flat();
                    setError(`Erreur de validation : ${validationErrors.join(', ')}`);
                } else if (apiError.response.data && apiError.response.data.message) {
                    setError(apiError.response.data.message);
                } else {
                    setError(`Erreur du serveur : ${apiError.response.status}.`);
                }
            } else if (apiError.request) {
                setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
            } else {
                setError('Une erreur inattendue est survenue.');
            }
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20">
                                <FiPrinter className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Xerox PrintManager</span>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <span>Connexion</span>
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Décoration de fond */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-100 to-transparent rounded-full blur-3xl opacity-30 -z-10"></div>
                
                <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Solution Enterprise certifiée
                            </div>
                            
                            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                                Demandez vos <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">interventions</span>, suivez-les en temps réel
                            </h1>
                            
                            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                                Portail client Xerox pour créer des demandes d'intervention, recevoir des mises à jour par email et suivre l'état directement sur la plateforme.
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold px-8 py-4 rounded-xl hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all shadow-lg shadow-red-500/25 hover:shadow-xl hover:-translate-y-1 group"
                                >
                                    <span>Commencer maintenant</span>
                                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <a href="#features" className="text-red-600 font-semibold hover:text-red-700 transition-colors underline underline-offset-4">
                                    Découvrir les fonctionnalités
                                </a>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <StatItem number="100+" label="Entreprises" icon={<FiUsers />} />
                                <StatItem number="99.9%" label="Disponibilité" icon={<FiCheckCircle />} />
                                <StatItem number="24/7" label="Support" icon={<FiClock />} />
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-red-500 to-red-700 rounded-3xl blur-2xl opacity-20"></div>
                            <img
                                src="/images/3020-3.jpg"
                                alt="Équipe gérant des imprimantes"
                                className="relative w-full rounded-3xl border-4 border-white shadow-2xl"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-20" id="features">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-sm font-bold text-red-600 uppercase tracking-widest mb-3">Avantages clés</span>
                        <h2 className="text-4xl font-black text-gray-900 mb-4">Pourquoi choisir Xerox PrintManager</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Une solution complète pensée pour simplifier la gestion de vos interventions</p>
                    </div>
                    
                    <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureItem 
                            icon={<FiZap />} 
                            text="Création d'interventions" 
                            description="Déclarez vos incidents en quelques secondes avec notre interface intuitive." 
                        />
                        <FeatureItem 
                            icon={<FiMail />} 
                            text="Notifications email" 
                            description="Chaque mise à jour envoyée automatiquement à votre boîte mail." 
                        />
                        <FeatureItem 
                            icon={<FiClock />} 
                            text="Suivi en temps réel" 
                            description="Visualisez l'avancement : ouvert, en cours, résolu." 
                        />
                        <FeatureItem 
                            icon={<FiShield />} 
                            text="Sécurité et confidentialité" 
                            description="Conformité RGPD et contrôle d'accès par rôle." 
                        />
                        <FeatureItem 
                            icon={<FiGlobe />} 
                            text="Accessible partout" 
                            description="Interface web moderne et performante, disponible 24/7." 
                        />
                        <FeatureItem 
                            icon={<FiAward />} 
                            text="Rapports & historique" 
                            description="Trace complète des interventions et export des données." 
                        />
                    </ul>
                </div>
            </section>

            {/* Aperçu Section */}
            <section className="bg-gradient-to-br from-gray-50 to-white py-20" id="apercu">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="inline-block text-sm font-bold text-red-600 uppercase tracking-widest">Aperçu produit</span>
                            <h2 className="text-4xl font-black text-gray-900">Suivi d'intervention simplifié</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Créez des tickets, suivez les statuts, l'assignation technicien et les mises à jour en un coup d'œil.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-gray-700">
                                    <span className="mt-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                        <FiCheckCircle className="w-4 h-4 text-white" />
                                    </span>
                                    <span className="font-medium">Création et assignation rapides</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700">
                                    <span className="mt-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                        <FiCheckCircle className="w-4 h-4 text-white" />
                                    </span>
                                    <span className="font-medium">Timeline des notifications email</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700">
                                    <span className="mt-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                        <FiCheckCircle className="w-4 h-4 text-white" />
                                    </span>
                                    <span className="font-medium">Filtres par état : ouvert, en cours, résolu</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-red-500 to-red-700 rounded-3xl blur-2xl opacity-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1280&q=80"
                                alt="Tableau de bord d'analyse"
                                className="relative w-full rounded-3xl border-4 border-white shadow-2xl"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                                <FiPrinter className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">Xerox PrintManager</span>
                        </div>
                        <p className="text-gray-400 text-sm">© {year} PrintManager Pro. Tous droits réservés.</p>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-semibold">ISO 27001</span>
                            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-semibold">RGPD</span>
                            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-semibold">SOC 2</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Modal de connexion */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-gray-900">Connexion</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                                aria-label="Fermer"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
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
                                    <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Se souvenir de moi</span>
                                </label>
                                <a href="/forgot-password" className="text-red-600 font-semibold hover:text-red-700 transition-colors hover:underline">
                                    Mot de passe oublié ?
                                </a>
                            </div>

                            <button
                                onClick={handleSubmit}
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
                        </div>

                        <div className="mt-8 pt-6 border-t-2 border-gray-100">
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <FiShield className="text-red-600" />
                                <span className="font-medium">Connexion sécurisée SSL/TLS</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginPage;