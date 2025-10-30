import React from 'react';
import {
    FiEdit,
    FiTrash2,
    FiHash,
    FiPackage,
    FiLayers,
    FiBriefcase,
    FiArrowUpCircle,
    FiEye
} from 'react-icons/fi';
import '../styles/TableDisplay.css';

/**
 * Composant pour l'affichage des matériels sous forme de tableau.
 * Prend en charge l'édition et la suppression par l'administrateur.
 */
const MaterielTable = React.memo(({
    materielList,
    onEdit,
    onDelete,
    onViewDetails,
    currentUserRole,
    style
}) => {
    /**
     * Détermine la couleur du texte selon la quantité
     * @param {number} quantite - La quantité du matériel
     * @returns {string} - Couleur hexadécimale
     */
    const getQuantityColor = (quantite) => {
        const qty = parseInt(quantite, 10);
        
        if (qty < 5) {
            return '#ff6b6b'; // Rouge
        } else if (qty >= 5 && qty <= 10) {
            return '#ffa500'; // Orange
        } else {
            return '#51cf66'; // Vert
        }
    };

    return (
        <div className="table-container" style={style}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={style}><FiBriefcase /> Nom</th>
                        <th style={style}><FiHash /> Référence</th>
                        <th style={style}><FiPackage /> Type</th>
                        <th style={style} className="center-text"><FiLayers /> Quantité</th>
                        <th style={style} className="center-text"><FiArrowUpCircle /> Sortie</th>
                        <th style={style} className="center-text">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {materielList.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="center-text" style={style}>
                                Aucun matériel trouvé.
                            </td>
                        </tr>
                    ) : (
                        materielList.map((materiel) => {
                            const quantite = materiel.quantite ?? 0;
                            const textColor = getQuantityColor(quantite);

                            return (
                                <tr key={materiel.id}>
                                    <td style={style}>{materiel.name || 'N/A'}</td>
                                    <td style={style}>{materiel.reference || 'N/A'}</td>
                                    <td style={style}>{materiel.type || 'N/A'}</td>
                                    <td 
                                        style={style}
                                        className="center-text"
                                    >
                                        <span style={{
                                            color: textColor,
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            {quantite}
                                        </span>
                                    </td>
                                    <td style={style} className="center-text">{materiel.sortie ?? '0'}</td>
                                    <td style={style} className="center-text">
                                        <div className="table-actions">
                                            <button
                                                className="icon-button"
                                                onClick={() => onViewDetails(materiel)}
                                                title="Voir détails"
                                            >
                                                <FiEye />
                                            </button>
                                            {currentUserRole === 'admin' && (
                                                <>
                                                    <button
                                                        className="icon-button"
                                                        onClick={() => onEdit(materiel)}
                                                        title="Modifier"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        className="icon-button trash"
                                                        onClick={() => onDelete(materiel.id)}
                                                        title="Supprimer"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
});

export default MaterielTable;