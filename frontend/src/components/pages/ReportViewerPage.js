// src/components/pages/ReportViewerPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiFileText, FiList, FiCalendar, FiPrinter } from 'react-icons/fi';
import '../styles/ManagementPage.css'; // Ou un CSS spécifique si vous en créez un
import { API_BASE_URL } from '../../api';
const ReportViewerPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/reports`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setReports(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des rapports.');
            console.error("Erreur API Rapports:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleGenerateReport = async (reportType) => {
        // console.log(`Demande de génération du rapport: ${reportType}`);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_BASE_URL}/reports/generate/${reportType}`, {}, {
                headers: {
                    'Accept': 'application/pdf',
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}-${new Date().toISOString().slice(0,10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert(`Le rapport "${reportType}" a été généré et téléchargé avec succès.`);

        } catch (err) {
            setError('Erreur lors de la génération du rapport.');
            console.error("Erreur API Génération Rapport:", err.response ? err.response.data : err.message);
            alert('Échec de la génération du rapport : ' + (err.response && err.response.data.message ? err.response.data.message : 'Vérifiez la console pour plus de détails.'));
        }
    };

    // if (loading) {
    //     return <div className="management-page-container">Chargement des rapports...</div>;
    // }

    if (error) {
        return <p className="management-page-container" style={{ color: 'red' }}>Erreur: {error}</p>;
    }

    return (
        <div className="management-page-container">
            <div className="management-header">
                <h2>Visionneuse de Rapports</h2>
                <p className="breadcrumb">Accueil &gt; Tableau de bord &gt; Rapports</p>
            </div>

            {/* Section pour générer de nouveaux rapports */}
            <div className="report-generation-section analysis-section-card">
                <h3><FiDownload className="card-icon" /> Générer un Nouveau Rapport</h3>
                <div className="report-buttons">
                    <button className="action-button" onClick={() => handleGenerateReport('intervention-summary')}>
                        <FiFileText /> Résumé des Interventions
                    </button>
                    <button className="action-button" onClick={() => handleGenerateReport('printer-inventory')}>
                        <FiPrinter /> Inventaire des Imprimantes
                    </button>
                    <button className="action-button" onClick={() => handleGenerateReport('user-activity')}>
                        <FiList /> Activité des Utilisateurs
                    </button>
                    <button className="action-button" onClick={() => handleGenerateReport('monthly-performance')}>
                        <FiCalendar /> Performance Mensuelle
                    </button>
                </div>
            </div>

            {/* Section pour visualiser les rapports historiques (si votre backend les stocke) */}
            <div className="report-list-section analysis-section-card">
                <h3>Rapports Historiques</h3>
                {reports.length > 0 ? (
                    <ul className="simple-list">
                        {reports.map(report => (
                            <li key={report.id} className="report-item">
                                <FiFileText />
                                <span>{report.name} - Généré le {new Date(report.createdAt).toLocaleDateString()}</span>
                                <button className="action-button small" onClick={() => window.open(report.downloadLink, '_blank')}>
                                    <FiDownload /> Télécharger
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun rapport historique disponible pour le moment.</p>
                )}
            </div>
        </div>
    );
};

export default ReportViewerPage;