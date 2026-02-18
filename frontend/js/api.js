/**
 * API Client
 * Handles all communication with the backend
 */

const API_BASE = '/api/super-admin';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
    this.baseURL = API_BASE;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: result.message || 'An error occurred',
          code: result.code,
        };
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================
  // Authentication
  // ============================================

  async login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  }

  async logout() {
    return this.request('POST', '/auth/logout');
  }

  // ============================================
  // Clients
  // ============================================

  async getClients(page = 1, limit = 10, status = '', search = '') {
    let endpoint = `/clients?page=${page}&limit=${limit}`;
    if (status) endpoint += `&status=${status}`;
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    return this.request('GET', endpoint);
  }

  async getClient(id) {
    return this.request('GET', `/clients/${id}`);
  }

  async createClient(data) {
    return this.request('POST', '/clients', data);
  }

  async updateClient(id, data) {
    return this.request('PUT', `/clients/${id}`, data);
  }

  // ============================================
  // Maintenance
  // ============================================

  async updateMaintenance(id, data) {
    return this.request('PUT', `/maintenance/${id}/update-maintenance`, data);
  }

  async markPaid(id, data) {
    return this.request('POST', `/maintenance/${id}/mark-paid`, data);
  }

  async suspendClient(id, data) {
    return this.request('POST', `/maintenance/${id}/suspend`, data);
  }

  async activateClient(id) {
    return this.request('POST', `/maintenance/${id}/activate`, {});
  }

  // ============================================
  // Analytics
  // ============================================

  async getAnalyticsSummary() {
    return this.request('GET', '/analytics/summary');
  }

  async getStatusBreakdown() {
    return this.request('GET', '/analytics/status-breakdown');
  }
}

// Create global API client instance
const api = new APIClient();
