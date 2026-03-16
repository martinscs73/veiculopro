const API_URL = ''; // Relative to the same host

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      console.log(`[API Request] ${options.method || 'GET'} /api${endpoint}`, { headers, body: options.body });
      const response = await fetch(`${API_URL}/api${endpoint}`, { ...options, headers });
      console.log(`[API Response] ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = 'Ocorreu um erro na requisição';
        let errorDetails = null;
        
        if (isJson) {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
          errorDetails = error.details || null;
          
          if (error.details && Array.isArray(error.details)) {
            const detailMsgs = error.details.map((d: any) => d.message).join(', ');
            errorMessage = `${errorMessage}: ${detailMsgs}`;
          }
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text);
          errorMessage = `Erro no servidor (${response.status})`;
        }
        
        // Specific handling for auth errors
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          if (response.status === 401) {
            window.dispatchEvent(new CustomEvent('auth:expired'));
          }
        }
        
        const error: any = new Error(errorMessage);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }

      if (isJson) {
        return response.json();
      }
      return response.text();
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Erro de conexão. Verifique sua internet.');
      }
      throw error;
    }
  },

  auth: {
    login: (credentials: any) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data: any) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: () => api.request('/user/profile'),
    updateProfile: (data: any) => api.request('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getGoogleAuthUrl: () => api.request('/auth/google/url'),
    changePassword: (data: any) => api.request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  },

  shifts: {
    list: (params?: { page?: number; limit?: number; start?: string; end?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.start) searchParams.append('start', params.start);
      if (params?.end) searchParams.append('end', params.end);
      const query = searchParams.toString();
      return api.request(`/shifts${query ? `?${query}` : ''}`);
    },
    create: (data: any) => api.request('/shifts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/shifts/${id}`, { method: 'DELETE' }),
    deleteGroup: (date: string, shiftType: string) => api.request(`/shifts/group/${encodeURIComponent(date)}/${encodeURIComponent(shiftType)}`, { method: 'DELETE' }),
  },

  fuel: {
    list: (params?: { page?: number; limit?: number; start?: string; end?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.start) searchParams.append('start', params.start);
      if (params?.end) searchParams.append('end', params.end);
      const query = searchParams.toString();
      return api.request(`/fuel${query ? `?${query}` : ''}`);
    },
    create: (data: any) => api.request('/fuel', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/fuel/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/fuel/${id}`, { method: 'DELETE' }),
  },

  maintenance: {
    list: (params?: { page?: number; limit?: number; start?: string; end?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.start) searchParams.append('start', params.start);
      if (params?.end) searchParams.append('end', params.end);
      const query = searchParams.toString();
      return api.request(`/maintenance${query ? `?${query}` : ''}`);
    },
    create: (data: any) => api.request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/maintenance/${id}`, { method: 'DELETE' }),
  },

  serviceTypes: {
    list: () => api.request('/service-types'),
    create: (data: any) => api.request('/service-types', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/service-types/${id}`, { method: 'DELETE' }),
  },

  fixedExpenses: {
    list: (params?: { page?: number; limit?: number; start?: string; end?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.start) searchParams.append('start', params.start);
      if (params?.end) searchParams.append('end', params.end);
      const query = searchParams.toString();
      return api.request(`/fixed-expenses${query ? `?${query}` : ''}`);
    },
    create: (data: any) => api.request('/fixed-expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/fixed-expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/fixed-expenses/${id}`, { method: 'DELETE' }),
  },

  fixedExpenseTypes: {
    list: () => api.request('/fixed-expense-types'),
    create: (data: any) => api.request('/fixed-expense-types', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/fixed-expense-types/${id}`, { method: 'DELETE' }),
  },

  stats: {
    get: () => api.request('/stats'),
  },

  ai: {
    getAnalysis: () => api.request('/ai/analysis'),
  },

  backup: {
    download: () => api.request('/backup'),
    restore: (data: any) => api.request('/restore', { method: 'POST', body: JSON.stringify(data) }),
  }
};
