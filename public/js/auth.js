/**
 * Authentication utilities and API calls
 */

class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    // Get auth headers for API calls
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    // Sign up user
    async signup(email, password, name) {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();

            if (data.success) {
                this.setAuthData(data.data.user, data.data.token);
                return { success: true, user: data.data.user };
            } else {
                return { success: false, error: data.error || data.message };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.setAuthData(data.data.user, data.data.token);
                return { success: true, user: data.data.user };
            } else {
                return { success: false, error: data.error || data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    // Logout user
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/home.html';
    }

    // Set authentication data
    setAuthData(user, token) {
        this.user = user;
        this.token = token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', token);
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get auth token
    getToken() {
        return this.token;
    }

    // Verify token with server
    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch('/api/auth/me', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.user = data.data;
                    localStorage.setItem('user', JSON.stringify(data.data));
                    return true;
                }
            }
        } catch (error) {
            console.error('Token verification error:', error);
        }

        this.logout();
        return false;
    }
}

// Global auth service instance
window.authService = new AuthService();

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } animate-slide-up`;
    toast.textContent = message;
    
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

function setLoading(button, isLoading) {
    const text = button.querySelector('[id$="-btn-text"]');
    const spinner = button.querySelector('[id$="-spinner"]');
    
    if (isLoading) {
        text.style.display = 'none';
        spinner.classList.remove('hidden');
        button.disabled = true;
    } else {
        text.style.display = 'inline';
        spinner.classList.add('hidden');
        button.disabled = false;
    }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    // If on auth pages, redirect to dashboard if already logged in
    if (window.location.pathname.includes('/login.html') || 
        window.location.pathname.includes('/signup.html')) {
        if (window.authService.isAuthenticated()) {
            const isValid = await window.authService.verifyToken();
            if (isValid) {
                window.location.href = '/index.html';
            }
        }
    }
    
    // If on protected pages, redirect to login if not authenticated
    if (window.location.pathname === '/index.html' || 
        window.location.pathname === '/') {
        if (!window.authService.isAuthenticated()) {
            const isValid = await window.authService.verifyToken();
            if (!isValid) {
                window.location.href = '/home.html';
            }
        }
    }
});
