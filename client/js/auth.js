class AuthService {
    constructor() {
        this.user = null;
        this.listeners = [];
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.user));
    }

    async checkAuth() {
        try {
            const response = await api.checkAuth();
            this.user = response.user;
            this.notifyListeners();
            return true;
        } catch (error) {
            this.user = null;
            this.notifyListeners();
            return false;
        }
    }

    async login(email, password) {
        const response = await api.login(email, password);
        await this.checkAuth();
        return response;
    }

    async register(email, password) {
        return api.register(email, password);
    }

    async logout() {
        const response = await api.logout();
        this.user = null;
        this.notifyListeners();
        return response;
    }

    async verifyEmail(token) {
        return api.verifyEmail(token);
    }

    isAuthenticated() {
        return !!this.user;
    }
}

const auth = new AuthService(); 