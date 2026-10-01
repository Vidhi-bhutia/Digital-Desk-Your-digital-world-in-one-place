const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom Error class for API responses
 */
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Centralized fetch wrapper for Digital Desk frontend
 */
export const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Always send HTTP-only cookies
    ...options,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || `HTTP Request failed with status ${response.status}`;
      const errorCode = data.code || 'HTTP_ERROR';
      throw new ApiError(errorMessage, response.status, errorCode, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or parse error
    throw new ApiError(
      error.message || 'Unable to connect to Digital Desk server.',
      0,
      'NETWORK_ERROR'
    );
  }
};
