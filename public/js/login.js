/**
 * Login page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const rememberMe = formData.get('remember-me');

        // Validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setLoading(loginBtn, true);

        try {
            const result = await window.authService.login(email, password);
            
            if (result.success) {
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } else {
                showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            setLoading(loginBtn, false);
        }
    });
});
