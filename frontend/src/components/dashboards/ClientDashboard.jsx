import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FiPrinter,
    FiTool,
    FiClock,
    FiCheckCircle
} from 'react-icons/fi';

import '../styles/Dashboard.css';

import { API_BASE_URL } from '../../api';


const StatCard = ({ icon: Icon, count, label,cardStyle }) => (
    <article className="stat-card" style={cardStyle} aria-label={label}>
        <Icon className="stat-icon" />
        <h3 style={cardStyle}>{count}</h3>
        <p style={cardStyle}>{label}</p>
    </article>
);

const ActivityItem = ({ date, description, status,cardStyle }) => (
    <li className="activity-item" style={cardStyle}>
        <span className="activity-date" style={cardStyle} >{date}</span>
        <span className="activity-description" style={cardStyle}>{description}</span>
        <span className={`activity-status status-small status-${status?.toLowerCase()}`} style={cardStyle}>{status}</span>
    </li>
);

const SectionTitle = ({ children,cardStyle}) => (
    <h3 className="section-title" style={cardStyle}>{children}</h3>
);

const ClientDashboard = () => {
    const [myPrintersCount, setMyPrintersCount] = useState(0);
    const [myInterventionsCount, setMyInterventionsCount] = useState(0);
    const [pendingInterventionsCount, setPendingInterventionsCount] = useState(0);
    const [completedInterventionsCount, setCompletedInterventionsCount] = useState(0);
    const [interventionsStatusCounts, setInterventionsStatusCounts] = useState({});
    const [recentActivities, setRecentActivities] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserId = localStorage.getItem('userId');
    const currentUserName = localStorage.getItem('userName');
    const token = localStorage.getItem('authToken');
    const [isDarkMode, setIsDarkMode] = useState(false);
    
      // Charger le dark mode au montage
      useEffect(() => {
        const storedTheme = localStorage.getItem('isDarkMode');
        setIsDarkMode(storedTheme ? JSON.parse(storedTheme) : false);
      }, []);
    useEffect(() => {
        if (!token || !currentUserId) {
            setError("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const fetchDashboardData = async () => {
            try {
                const user = await fetchUser(headers);
                const departmentId = user.department_id;
                 const companyId = user.company_id; // Ajoutez cette ligne pour récupérer le companyId
                if (!departmentId && !companyId) {
                    throw new Error("Département ou compagnie introuvable pour l'utilisateur.");
                }

                let printers;
                let filterParam; // Crée une variable pour la chaîne de requête

                if (departmentId) {
                    filterParam = `department_id=${departmentId}`;
                } else {
                    filterParam = `company_id=${companyId}`;
                }

                printers = await fetchPrinters(headers, filterParam);
                setMyPrintersCount(printers.length);

                const interventions = await fetchInterventions(headers);
                setMyInterventionsCount(interventions.length);

                // Répartition des interventions selon leur statut
                const pending = interventions.filter(i => i.status?.toLowerCase() === 'en attente');
                const completed = interventions.filter(i => i.status?.toLowerCase() === 'terminée');
                const inProgress = interventions.filter(i => i.status?.toLowerCase() === 'en cours');

                setPendingInterventionsCount(pending.length);
                setCompletedInterventionsCount(completed.length);
                setInterventionsStatusCounts(prevCounts => ({
                    ...prevCounts,
                    'En Attente': pending.length,
                    'Terminée': completed.length,
                    'En Cours': inProgress.length
                }));

                setPendingRequests(pending.slice(0, 3)); // les 3 dernières en attente

                // Dernières 5 activités
                const recent = interventions.slice(0, 5).map(({ id, start_date, printer, status }) => ({
                    id,
                    date: new Date(start_date).toLocaleDateString('fr-FR'),
                    description: `Demande #${id} - ${printer?.brand || ''} ${printer?.model || ''}`,
                    status,
                }));
                setRecentActivities(recent);

            } catch (err) {
                handleError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUserId, token]);

    const fetchUser = async (headers) => {
        const { data } = await axios.get(`${API_BASE_URL}/users/${currentUserId}?with=department`, { headers });
        return data;
    };

    const fetchPrinters = async (headers, filterParam) => { // Renomme le paramètre pour plus de clarté
    const { data } = await axios.get(`${API_BASE_URL}/printers?${filterParam}`, { headers });
    return data;
};

    const fetchInterventions = async (headers) => {
        const { data } = await axios.get(`${API_BASE_URL}/interventions?client_id=${currentUserId}&with=printer`, { headers });
        // CORRECTION ICI : Accédez à la propriété 'data' de la réponse paginée
        return data.data;
    };

    const handleError = (err) => {
        console.error("Erreur dashboard client :", err);
        if (err.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        } else {
            setError(err.response?.data?.message || err.message || "Erreur inconnue.");
        }
    };

        const cardStyle = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : {};
    if (loading) {
        return <div className="dashboard-loading" style={cardStyle}>Chargement du tableau de bord client...</div>;
    }

    if (error) {
        return <p className="dashboard-error">Erreur : {error}</p>;
    }

    return (
        <main className={`client-portal ${isDarkMode ? 'dark-mode' : ''}`}>

            <section className="stats-grid" aria-label="Statistiques principales">
                <StatCard icon={FiPrinter} count={myPrintersCount} label="Mes Imprimantes" cardStyle={cardStyle} />
                <StatCard icon={FiTool} count={myInterventionsCount} label="Total Interventions"cardStyle={cardStyle}  />
                <StatCard icon={FiClock} count={pendingInterventionsCount} label="En Attente" cardStyle={cardStyle} />
                <StatCard icon={FiCheckCircle} count={completedInterventionsCount} label="Terminées" cardStyle={cardStyle} />
                <StatCard icon={FiCheckCircle} count={interventionsStatusCounts['En Cours']} label="En Cours" cardStyle={cardStyle} />
            </section>

            <section className="recent-activities" style={cardStyle} aria-label="Activités récentes">
                <SectionTitle cardStyle={cardStyle}>Mes Activités Récentes</SectionTitle>
                {recentActivities.length > 0 ? (
                    <ul>
                        {recentActivities.map(({ id, ...rest }) => (
                            <ActivityItem key={id} {...rest} />
                        ))}
                    </ul>
                ) : (
                    <p>Aucune activité récente à afficher.</p>
                )}
            </section>
        </main>
    );
};

export default ClientDashboard;