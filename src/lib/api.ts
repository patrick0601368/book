// API configuration for Render backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookcreation.onrender.com';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for Render free tier

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw error;
    }
  }

  // Auth methods
  async register(data: { name: string; email: string; password: string }) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async generateContent(data: {
    type: string;
    subject: string;
    topic: string;
    difficulty: string;
    provider?: string;
    customPrompt?: string;
    state?: string;
    schoolType?: string;
    grade?: string;
  }) {
    return this.request('/api/generate-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async saveContent(data: {
    title: string;
    content: string;
    subject: string;
    topic: string;
    difficulty: string;
    type: string;
    state?: string;
    schoolType?: string;
    grade?: string;
    language?: string;
    country?: string;
    basedOnId?: string;
  }) {
    return this.request('/api/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContent() {
    return this.request('/api/content');
  }

  async getContentStats() {
    return this.request('/api/content/stats');
  }

  async getUserProfile() {
    return this.request('/api/user/profile');
  }

  // Subject management
  async getSubjects() {
    return this.request('/api/subjects');
  }

  async createSubject(data: { name: string; description?: string }) {
    return this.request('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSubject(id: string) {
    return this.request(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
  }

  // State management
  async getStates() {
    return this.request('/api/states');
  }

  async createState(data: { name: string }) {
    return this.request('/api/states', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // School type management
  async getSchoolTypes() {
    return this.request('/api/school-types');
  }

  async createSchoolType(data: { name: string }) {
    return this.request('/api/school-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Grade management
  async getGrades() {
    return this.request('/api/grades');
  }

  async createGrade(data: { name: string }) {
    return this.request('/api/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health checks
  async healthCheck() {
    return this.request('/health');
  }

  async dbHealthCheck() {
    return this.request('/health/db');
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Organization endpoints
  async createOrganization(name: string, description?: string) {
    return this.request('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getMyOrganization() {
    return this.request('/api/organizations/my');
  }

  async joinOrganization(organizationId: string) {
    return this.request('/api/organizations/join', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    });
  }

  async leaveOrganization() {
    return this.request('/api/organizations/leave', {
      method: 'POST',
    });
  }

  async removeMember(userId: string) {
    return this.request(`/api/organizations/members/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
