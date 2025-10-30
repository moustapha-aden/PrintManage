// src/components/common/FilterBar.jsx
import React from 'react';
import { FiSearch } from 'react-icons/fi';
import '../styles/ManagementPage.css'; // Assurez-vous d'importer les styles nécessaires

const FilterBar = ({
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterPriority, setFilterPriority,
    filterInterventionType, setFilterInterventionType
}) => {
    return (
        <div className="filter-bar">
            <div className="search-input">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Rechercher par n°, imprimante, client, technicien..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Tous les Statuts</option>
                <option value="En Attente">En Attente</option>
                <option value="En Cours">En Cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="all">Toutes les Priorités</option>
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
                <option value="Faible">Faible</option>
                <option value="Urgent">Urgent</option>
            </select>
            <select value={filterInterventionType} onChange={(e) => setFilterInterventionType(e.target.value)}>
                <option value="all">Tous les Types</option>
                <option value="Maintenance Préventive">Maintenance Préventive</option>
                <option value="Maintenance Corrective">Maintenance Corrective</option>
                <option value="Installation">Installation</option>
                <option value="Désinstallation">Désinstallation</option>
                <option value="Audit">Audit</option>
            </select>
        </div>
    );
};

export default FilterBar;