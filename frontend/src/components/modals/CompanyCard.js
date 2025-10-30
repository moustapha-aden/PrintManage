import React from 'react';
import {
    FiEdit,
    FiTrash2,
    FiBriefcase,
    FiMapPin,
    FiPhone,
    FiMail,
    FiUser,
    FiGlobe, // Ajout de FiLoader pour l'indicateur de chargement
} from 'react-icons/fi';
import '../styles/ManagementPage.css'; // Assurez-vous que ce fichier contient les styles pour les loaders et alertes
// Composant pour l'affichage d'une carte Société, mémoïsé pour la performance
const CompanyCard = React.memo(({ company, onEdit, onDelete, currentUserRole,style }) => (
    <div className="printer-card" style={style}> {/* Utilise la classe printer-card pour la cohérence des styles */}
        <div className="card-header"style={style}>
            <FiBriefcase className="printer-icon" /> {/* Garde printer-icon pour la taille */}
            <h3>{company.name}</h3>
            {/* Correction du statut pour l'affichage : capitalise la première lettre */}
            <span className={`status-${company.status ? company.status.toLowerCase() : 'unknown'}`}>
                {company.status ? company.status.charAt(0).toUpperCase() + company.status.slice(1) : 'Inconnu'}
            </span>
        </div>
        <p style={style}><FiMapPin /> Adresse: <span style={style}>{company.address || 'N/A'}</span></p>
        <p style={style}><FiGlobe /> Pays: <span style={style}>{company.country || 'N/A'}</span></p>
        <p style={style}><FiPhone /> Téléphone: <span style={style}>{company.phone || 'N/A'}</span></p>
        {company.email !== null && company.email !== '' && (
            <p style={style}><FiMail /> Email: <span style={style}>{company.email}</span></p>
        )}
        
        <p style={style}><FiUser /> Contact: <span style={style}>{company.contact_person || 'N/A'}</span></p>
        {/* Action buttons visible only to admins */}
        {currentUserRole === 'admin' && (
            <div className="card-actions">
                <button className="icon-button" onClick={() => onEdit(company)} title="Modifier"><FiEdit /></button>
                <button className="icon-button trash" onClick={() => onDelete(company.id)} title="Supprimer"><FiTrash2 /></button>
            </div>
        )}
    </div>
));

export default CompanyCard;