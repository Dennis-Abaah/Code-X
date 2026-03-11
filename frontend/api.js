/**
 * api.js — HTTP client for the Django REST API.
 * Handles CSRF tokens, session cookies, and JSON responses.
 */
const API_BASE = 'https://code-x-jhmx.onrender.com/api';
let _csrfToken = null;

const Api = {

  /** Fetch a CSRF token from the server (needed for POST/PUT/DELETE). */
  async getCsrfToken() {
    if (_csrfToken) return _csrfToken;
    try {
      const res = await fetch(`${API_BASE}/auth/csrf/`, { credentials: 'include' });
      const data = await res.json();
      _csrfToken = data.csrfToken;
      return _csrfToken;
    } catch {
      return null;
    }
  },

  /** Generic JSON request helper. */
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaults = {
      credentials: 'include',              // send session cookie
      headers: { 'Content-Type': 'application/json' },
    };

    // Merge headers
    const headers = { ...defaults.headers, ...(options.headers || {}) };

    // Attach CSRF token for mutating methods
    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const token = await this.getCsrfToken();
      if (token) headers['X-CSRFToken'] = token;
    }

    const config = { ...defaults, ...options, headers, method };

    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type') || '';

    let body = null;
    if (contentType.includes('application/json')) {
      body = await res.json();
    }

    if (!res.ok) {
      const error = new Error(body?.detail || body?.error || `Request failed (${res.status})`);
      error.status = res.status;
      error.data = body;
      throw error;
    }

    return body;
  },

  /** Multipart form data request (for file uploads). */
  async upload(endpoint, formData, method='POST') {
    const url = `${API_BASE}${endpoint}`;
    const token = await this.getCsrfToken();
    const headers = {};
    if (token) headers['X-CSRFToken'] = token;
    // Do NOT set Content-Type — browser sets it with boundary

    const res = await fetch(url, {
      method: method,
      credentials: 'include',
      headers,
      body: formData,
    });

    const body = await res.json();
    if (!res.ok) {
      const error = new Error(body?.detail || 'Upload failed');
      error.status = res.status;
      error.data = body;
      throw error;
    }
    return body;
  },

  // ──── Auth ────
  register: (data) => Api.request('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  login:    (data) => Api.request('/auth/login/',    { method: 'POST', body: JSON.stringify(data) }),
  logout:   ()     => Api.request('/auth/logout/',   { method: 'POST' }),
  me:       ()     => Api.request('/auth/me/'),
  updateProfile: (data) => Api.request('/auth/profile/', { method: 'PUT', body: JSON.stringify(data) }),
  updateTheme:   (theme) => Api.request('/auth/theme/',  { method: 'POST', body: JSON.stringify({ theme }) }),

  // ──── Courses (Public) ────
  getLanguages: () => Api.request('/languages/'),

  // ──── Courses (Authenticated) ────
  getDashboard:     () => Api.request('/dashboard/'),
  getLanguageLessons: (slug) => Api.request(`/languages/${slug}/lessons/`),
  getLessonDetail:    (langSlug, lessonSlug) => Api.request(`/languages/${langSlug}/lessons/${lessonSlug}/`),
  markComplete:       (lessonId) => Api.request(`/lessons/${lessonId}/complete/`, { method: 'POST' }),
  markIncomplete:     (lessonId) => Api.request(`/lessons/${lessonId}/incomplete/`, { method: 'POST' }),

  // ──── Admin ────
  getAdminLessons: ()           => Api.request('/admin/lessons/'),
  createLesson:    (formData)   => Api.upload('/admin/lessons/create/', formData),
  editLesson:      (id, formData) => {
    return Api.upload(`/admin/lessons/${id}/edit/`, formData, 'PUT');
  },
  deleteLesson:    (id)         => Api.request(`/admin/lessons/${id}/delete/`, { method: 'DELETE' }),
};
