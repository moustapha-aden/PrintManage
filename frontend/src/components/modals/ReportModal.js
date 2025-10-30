// src/components/ReportModal.js
import React, { useState, forwardRef } from 'react'; // ✅ ajouter forwardRef
import { FiX, FiFileText } from 'react-icons/fi';
import '../styles/Modal.css';

const ReportModal = forwardRef(({ companies = [], departments = [], onGenerate, onClose }, ref) => {
    const [filterType, setFilterType] = useState('company'); 
    const [selectedCompanyId, setSelectedCompanyId] = useState('all');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleGenerate = () => {
        if (!startDate || !endDate) {
            alert("Veuillez sélectionner une date de début et de fin.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert("La date de début doit être antérieure ou égale à la date de fin.");
            return;
        }

        onGenerate({
            startDate,
            endDate,
            filterType,
            filterId: filterType === 'company' ? selectedCompanyId : selectedDepartmentId,
        });

        onClose();
    };

    return (
        <div className="modal-backdrop" ref={ref}>
            <div className="modal-content report-modal">
                <div className="modal-header">
                    <h3>📊 Générer un Rapport de Quotas</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="report-option-group">
                        <label>Générer le rapport par :</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    value="company"
                                    checked={filterType === 'company'}
                                    onChange={() => setFilterType('company')}
                                />
                                Société
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="department"
                                    checked={filterType === 'department'}
                                    onChange={() => setFilterType('department')}
                                />
                                Département
                            </label>
                        </div>
                    </div>

                    <div className="filter-select-group">
                        {filterType === 'company' && (
                            <select
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                            >
                                <option value="all">Toutes les sociétés</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {filterType === 'department' && (
                            <select
                                value={selectedDepartmentId}
                                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                            >
                                <option value="all">Tous les départements</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="date-range-group">
                        <label>Sélectionner une plage de dates :</label>
                        <div className="date-inputs">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span>au</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={handleGenerate} className="modal-action-btn primary">
                        <FiFileText /> Générer le Rapport
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ReportModal;
