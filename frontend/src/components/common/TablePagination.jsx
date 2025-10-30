// src/components/common/TablePagination.jsx
import React from 'react';
import '../styles/ManagementPage.css'; // Assurez-vous d'importer les styles nécessaires

const TablePagination = ({
    currentPage,
    lastPage,
    totalItemsCount,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange
}) => {
    if (totalItemsCount === 0) return null;

    return (
        <div className="pagination-controls">
            <div className="items-per-page">
                <label htmlFor="perPage">Interventions par page:</label>
                <select id="perPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
            <div className="page-navigation">
                <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    Précédent
                </button>
                <span className="page-info">
                    Page {currentPage} sur {lastPage} ({totalItemsCount} interventions)
                </span>
                <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="pagination-button"
                >
                    Suivant
                </button>
            </div>
        </div>
    );
};

export default TablePagination;