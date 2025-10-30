import React, { forwardRef } from 'react';
import {
    FiX,
    FiPackage,
    FiLayers
} from 'react-icons/fi';
import '../styles/ManagementPage.css';

const PrinterDetailModal = forwardRef(({ printer, onClose, style }, detailRef) => {
    if (!printer) return null;

    // Helper to format date (MAINTENUE MAIS NON UTILISÉE DANS LE TABLEAU)
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // --- NOUVELLE LOGIQUE D'AGRÉGATION PAR RÉFÉRENCE ---
    const inventaires = printer.inventaires || [];
    
    // 1. Agréger les matériels ayant la même référence
    const aggregatedInventaires = inventaires.reduce((acc, inv) => {
        const materiel = inv.materiel || {};
        const reference = materiel.reference || 'N/A';
        const quantite = inv.quantite || 0;

        if (acc[reference]) {
            // Ajouter la quantité au matériel existant
            acc[reference].quantite += quantite;
        } else {
            // Créer une nouvelle entrée
            acc[reference] = {
                ...materiel, // Garder le nom, la référence, etc.
                quantite: quantite,
                // On pourrait garder la première ou la dernière date si nécessaire, 
                // mais elle est supprimée de l'affichage comme demandé.
                // date_deplacement: inv.date_deplacement 
            };
        }
        return acc;
    }, {});

    // Convertir l'objet en tableau pour l'affichage
    const finalInventaires = Object.values(aggregatedInventaires);
    // -----------------------------------------------------

    const totalMaterielsDifferents = finalInventaires.length; // Compte le nombre de types de matériels uniques
    
    // Calculer la quantité totale de matériels (utilisée pour l'agrégation, doit être recalculée sur les données finales)
    const quantiteTotale = finalInventaires.reduce((sum, inv) => sum + (inv.quantite || 0), 0);
    
    /**
     * Détermine la couleur du texte selon la quantité
     */
    const getQuantityColor = (quantite) => {
        const qty = parseInt(quantite, 10);
        
        if (qty < 5) {
            return '#ff6b6b'; // Rouge 🔴
        } else if (qty >= 5 && qty <= 10) {
            return '#ffa500'; // Orange 🟠
        } else {
            return '#51cf66'; // Vert 🟢
        }
    };

    return (
        <div className="modal-overlay" ref={detailRef} style={style}>
            <div className="modal-content detail-modal" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>Détails de l'Imprimante</h2>
                    <button style={style} type="button" onClick={onClose} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <div className="modal-body" style={style}>
                    {/* Informations générales (NON MODIFIÉES) */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ ...styles.label, ...style }}><strong>Informations Générales</strong> </h3>
                        {/* ... vos informations de base ... */}
                        <p style={style}><strong>Modèle:</strong> {printer.model}</p>
                        <p style={style}><strong>Marque:</strong> {printer.brand}</p>
                        <p style={style}><strong>N° Série:</strong> {printer.serial}</p>
                        <p style={style}>
                            <strong>Statut:</strong> 
                            <span className={`status-${printer.status}`}> {printer.statusDisplay}</span>
                        </p>
                        <p style={style}><strong>Société:</strong> {printer.company ? printer.company.name : 'N/A'}</p>
                        <p style={style}><strong>Département:</strong> {printer.department ? printer.department.name : 'N/A'}</p>
                        <p style={style}>
                            <strong>Date d'Installation:</strong> {printer.installDate ? formatDate(printer.installDate) : 'N/A'}
                        </p>
                        <p style={style}>
                            <strong>Retournée Entrepôt:</strong> {printer.is_returned_to_warehouse ? 'Oui' : 'Non'}
                        </p>
                        <p style={style}><strong>Date de Création:</strong> {formatDate(printer.created_at)}</p>
                        <p style={style}><strong>Dernière Mise à Jour:</strong> {formatDate(printer.updated_at)}</p>
                    </div>

                    {/* Section Matériels Assignés */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                        <h3 style={{ ...styles.label, ...style }}>
                            <FiPackage style={{ marginRight: '8px' }} />
                            Matériels Assignés ({totalMaterielsDifferents}) 
                        </h3>
                        
                        {finalInventaires.length === 0 ? (
                            <p style={{ ...style, color: '#999', fontStyle: 'italic' }}>
                                Aucun matériel assigné à cette imprimante.
                            </p>
                        ) : (
                            <>
                                <p style={style}>
                                    <strong>Quantité totale de matériels:</strong> 
                                    <span style={{ 
                                        marginLeft: '8px',
                                        fontWeight: 'bold',
                                        fontSize: '18px',
                                        color: getQuantityColor(quantiteTotale)
                                    }}>
                                        {quantiteTotale}
                                    </span>
                                </p>

                                {/* Liste des matériels */}
                                <div style={{ marginTop: '15px' }}>
                                    <table style={{ 
                                        width: '100%', 
                                        borderCollapse: 'collapse',
                                        marginTop: '10px'
                                    }}>
                                        <thead>
                                            <tr style={{...styles.tableHeader, ...style}}>
                                                <th style={{ 
                                                    ...style,
                                                    padding: '10px',
                                                    textAlign: 'left'
                                                }}>
                                                    Matériel
                                                </th>
                                                <th style={{ 
                                                    ...style,
                                                    padding: '10px',
                                                    textAlign: 'left'
                                                }}>
                                                    Référence
                                                </th>
                                                <th style={{ 
                                                    ...style,
                                                    padding: '10px',
                                                    textAlign: 'center'
                                                }}>
                                                    <FiLayers style={{ marginRight: '4px' }} />
                                                    Quantité
                                                </th>
                                                {/* --- COLONNE DATE SUPPRIMÉE --- */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finalInventaires.map((item, index) => {
                                                const quantite = item.quantite || 0;
                                                
                                                return (
                                                    // Clé basée sur la référence du matériel agrégé
                                                    <tr key={item.reference || index} style={{ 
                                                        borderBottom: '1px solid #333'
                                                    }}>
                                                        <td style={{ ...styles.tableCell, ...style, padding: '10px' }}>
                                                            {item.name || 'N/A'}
                                                        </td>
                                                        <td style={{ ...styles.tableCell, ...style, padding: '10px' }}>
                                                            {item.reference || 'N/A'}
                                                        </td>
                                                        <td style={{ 
                                                            ...styles.tableCell, 
                                                            padding: '10px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <span style={{
                                                                color: getQuantityColor(quantite),
                                                                fontWeight: 'bold',
                                                                fontSize: '16px'
                                                            }}>
                                                                {quantite}
                                                            </span>
                                                        </td>
                                                        {/* --- CELLULE DATE SUPPRIMÉE --- */}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="form-button cancel">Fermer</button>
                </div>
            </div>
        </div>
    );
});

export default React.memo(PrinterDetailModal);

const styles = {
// ... styles non modifiés ...
    label: {
        color: '#333',
        marginBottom: '8px',
        fontSize: '18px'
    },
    value: {
        color: '#555',
        fontSize: '16px'
    },
    section: {
        marginBottom: '20px'
    },
    tableHeader: {
        fontWeight: 'bold',
        borderBottom: '2px solid #ddd',
        backgroundColor: '#f5f5f5',
        color: '#333',
        padding: '10px',
        textAlign: 'left'
    },
    tableCell: {
        padding: '10px',
        borderBottom: '1px solid #eee',
        color: '#555',
        backgroundColor: '#fff'
    }
}