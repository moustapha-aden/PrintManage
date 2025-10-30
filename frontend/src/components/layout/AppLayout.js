import React, { useEffect, useLayoutEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiPrinter, FiUsers, FiTool, FiBriefcase, FiBarChart,
  FiGrid, FiLogOut, FiUser, FiRepeat, FiBookOpen, FiSun, FiMoon,
  FiPackage, FiTag, FiLayers, FiPieChart, FiMenu, FiX
} from 'react-icons/fi';
import './AppLayout.css';

const AppLayout = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [isDarkMode, setIsDarkMode] = useState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useLayoutEffect(() => {
    const storedTheme = localStorage.getItem('isDarkMode');
    if (storedTheme !== null) {
      setIsDarkMode(JSON.parse(storedTheme));
    } else {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');

    if (!storedName || !storedRole) {
      navigate('/login');
    } else {
      setUserName(storedName);
      setRole(storedRole);
    }
  }, [navigate]);

  // Fermer le menu mobile quand on change de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', JSON.stringify(newMode));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderLinksByRole = (style) => {
    switch (role) {
      case 'admin':
        return (
          <div>
            <li><NavLink to="/admin/dashboard" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiGrid /> Dashboard</NavLink></li>
            <li><NavLink to="/admin/users" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiUsers /> Utilisateurs</NavLink></li>
            <li><NavLink to="/admin/interventions" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiTool /> Interventions</NavLink></li>
            <li><NavLink to="/admin/printers" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiPrinter /> Imprimantes</NavLink></li>
            <li><NavLink to="/admin/companies" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiBriefcase /> Sociétés</NavLink></li>
            <li><NavLink to="/admin/departments" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiLayers /> Départements</NavLink></li>
            <li><NavLink to="/admin/inventaire" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiPackage /> Inventaire</NavLink></li>
            <li><NavLink to="/admin/materiel" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiPackage /> Matériel</NavLink></li>
            <li><NavLink to="/admin/printer-mutations" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiRepeat /> Mouvements Imprimantes</NavLink></li>
            <li><NavLink to="/admin/analyses" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiBarChart /> Analyses</NavLink></li>
            <li><NavLink to="/admin/brands" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiTag /> Marques</NavLink></li>
            <li><NavLink to="/admin/modals" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiLayers /> Modèles</NavLink></li>
            <li><NavLink to="/admin/quota" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiPieChart /> MPS</NavLink></li>
            <li><NavLink to="/admin/profile" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiUser /> Mon Profil</NavLink></li>
          </div>
        );
      case 'technicien':
        return (
          <>
            <li><NavLink to="/technician/dashboard" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiGrid /> Dashboard</NavLink></li>
            <li><NavLink to="/technician/requests" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiTool /> Demandes d'interventions</NavLink></li>
            <li><NavLink to="/technician/interventions" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiBookOpen /> Historique</NavLink></li>
            <li><NavLink to="/technician/printers" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiPrinter /> Imprimantes</NavLink></li>
            <li><NavLink to="/technician/profile" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiUser /> Mon Profil</NavLink></li>
          </>
        );
      case 'client':
        return (
          <>
            <li><NavLink to="/client/dashboard" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiGrid /> Dashboard</NavLink></li>
            <li><NavLink to="/client/printers" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiPrinter /> Mes Imprimantes</NavLink></li>
            <li><NavLink to="/client/requests" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiBriefcase /> Mes Demandes</NavLink></li>
            <li><NavLink to="/client/profile" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ ...style }}><FiUser /> Mon Profil</NavLink></li>
          </>
        );
      default:
        return <li className="nav-item">Aucun rôle trouvé</li>;
    }
  };

  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'technicien': return 'Technicien';
      case 'client': return 'Client';
      default: return 'Utilisateur';
    }
  };

  const style = isDarkMode ? { backgroundColor: '#1e1e1e', color: 'white' } : { backgroundColor: '#ffffffff', color: 'black' };

  return (
    <div className={`app-layout-container ${isDarkMode ? "dark" : "light"}`}>
      {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMobileMenu}
        />
      )}

      <aside className={`sidebar-layout ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header-layout">
          <FiPrinter className="app-logo" />
          <h1>PrintManager</h1>
          <p>Xerox PrintManager</p>
        </div>

        <nav className="sidebar-nav-layout">
          <ul>
            {renderLinksByRole(style)}
          </ul>
        </nav>

        <div className="sidebar-footer-layout">
          <button onClick={handleLogout} className="logout-button-layout">
            <FiLogOut /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content-layout">
            <header className="header-layout">
              <h2>Bienvenue, {userName}</h2>
              <button 
                onClick={handleMode} 
                className="mode-toggle-button-header"
                aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
              >
            {isDarkMode ? (
              <>
                <FiSun className="mode-icon" />
                <span className="mode-text">Mode Clair</span>
              </>
            ) : (
              <>
                <FiMoon className="mode-icon" />
                <span className="mode-text">Mode Sombre</span>
              </>
            )}
          </button>
        </header>

        <section className="content-layout">
          <Outlet key={isDarkMode ? 'dark' : 'light'} />
        </section>
      </main>
    </div>
  );
};

export default AppLayout;
