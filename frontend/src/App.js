import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Composants d'authentification et de sélection de rôle
import LoginPage from './components/LoginPage'; // Assurez-vous que c'est bien dans 'auth'
import RegisterPage from './components/pages/RegisterPage';

// import RoleSelectionPage from './components/RoleSelectionPage'; // Si vous avez une page pour sélectionner le rôle après login

// Layout principal de l'application
import AppLayout from './components/layout/AppLayout';

// Pages de gestion existantes
import PrinterManagementPage from './components/pages/PrinterManagementPage';
import UserManagementPage from './components/pages/UserManagementPage';
// import RequestManagementPage from './components/pages/RequestManagementPage'; // À revoir si c'est pour admin/tech/client
import InterventionTrackingPage from './components/pages/InterventionTrackingPage';
// import ResourceManagementPage from './components/pages/ResourceManagementPage'; // À décommenter si utilisé
// import ReportViewerPage from './components/pages/ReportViewerPage'; // À décommenter si utilisé
import CompanyManagementPage from './components/pages/CompanyManagementPage';
import DepartmentManagementPage from './components/pages/DepartmentManagementPage';
// import AnalysisPage from './components/pages/AnalysisPage'; // À décommenter si utilisé
import Unauthorized from './components/pages/Unauthorized';
import PrinterMutationPage from './components/pages/PrinterMutationPage';

// NOUVEAU: Importez les tableaux de bord spécifiques à chaque rôle
import AdminDashboard from './components/dashboards/AdminPanel';
import TechnicianDashboard from './components/dashboards/TechnicianDashboard';
import ClientDashboard from './components/dashboards/ClientDashboard';

// NOUVEAU: Importez les pages spécifiques aux rôles si elles existent
// Par exemple, pour le technicien
// import TechnicianPrintersPage from './components/pages/TechnicianPrintersPage'; // Si différente de PrinterManagementPage
// import TechnicianRequestsPage from './components/pages/TechnicianRequestsPage';
import UserProfilePage from './components/pages/UserProfilePage'; // Si le technicien peut modifier son profil

// Et pour le client
import ClientPrintersPage from './components/pages/ClientPrintersPage';
// import ClientInterventionsPage from './components/pages/ClientInterventionsPage';
// import ClientProfilePage from './components/pages/ClientProfilePage';
import ClientRequestsPage from './components/pages/ClientRequestsPage';
import AnalysisPage from './components/pages/AnalysisPage'; // Si utilisé pour les analyses

import ChangePasswordPage from './components/pages/ChangePasswordPage'; // Page pour changer le mot de passe
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';

import MarqueManagementPage from './components/pages/MarqueManagementPage'; // Nouvelle page pour gérer les marques
import ModalManagementPage from './components/pages/ModalManagementPage';
import TechnicianInterventionsPage from './components/pages/TechnicianInterventionsPage';
import Quota from './components/pages/Quota';
import MaterielManagementPage from './components/pages/MaterielManagmentPage';
import InventaireManagementPage from './components/pages/InventaireManagment';

//  DÉFINITION DE PRIVATE ROUTE (DOIT ÊTRE ICI) 
const PrivateRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated) {
        // Si non authentifié, rediriger vers la page de connexion
        return <Navigate to="/login" replace />;
    }

    // Si l'utilisateur est authentifié mais n'a pas de rôle défini (cas rare)
    if (!userRole) {
        // Ceci pourrait indiquer un problème ou une étape de sélection de rôle manquante.
        // Rediriger vers la sélection de rôle ou le login.
        return <Navigate to="/login" replace />;
    }

    // Si des rôles spécifiques sont requis et que le rôle de l'utilisateur n'est pas parmi eux
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Rediriger vers une page d'accès non autorisé ou le dashboard par défaut
        // Pour une meilleure UX, redirigez vers le dashboard de son rôle, ou une page d'erreur.
        // Puisque AppLayout gère déjà les liens, l'utilisateur ne devrait pas cliquer sur des liens non autorisés.
        // Mais si l'URL est tapée manuellement, c'est une bonne sécurité.
        console.warn(`Accès non autorisé pour le rôle ${userRole} à une page nécessitant ${allowedRoles.join(', ')}`);
        return <Navigate to="/unauthorized" replace />; // Ou vers le dashboard de son rôle
    }

    return children;
};
//  FIN DE LA DÉFINITION DE PRIVATE ROUTE 


