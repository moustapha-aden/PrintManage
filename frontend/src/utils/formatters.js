// src/utils/formatters.js
export const formatDate = (isoString) => {
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

export const formatDateOnly = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    const date = new Date(isoDateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

export const getStatusDisplay = (status) => {
    return status;
};

export const getPriorityDisplay = (priority) => {
    return priority;
};

export const getInterventionTypeDisplay = (type) => {
    return type || 'N/A';
};