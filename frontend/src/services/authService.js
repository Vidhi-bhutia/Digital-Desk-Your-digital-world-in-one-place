import { apiClient } from './apiClient';

export const authService = {
  /**
   * Register a new user account
   */
  async register(name, email, password) {
    return apiClient('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
  },

  /**
   * Log in user with email & password
   */
  async login(email, password) {
    return apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  /**
   * Log out user
   */
  async logout() {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get currently authenticated user details
   */
  async getCurrentUser() {
    return apiClient('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Request password reset token
   */
  async forgotPassword(email) {
    return apiClient('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, password) {
    return apiClient('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
  },
};
