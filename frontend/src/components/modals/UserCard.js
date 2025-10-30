import React from 'react';
import {
    FiEdit,
    FiTrash2,
    FiUsers,
    // Ajout de FiX pour le bouton de fermeture des modales
} from 'react-icons/fi';
import '../styles/ManagementPage.css';
// Optimisation du composant enfant avec React.memo
const UserCard = React.memo(({ user, onEdit, onDelete, companyName, departmentName,style }) => {
    // La déclaration de la variable doit être à l'intérieur de la fonction
    
    return (
        <div className="printer-card" style={style}>
            <div className="card-header" style={style}>
                <FiUsers className="printer-icon" />
                <h3 style={style}>{user.name}</h3>
                <span className="printer-brand" >{user.roleDisplay}</span>
            </div>
            <p style={style}>Email: <span style={style}>{user.email}</span></p>
            {user.role === 'client' && (
                <>
                    <p style={style}>Société: <span style={style}>{companyName || 'N/A'}</span></p>
                    <p style={style}>Département: <span style={style}>{departmentName || 'N/A'}</span></p>
                </>
            )}
            <p style={style} >Statut: <span className={`status-${user.status} ${user.status === 'inactive' ? 'status-inactive-red' : ''}`}>{user.statusDisplay}</span></p>
            <p style={style} >Dernière connexion: <span style={style}>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span></p>
            <div className="card-actions">
                <button className="icon-button" onClick={() => onEdit(user)}><FiEdit /></button>
                <button className="icon-button trash" onClick={() => onDelete(user.id)}><FiTrash2 /></button>
            </div>
        </div>
    );
});

export default UserCard;