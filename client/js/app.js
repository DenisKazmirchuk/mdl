// Initialize authentication check
auth.checkAuth();

// Add click event delegation for links
document.addEventListener('click', e => {
    if (e.target.matches('a')) {
        e.preventDefault();
        router.navigateTo(e.target.href.replace(window.location.origin, ''));
    }
});

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Handle authentication state changes
auth.addListener((user) => {
    if (user) {
        // Check if current route is a guest route
        const currentRoute = router.routes.find(route => {
            if (typeof route.path === 'string') {
                return route.path === window.location.pathname;
            }
            return route.path.test(window.location.pathname);
        });

        if (currentRoute?.guest) {
            router.navigateTo('/dashboard');
        }
    } else {
        // Check if current route is a protected route
        const currentRoute = router.routes.find(route => {
            if (typeof route.path === 'string') {
                return route.path === window.location.pathname;
            }
            return route.path.test(window.location.pathname);
        });

        if (currentRoute?.protected) {
            router.navigateTo('/login');
        }
    }
}); 