function App() {
    // Fonction utilitaire pour rediriger vers le dashboard approprié après connexion
    const redirectToRoleDashboard = () => {
        const authToken = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        
        // Si l'utilisateur est connecté, rediriger vers son dashboard
        if (authToken && role) {
            switch (role) {
                case 'admin': return <Navigate to="/admin/dashboard" replace />;
                case 'technicien': return <Navigate to="/technician/dashboard" replace />;
                case 'client': return <Navigate to="/client/dashboard" replace />;
                default: return <LoginPage />;
            }
        }
        
        // Sinon, afficher la page de login (avec contenu landing)
        return <LoginPage />;
    };

    return (
        <Router>
            <Routes>
                {/* Routes publiques (pas de layout) */}
                <Route path="/" element={redirectToRoleDashboard()} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                {/* Le token et l'email seront passés comme paramètres d'URL */}
                <Route path="/reset-password/:token/:email" element={<ResetPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Toutes les routes protégées avec le layout */}
                {/* L'authentification et l'autorisation sont gérées par PrivateRoute sur l'élément <AppLayout> parent */}
                <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>

                    {/* Routes Spécifiques à l'ADMIN */}
                    <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
                    <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}><UserManagementPage /></PrivateRoute>} />
                    <Route path="/admin/interventions" element={<PrivateRoute allowedRoles={['admin', 'technicien']}><InterventionTrackingPage /></PrivateRoute>} />
                    <Route path="/admin/printers" element={<PrivateRoute allowedRoles={['admin']}><PrinterManagementPage /></PrivateRoute>} />
                    <Route path="/admin/companies" element={<PrivateRoute allowedRoles={['admin']}><CompanyManagementPage /></PrivateRoute>} />
                    <Route path="/admin/departments" element={<PrivateRoute allowedRoles={['admin']}><DepartmentManagementPage /></PrivateRoute>} />
                    <Route path="/admin/printer-mutations" element={<PrivateRoute allowedRoles={['admin']}><PrinterMutationPage /></PrivateRoute>} />
                    {/* <Route path="/admin/reports" element={<PrivateRoute allowedRoles={['admin']}><ReportViewerPage /></PrivateRoute>} /> */}
                    <Route path="/admin/analyses" element={<PrivateRoute allowedRoles={['admin']}><AnalysisPage /></PrivateRoute>} />
                    <Route path="/admin/profile" element={<PrivateRoute allowedRoles={['admin']}><UserProfilePage /></PrivateRoute>} />
                    <Route path="/admin/brands" element={<PrivateRoute allowedRoles={['admin']}><MarqueManagementPage /></PrivateRoute>} />
                    <Route path="/admin/modals" element={<PrivateRoute allowedRoles={['admin']}><ModalManagementPage /></PrivateRoute>} />
                    <Route path="/admin/quota" element={<PrivateRoute allowedRoles={['admin']}><Quota /></PrivateRoute>} />
                    {/* <Route path="/admin/inventaires" element={<PrivateRoute allowedRoles={['admin']}><InventaireManagementPage /></PrivateRoute>} />*/}
                    {/* Materielles */}
                    <Route path="/admin/inventaire" element={<PrivateRoute allowedRoles={['admin']}><MaterielManagementPage /></PrivateRoute>} />
                    {/* Inventaires */}
                    <Route path="/admin/materiel" element={<PrivateRoute allowedRoles={['admin']}><InventaireManagementPage /></PrivateRoute>} />



                    {/* Routes Spécifiques au TECHNICIEN */}
                    <Route path="/technician/dashboard" element={<PrivateRoute allowedRoles={['technicien']}><TechnicianDashboard /></PrivateRoute>} />
                    {/* Pour les interventions, le technicien verra une version filtrée (déjà géré dans InterventionTrackingPage) */}
                    <Route path="/technician/interventions" element={<PrivateRoute allowedRoles={['technicien']}><InterventionTrackingPage /></PrivateRoute>} />
                    {/* Les imprimantes pour le technicien (peut-être une version lecture seule de PrinterManagementPage ou une nouvelle page) */}
                    <Route path="/technician/printers" element={<PrivateRoute allowedRoles={['technicien']}><PrinterManagementPage /></PrivateRoute>} />
                    {/* <Route path="/technician/requests" element={<PrivateRoute allowedRoles={['technicien']}><TechnicianRequestsPage /></PrivateRoute>} /> */}
                    <Route path="/technician/profile" element={<PrivateRoute allowedRoles={['technicien']}><UserProfilePage /></PrivateRoute>} />
                    <Route path="/technician/requests" element={<PrivateRoute allowedRoles={['technicien']}><TechnicianInterventionsPage /></PrivateRoute>} />


                    {/* Routes Spécifiques au CLIENT */}
                    <Route path="/client/dashboard" element={<PrivateRoute allowedRoles={['client']}><ClientDashboard /></PrivateRoute>} />
                    <Route path="/client/printers" element={<PrivateRoute allowedRoles={['client']}><ClientPrintersPage /></PrivateRoute>} /> 
                    {/* <Route path="/client/interventions" element={<PrivateRoute allowedRoles={['client']}><ClientInterventionsPage /></PrivateRoute>} /> */}
                    {<Route path="/client/profile" element={<PrivateRoute allowedRoles={['client']}><UserProfilePage /></PrivateRoute>} /> }
                    <Route path="/client/requests" element={<PrivateRoute allowedRoles={['client']}><ClientRequestsPage /></PrivateRoute>} />
                    <Route path="/client/change-password" element={<PrivateRoute allowedRoles={['client']}><ChangePasswordPage /></PrivateRoute>} />
                    {/* <Route path="/client/analyses" element={<PrivateRoute allowedRoles={['client']}><AnalysisPage /></PrivateRoute>} /> */}

                    {/* Route de fallback pour les chemins non trouvés DANS LE LAYOUT PROTÉGÉ */}
                    <Route path="*" element={<div>404 - Page non trouvée</div>} />

                </Route>

                {/* Route de fallback pour les chemins non trouvés HORS DU LAYOUT PROTÉGÉ */}
                <Route path="*" element={<Navigate to="/login" />} /> {/* Redirige tout le reste vers le login */}
            </Routes>
        </Router>
    );
}

export default App;