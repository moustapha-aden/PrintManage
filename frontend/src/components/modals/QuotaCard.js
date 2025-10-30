import React, { memo } from 'react';
import {
    FiPrinter,
    FiBriefcase,
    FiMapPin,
    FiFileText,
    FiEdit,
    FiTrash2,
    FiFilePlus, // 1. Importez l'icône pour le bouton de rapport
} from 'react-icons/fi';
import '../styles/QuotaCard.css';

const QuotaCard = memo(({ quota, onEdit, onDelete, onGenerateReport, currentUserRole, companyName, departmentName,style }) => {
    // 2. Ajoutez `onGenerateReport` aux props
    const isEditing = currentUserRole === 'admin';

    const printerInfo = quota.printer
        ? `${quota.printer.brand} ${quota.printer.model} (${quota.printer.serial})`
        : 'Imprimante non assignée';

    return (
        <div className="quota-card" style={style}>
            <div className="card-header">
                <div className="quota-number">
                    <strong>Quota #{quota.id}</strong>
                </div>
                <div className="card-status">
                    <span className="quota-status">Quota</span>
                </div>
            </div>

            <div className="card-body">
                <div className="quota-info">
                    <div className="info-row">
                        <FiPrinter className="info-icon" />
                        <span><strong>Imprimante:</strong> {printerInfo}</span>
                    </div>

                    <div className="info-row">
                        <FiBriefcase className="info-icon" />
                        <span><strong>Société:</strong> {companyName}</span>
                    </div>

                    <div className="info-row">
                        <FiMapPin className="info-icon" />
                        <span><strong>Département:</strong> {departmentName}</span>
                    </div>

                    <div className="info-row">
                        <FiFileText className="info-icon" />
                        <span><strong>Quota N&B:</strong> {quota.monthly_quota_bw || '0'} pages</span>
                    </div>

                    {quota.monthly_quota_color >1 && (<div className="info-row">
                        <FiFileText className="info-icon" />
                        <span><strong>Quota Couleur:</strong> {quota.monthly_quota_color } pages</span>
                    </div>)}
                    {quota.monthly_quota_color_large >1 && (<div className="info-row">
                        <FiFileText className="info-icon" />
                        <span><strong>Quota Couleur Grand Format:</strong> {quota.monthly_quota_color_large } pages</span>
                    </div>)}

                    {quota.monthly_quota_bw_large >1 && (
                        <div className="info-row">
                        <FiFileText className="info-icon" />
                        <span><strong>Quota N&B Grand Format:</strong> {quota.monthly_quota_bw_large || '0'} pages</span>
                    </div>
                    )}
                    <div className="info-row">
                        <FiFileText className="info-icon" />
                        <span><strong>Quota Total:</strong> {quota.total_quota || '0'} pages</span>
                    </div>
                    {/* Affichage des dépassements s'ils sont > 0 */}
                    {quota.depassementBW > 1 && (
                        <div className="info-row">
                            <FiFileText className="info-icon" />
                            <span className="overage">
                                <strong>Dépassement N&B:</strong> {quota.depassementBW} pages
                            </span>
                        </div>
                    )}
                    
                    {quota.depassementColor > 1 && (
                        <div className="info-row">
                            <FiFileText className="info-icon" />
                            <span className="overage">
                                <strong>Dépassement Couleur:</strong> {quota.depassementColor} pages
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-actions">
                {/* 3. Ajouter le bouton "Rapport" */}
                {isEditing && (
                    <button className="action-button report-button" onClick={() => onGenerateReport(quota.id)}>
                        <FiFilePlus /> Rapport
                    </button>
                )}
                {isEditing && (
                    <>
                        <button className="action-button view-button" onClick={() => onEdit(quota)}>
                            <FiEdit /> Éditer
                        </button>
                        <button className="action-button cancel-button" onClick={() => onDelete(quota.id)}>
                            <FiTrash2 /> Supprimer
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

export default QuotaCard;