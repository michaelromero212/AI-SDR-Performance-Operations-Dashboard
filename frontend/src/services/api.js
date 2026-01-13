// API Service - Axios client for backend communication
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Error handling interceptor
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Leads API
export const leadsAPI = {
    list: (params) => api.get('/api/leads/', { params }),
    get: (id) => api.get(`/api/leads/${id}`),
    create: (data) => api.post('/api/leads/', data),
    qualify: (id, variant = 'A') => api.post(`/api/leads/${id}/qualify`, { lead_id: id, use_variant: variant }),
    import: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/api/leads/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    delete: (id) => api.delete(`/api/leads/${id}`),
};

// Campaigns API
export const campaignsAPI = {
    list: () => api.get('/api/campaigns/'),
    get: (id) => api.get(`/api/campaigns/${id}`),
    create: (data) => api.post('/api/campaigns/', data),
    run: (id, leadIds) => api.post(`/api/campaigns/${id}/run`, { campaign_id: id, lead_ids: leadIds }),
    updateStatus: (id, status) => api.patch(`/api/campaigns/${id}/status`, null, { params: { status } }),
};

// Analytics API
export const analyticsAPI = {
    dashboard: () => api.get('/api/analytics/dashboard'),
    performance: (days = 30) => api.get('/api/analytics/performance', { params: { days } }),
    abTest: () => api.get('/api/analytics/ab-test'),
    funnel: () => api.get('/api/analytics/funnel'),
    cohorts: () => api.get('/api/analytics/cohorts'),
    validation: () => api.post('/api/analytics/validation'),
    testScenarios: (category) => api.get('/api/analytics/test-scenarios', { params: { category } }),
    runTest: (scenarioId) => api.post('/api/analytics/test-scenarios/run', null, { params: { scenario_id: scenarioId } }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
