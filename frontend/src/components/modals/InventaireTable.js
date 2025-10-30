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
import '../styles/TableDisplay.css'; // Assurez-vous d'avoir un fichier CSS pour le tableau

/**
 * Composant pour l'affichage des matériels sous forme de tableau.
 * Prend en charge l'édition et la suppression par l'administrateur.
 */
const InventaireTable = React.memo(({
    inventaireList,
    onEdit,
    onDelete,
    onViewDetails,
    currentUserRole,
    style // Pour la gestion du mode sombre, passé du parent
}) => {
    return (
        <div className="table-container" style={style}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={style}><FiBriefcase /> Référence</th>
                        <th style={style}><FiHash /> Nom</th>
                        <th style={style}><FiPackage /> Nom Imprimante</th>
                        <th style={style} className="center-text"><FiLayers /> Quantité</th>
                        <th style={style} className="center-text"><FiArrowUpCircle /> date</th>
                        <th style={style} className="center-text">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(!inventaireList || inventaireList.length === 0) ? (
                        <tr>
                            <td colSpan={6} className="center-text" style={style}>
                                Aucun matériel trouvé.
                            </td>
                        </tr>
                    ) : (
                        inventaireList.map((inventaire) => (
                            <tr key={inventaire.id}>
                                <td style={style}>{inventaire.materiel?.reference || 'N/A'}</td>
                                <td style={style}>{inventaire.materiel?.name || 'N/A'}</td>
                                <td style={style}>{inventaire.printer?.model || 'N/A'} ({inventaire.printer?.serial || 'N/A'})</td>
                                <td style={style} className="center-text">{inventaire.quantite ?? '0'}</td>
                                <td style={style} className="center-text">{inventaire.date_deplacement ?? '0'}</td>
                                <td style={style} className="center-text">
                                    <div className="table-actions">
                                        <button
                                            className="icon-button"
                                            onClick={() => onViewDetails(inventaire)}
                                            title="Voir détails"
                                        >
                                            <FiEye />
                                        </button>
                                        {currentUserRole === 'admin' && (
                                            <>
                                                <button
                                                    className="icon-button"
                                                    onClick={() => onEdit(inventaire)}
                                                    title="Modifier"
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    className="icon-button trash"
                                                    onClick={() => onDelete(inventaire.id)}
                                                    title="Supprimer"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
});

export default InventaireTable;