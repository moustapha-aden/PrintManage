import axios from 'axios';

// export const API_BASE_URL = 'https://xerox-printmanager.duckdns.org/api';
export const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 8000, // Réduit de 10s à 8s pour éviter les timeouts
  withCredentials: false
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('Response interceptor error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      // Optionally redirect to login
    }
    
    // Gestion améliorée des erreurs réseau
    if (error.code === 'ERR_NETWORK' || 
        error.message?.includes('CORS') || 
        error.code === 'ECONNABORTED' ||
        error.code === 'ETIMEDOUT') {
      throw new Error('NETWORK_ERROR');
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Une erreur est survenue';
    throw new Error(errorMessage);
  }
);

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post('/login', {
        email,
        password,
      });
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(name, email, password, role = 'client') {
    try {
      const response = await apiClient.post('/register', {
        name,
        email,
        password,
        password_confirmation: password,
        role,
      });
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async me() {
    try {
      return await apiClient.get('/me');
    } catch (error) {
      console.error('Me error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
    }
  },
};

export const companyService = {
  async getAll() {
    try {
      return await apiClient.get('/companies');
    } catch (error) {
      console.error('Get companies error:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      return await apiClient.post('/companies', data);
    } catch (error) {
      console.error('Create company error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await apiClient.put(`/companies/${id}`, data);
    } catch (error) {
      console.error('Update company error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(`/companies/${id}`);
    } catch (error) {
      console.error('Delete company error:', error);
      throw error;
    }
  },
};

export const printerService = {
  async getAll() {
    try {
      return await apiClient.get('/printers');
    } catch (error) {
      console.error('Get printers error:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      return await apiClient.post('/printers', data);
    } catch (error) {
      console.error('Create printer error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await apiClient.put(`/printers/${id}`, data);
    } catch (error) {
      console.error('Update printer error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(`/printers/${id}`);
    } catch (error) {
      console.error('Delete printer error:', error);
      throw error;
    }
  },
};

export const interventionService = {
  async getAll() {
    try {
      return await apiClient.get('/interventions');
    } catch (error) {
      console.error('Get interventions error:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      return await apiClient.post('/interventions', data);
    } catch (error) {
      console.error('Create intervention error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await apiClient.put(`/interventions/${id}`, data);
    } catch (error) {
      console.error('Update intervention error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(`/interventions/${id}`);
    } catch (error) {
      console.error('Delete intervention error:', error);
      throw error;
    }
  },
};

export const userService = {
  async getAll() {
    try {
      return await apiClient.get('/users');
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      return await apiClient.post('/users', data);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await apiClient.put(`/users/${id}`, data);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },
};

export default apiClient;