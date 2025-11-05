import React, { forwardRef } from 'react';
import { FiX, FiPackage, FiLayers } from 'react-icons/fi';
import '../styles/ManagementPage.css';

const MaterielDetailModal = forwardRef(({ materiel, onClose, style }, detailRef) => {
    if (!materiel) return null;

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        return `${day}/${month}/${year}`;
    };

    // Détermine la couleur du texte selon la quantité
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

    // Récupérer les inventaires (déplacements) pour ce matériel
    const inventaires = materiel.inventaires || [];

    return (
        <div className="modal-overlay" ref={detailRef} style={style}>
            <div className="modal-content detail-modal" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>Détails du Matériel</h2>
                    <button style={style} type="button" onClick={onClose} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <div className="modal-body" style={style}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={styles.sectionTitle}>Informations Générales</h3>
                        <p style={styles.infoRow}><strong>Nom:</strong> {materiel.name || 'N/A'}</p>
                        <p style={styles.infoRow}><strong>Référence:</strong> {materiel.reference || 'N/A'}</p>
                        <p style={styles.infoRow}><strong>Type:</strong> {materiel.type || 'N/A'}</p>
                        <p style={styles.infoRow}>
                            <strong>Quantité en stock:</strong>{' '}
                            <span style={{ 
                                fontWeight: 'bold', 
                                fontSize: '18px', 
                                color: getQuantityColor(materiel.quantite),
                                backgroundColor: getQuantityColor(materiel.quantite) === '#ff6b6b' ? '#FEE2E2' : 
                                                getQuantityColor(materiel.quantite) === '#ffa500' ? '#FEF3C7' : '#D1FAE5',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                display: 'inline-block'
                            }}>
                                {materiel.quantite ?? '0'}
                            </span>
                        </p>
                        <p style={styles.infoRow}><strong>Quantité sortie:</strong> {materiel.sortie ?? '0'}</p>
                    </div>

                    {/* Section des Déplacements */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <h3 style={styles.sectionTitle}>
                            <FiPackage style={{ marginRight: '8px' }} />
                            Déplacements ({inventaires.length})
                        </h3>
                        
                        {inventaires.length === 0 ? (
                            <p style={styles.emptyMessage}>
                                Aucun déplacement effectué pour ce matériel.
                            </p>
                        ) : (
                            <div style={{ marginTop: '15px' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeaderCell}>Imprimante</th>
                                            <th style={styles.tableHeaderCell}>Société</th>
                                            <th style={styles.tableHeaderCell}>Département</th>
                                            <th style={{ ...styles.tableHeaderCell, textAlign: 'center' }}>
                                                <FiLayers style={{ marginRight: '4px' }} />
                                                Quantité
                                            </th>
                                            <th style={styles.tableHeaderCell}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventaires.map((inventaire, index) => {
                                            const printer = inventaire.printer || null;
                                            // Si l'imprimante existe, utiliser ses données, sinon utiliser celles de l'inventaire
                                            const companyName = printer 
                                                ? (printer.company?.name || 'N/A')
                                                : (inventaire.company?.name || 'N/A');
                                            const departmentName = printer 
                                                ? (printer.department?.name || 'N/A')
                                                : (inventaire.department?.name || 'N/A');
                                            
                                            return (
                                                <tr key={inventaire.id || index} style={styles.tableRow}>
                                                    <td style={styles.tableCell}>
                                                        {printer 
                                                            ? `${printer.model || 'N/A'} ${printer.serial ? `(${printer.serial})` : ''}`
                                                            : 'Stock'
                                                        }
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        {companyName}
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        {departmentName}
                                                    </td>
                                                    <td style={{ ...styles.tableCell, textAlign: 'center', fontWeight: 'bold' }}>
                                                        <span style={{
                                                            color: getQuantityColor(inventaire.quantite),
                                                            fontSize: '16px',
                                                            backgroundColor: getQuantityColor(inventaire.quantite) === '#ff6b6b' ? '#FEE2E2' : 
                                                                            getQuantityColor(inventaire.quantite) === '#ffa500' ? '#FEF3C7' : '#D1FAE5',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            display: 'inline-block'
                                                        }}>
                                                            {inventaire.quantite ?? '0'}
                                                        </span>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        {formatDate(inventaire.date_deplacement)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
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

export default React.memo(MaterielDetailModal);

const styles = {
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '16px',
        color: 'var(--primary-red)',
        borderBottom: '2px solid var(--primary-red)',
        paddingBottom: '8px'
    },
    infoRow: {
        padding: '8px 0',
        borderBottom: '1px solid var(--border-color)'
    },
    emptyMessage: {
        color: 'var(--text-gray-light)',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '20px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
        backgroundColor: 'var(--background-white)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    tableHeaderCell: {
        padding: '12px',
        textAlign: 'left',
        backgroundColor: 'var(--background-light)',
        color: 'var(--text-dark)',
        fontWeight: '600',
        borderBottom: '2px solid var(--border-color)'
    },
    tableRow: {
        borderBottom: '1px solid var(--border-color)',
        transition: 'background-color 0.2s ease'
    },
    tableCell: {
        padding: '12px',
        borderBottom: '1px solid var(--border-color)',
        color: 'var(--text-dark)',
        backgroundColor: 'var(--background-white)'
    }
};

