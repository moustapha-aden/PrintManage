import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // FiX n'est pas nécessaire ici

// Ajout d'une prop onCardClick et mémoïsation du composant
const PrinterCard = React.memo(({ printer, onEdit, onDelete, currentUserRole, onCardClick,style}) => {
    // Determine status class for styling
    const statusClass = printer.status === 'active' ? 'status-active' :
                        printer.status === 'maintenance' ? 'status-maintenance' :
                        printer.status === 'hors-service' ? 'status-hors-service' :
                        printer.status === 'inactive' ? 'status-inactive' : // Ajout du cas 'inactive'
                        'status-default'; // Fallback for any other status

    return (
        // Rendre toute la carte cliquable
        <div className="printer-card clickable"style={style} onClick={() => onCardClick(printer)}>
            <div className="card-header" style={style}>
                <h3 style={style}>{printer.model} ({printer.brand})</h3>
                <span  className={`printer-status ${statusClass}`}>
                    {printer.statusDisplay || 'N/A'} {/* Utilise statusDisplay du backend */}
                </span>
            </div>
            <div className="card-body" style={style}>
                <p style={style}><strong>N° Série : </strong> {printer.serial}</p>
                <p style={style}><strong>Société : </strong> {printer.company ? printer.company.name : 'N/A'}</p>
                <p style={style}><strong>Département : </strong> {printer.department ? printer.department.name : 'N/A'}</p>
                {printer.company?.name !== "Hypercube" && printer.department?.name !== "Entrepôt" && currentUserRole !=='client' &&  (
                    <>
                        <p style={style}><strong>Total d'imprimante:</strong> {printer.total_quota_pages} copie </p>
                        <p style={style}><strong>Copie en Color :</strong> {printer.monthly_quota_color} copie</p>
                        <p style={style}><strong>Copie en B&W :</strong> {printer.monthly_quota_bw} copie</p>
                    </>
                )}

                <p style={style}><strong>Département : </strong> {printer.department ? printer.department.name : 'N/A'}</p>
                <p style={style}><strong>Installation : </strong> {printer.installDate || 'N/A'}</p>
                {printer.company?.name !== "Hypercube" && printer.department?.name !== "Entrepôt" && (
                    <p style={style}>
                        <strong>Statut : </strong>{' '}
                        {printer?.is_purchased
                            ? ' Vendu'
                            : ' en location'}
                    </p>
                )}
            </div>
            {/* Action buttons visible only to admins */}
            {currentUserRole === 'admin' && (
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    {/* Empêche la propagation du clic pour ne pas déclencher onCardClick */}
                    <button className="icon-button" onClick={() => onEdit(printer)}><FiEdit /></button>
                    <button className="icon-button trash" onClick={() => onDelete(printer.id)}><FiTrash2 /></button>
                </div>
            )}
        </div>
    );
});

export default PrinterCard;