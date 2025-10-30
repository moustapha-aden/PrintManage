import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#FF4081', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4', '#FF9800', '#795548', '#607D8B'];

const FrequentErrorsPieChart = ({ data, totalInterventions }) => {
    // Transformer les données pour Recharts si nécessaire
    // Recharts attend un tableau d'objets avec une clé numérique (par exemple 'value') et une clé de nom (par exemple 'name')
    const chartData = data.map(item => ({
        name: item.intervention_type || item.type, // Utilisez intervention_type ou type
        value: item.count,
    }));

    // Calculer le pourcentage pour le Tooltip
    const renderTooltipContent = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataItem = payload[0].payload;
            const percentage = totalInterventions > 0
                ? ((dataItem.value / totalInterventions) * 100).toFixed(1)
                : 0;
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ccc',
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{dataItem.name}</p>
                    <p style={{ margin: 0 }}>Occurrences: {dataItem.value}</p>
                    <p style={{ margin: 0 }}>Pourcentage: {percentage}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name" // C'est important pour la légende et le tooltip
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={renderTooltipContent} />
                <Legend /> {/* Ajoute une légende */}
            </PieChart>
        </ResponsiveContainer>
    );
};

export default FrequentErrorsPieChart;