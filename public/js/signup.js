/**
 * Signup page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const signupBtn = signupForm.querySelector('button[type="submit"]');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters long', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setLoading(signupBtn, true);

        try {
            const result = await window.authService.signup(email, password, name);
            
            if (result.success) {
                showToast('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } else {
                showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            setLoading(signupBtn, false);
        }
    });
});
