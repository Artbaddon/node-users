// Base API configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  API_VERSION: '/api_v1',
  
  // Helper method to build full URL
  getFullUrl(endpoint) {
    return `${this.BASE_URL}${this.API_VERSION}${endpoint}`;
  },

  // Common headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (includeAuth && typeof Auth !== 'undefined') {
      headers['Authorization'] = `Bearer ${Auth.getToken()}`;
    }
    
    return headers;
  }
};


const API_ENDPOINTS = {
  // Auth endpoints (public)
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },

  // User management endpoints
  WEB_USER: {
    BASE: '/webUser',
    LIST: '/webUser',
    CREATE: '/webUser',
    UPDATE: (id) => `/webUser/${id}`,
    DELETE: (id) => `/webUser/${id}`,
    FIND_BY_ID: (id) => `/webUser/${id}`
  },

  API_USER: {
    BASE: '/apiUser',
    LIST: '/apiUser',
    CREATE: '/apiUser',
    UPDATE: (id) => `/apiUser/${id}`,
    DELETE: (id) => `/apiUser/${id}`,
    FIND_BY_ID: (id) => `/apiUser/${id}`
  },

  // Profile endpoints
  PROFILE: {
    BASE: '/profile',
    GET: '/profile',
    UPDATE: '/profile'
  },

  // Roles endpoints
  ROLES: {
    BASE: '/roles',
    LIST: '/roles',
    CREATE: '/roles',
    UPDATE: (id) => `/roles/${id}`,
    DELETE: (id) => `/roles/${id}`,
    FIND_BY_ID: (id) => `/roles/${id}`
  },

  // Permissions endpoints
  PERMISSIONS: {
    BASE: '/permissions',
    LIST: '/permissions',
    CREATE: '/permissions',
    UPDATE: (id) => `/permissions/${id}`,
    DELETE: (id) => `/permissions/${id}`,
    FIND_BY_ID: (id) => `/permissions/${id}`
  },

  // Role Permissions endpoints
  ROLE_PERMISSIONS: {
    BASE: '/rolePermissions',
    LIST: '/rolePermissions',
    CREATE: '/rolePermissions',
    UPDATE: (id) => `/rolePermissions/${id}`,
    DELETE: (id) => `/rolePermissions/${id}`,
    ASSIGN: '/rolePermissions/assign',
    REVOKE: '/rolePermissions/revoke'
  },

  // Document Type endpoints
  DOCUMENT_TYPE: {
    BASE: '/documentType',
    LIST: '/documentType',
    CREATE: '/documentType',
    UPDATE: (id) => `/documentType/${id}`,
    DELETE: (id) => `/documentType/${id}`,
    FIND_BY_ID: (id) => `/documentType/${id}`
  },

  // User Status endpoints
  USER_STATUS: {
    BASE: '/userStatus',
    LIST: '/userStatus',
    CREATE: '/userStatus',
    UPDATE: (id) => `/userStatus/${id}`,
    DELETE: (id) => `/userStatus/${id}`,
    FIND_BY_ID: (id) => `/userStatus/${id}`
  },

  // Modules endpoints
  MODULES: {
    BASE: '/modules',
    LIST: '/modules',
    CREATE: '/modules',
    UPDATE: (id) => `/modules/${id}`,
    DELETE: (id) => `/modules/${id}`,
    FIND_BY_ID: (id) => `/modules/${id}`
  }
};

// API Service class for making requests
class ApiService {
  static async request(endpoint, options = {}) {
    const url = API_CONFIG.getFullUrl(endpoint);
    const defaultOptions = {
      headers: API_CONFIG.getHeaders(options.auth !== false)
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          if (typeof Auth !== 'undefined') {
            Auth.logout();
          }
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // CRUD operations
  static async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

