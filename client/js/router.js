class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentPath = '';
        
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();
    }

    navigateTo(path) {
        window.history.pushState(null, null, path);
        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        if (path === this.currentPath) return;
        
        this.currentPath = path;
        
        const route = this.routes.find(route => {
            if (typeof route.path === 'string') {
                return route.path === path;
            }
            return route.path.test(path);
        });

        if (!route) {
            this.navigateTo('/login');
            return;
        }

        if (route.protected && !auth.isAuthenticated()) {
            this.navigateTo('/login');
            return;
        }

        if (route.guest && auth.isAuthenticated()) {
            this.navigateTo('/dashboard');
            return;
        }

        const view = route.view();
        const app = document.getElementById('app');
        app.innerHTML = '';
        app.appendChild(view);
    }
}

const router = new Router([
    {
        path: '/login',
        view: () => {
            const container = document.createElement('div');
            container.className = 'container';
            container.innerHTML = `
                <h1>Login</h1>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Login</button>
                </form>
                <a href="/register" class="link">Don't have an account? Register</a>
            `;

            container.querySelector('#loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;

                try {
                    await auth.login(email, password);
                    showToast('Login successful', 'success');
                    router.navigateTo('/dashboard');
                } catch (error) {
                    showToast(error.message, 'error');
                }
            });

            return container;
        },
        guest: true
    },
    {
        path: '/register',
        view: () => {
            const container = document.createElement('div');
            container.className = 'container';
            container.innerHTML = `
                <h1>Register</h1>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Register</button>
                </form>
                <a href="/login" class="link">Already have an account? Login</a>
            `;

            container.querySelector('#registerForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;

                try {
                    await auth.register(email, password);
                    showToast('Registration successful. Please check your email to verify your account.', 'success');
                    router.navigateTo('/login');
                } catch (error) {
                    showToast(error.message, 'error');
                }
            });

            return container;
        },
        guest: true
    },
    {
        path: /^\/verify-email\/(.+)$/,
        view: () => {
            const container = document.createElement('div');
            container.className = 'container';
            container.innerHTML = '<h1>Verifying email...</h1>';

            const token = window.location.pathname.split('/')[2];
            auth.verifyEmail(token)
                .then(() => {
                    showToast('Email verified successfully', 'success');
                    router.navigateTo('/login');
                })
                .catch(error => {
                    showToast(error.message, 'error');
                    router.navigateTo('/login');
                });

            return container;
        }
    },
    {
        path: '/dashboard',
        view: () => {
            const container = document.createElement('div');
            container.className = 'container';
            container.innerHTML = `
                <h1>Dashboard</h1>
                <p>Welcome, ${auth.user.email}!</p>
                <button id="logoutBtn">Logout</button>
            `;

            container.querySelector('#logoutBtn').addEventListener('click', async () => {
                try {
                    await auth.logout();
                    showToast('You have been logged out', 'success');
                    router.navigateTo('/login');
                } catch (error) {
                    showToast(error.message, 'error');
                }
            });

            return container;
        },
        protected: true
    }
]); 