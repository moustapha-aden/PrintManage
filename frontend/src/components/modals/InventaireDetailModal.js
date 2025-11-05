import React, { forwardRef } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/ManagementPage.css';
import { API_BASE_URL } from '../../api';

const InventaireDetailModal = forwardRef(({ inventaire, onClose, style }, detailRef) => {
    if (!inventaire) return null;

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        return `${day}/${month}/${year}`;
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div className="modal-overlay" ref={detailRef} style={style}>
            <div className="modal-content detail-modal" style={style}>
                <div className="modal-header" style={style}>
                    <h2 style={style}>Détails du Déplacement</h2>
                    <button style={style} type="button" onClick={onClose} className="modal-close-button">
                        <FiX />
                    </button>
                </div>
                <div className="modal-body" style={style}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={styles.sectionTitle}>Informations du Matériel</h3>
                        <p style={styles.infoRow}><strong>Nom:</strong> {inventaire.materiel?.name || 'N/A'}</p>
                        <p style={styles.infoRow}><strong>Référence:</strong> {inventaire.materiel?.reference || 'N/A'}</p>
                        <p style={styles.infoRow}><strong>Type:</strong> {inventaire.materiel?.type || 'N/A'}</p>
                    </div>

                    <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <h3 style={styles.sectionTitle}>
                            {inventaire.printer ? "Informations de l'Imprimante" : "Informations de Destination"}
                        </h3>
                        {inventaire.printer ? (
                            <>
                                <p style={styles.infoRow}><strong>Modèle:</strong> {inventaire.printer.model || 'N/A'}</p>
                                <p style={styles.infoRow}><strong>Marque:</strong> {inventaire.printer.brand || 'N/A'}</p>
                                <p style={styles.infoRow}><strong>N° Série:</strong> {inventaire.printer.serial || 'N/A'}</p>
                                <p style={styles.infoRow}>
                                    <strong>Statut:</strong> {inventaire.printer.statusDisplay || 'N/A'}
                                </p>
                                {inventaire.printer.company && (
                                    <p style={styles.infoRow}><strong>Société:</strong> {inventaire.printer.company.name}</p>
                                )}
                                {inventaire.printer.department && (
                                    <p style={styles.infoRow}><strong>Département:</strong> {inventaire.printer.department.name}</p>
                                )}
                            </>
                        ) : (
                            <>
                                <p style={styles.infoRow}><strong>Type:</strong> Stock</p>
                                {inventaire.company && (
                                    <p style={styles.infoRow}><strong>Société:</strong> {inventaire.company.name}</p>
                                )}
                                {inventaire.department && (
                                    <p style={styles.infoRow}><strong>Département:</strong> {inventaire.department.name}</p>
                                )}
                            </>
                        )}
                        <p style={styles.infoRow}>
                            <strong>Quantité attribuée:</strong>{' '}
                            <span style={styles.quantityHighlight}>{inventaire.quantite ?? '0'}</span>
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <h3 style={styles.sectionTitle}>Informations du Déplacement</h3>
                        <p style={styles.infoRow}><strong>Date de Déplacement:</strong> {formatDate(inventaire.date_deplacement)}</p>
                        <p style={styles.infoRow}><strong>Date de Création:</strong> {formatDateTime(inventaire.created_at)}</p>
                        <p style={styles.infoRow}><strong>Dernière Mise à Jour:</strong> {formatDateTime(inventaire.updated_at)}</p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="form-button cancel">Fermer</button>
                </div>
            </div>
        </div>
    );
});

export default React.memo(InventaireDetailModal);

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
    quantityHighlight: {
        fontWeight: 'bold',
        fontSize: '18px',
        color: 'var(--primary-red)',
        backgroundColor: 'var(--primary-red-light)',
        padding: '4px 12px',
        borderRadius: '8px',
        display: 'inline-block'
    }
};
