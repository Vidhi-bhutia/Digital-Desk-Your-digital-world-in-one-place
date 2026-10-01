import { apiClient } from './apiClient';

export const authService = {
  /**
   * Register a new user account & send Welcome Email
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
   * Request 6-digit password reset OTP code
   */
  async forgotPassword(email) {
    return apiClient('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  /**
   * Reset password with 6-digit OTP code or reset token
   */
  async resetPassword(otpOrToken, password, email = null) {
    const body = { password };
    if (otpOrToken && otpOrToken.length === 6) {
      body.otp = otpOrToken;
      body.email = email;
    } else {
      body.token = otpOrToken;
    }

    return apiClient('/auth/reset-password', {
      method: 'POST',
      body,
    });
  },
};
