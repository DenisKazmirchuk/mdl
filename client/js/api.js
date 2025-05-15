const API_URL = 'http://localhost:5000/api';

class ApiService {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    async register(email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    async verifyEmail(token) {
        return this.request(`/auth/verify-email/${token}`);
    }

    async checkAuth() {
        return this.request('/auth/me');
    }
}

const api = new ApiService(); 