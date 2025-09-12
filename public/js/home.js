/**
 * Homepage functionality
 */

document.addEventListener('DOMContentLoaded', async () => {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    const ctaSignupBtn = document.getElementById('cta-signup-btn');

    // Check authentication status
    const isAuthenticated = window.authService.isAuthenticated();
    
    if (isAuthenticated) {
        // User is logged in
        loginBtn.classList.add('hidden');
        signupBtn.classList.add('hidden');
        dashboardBtn.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        
        // Update button text
        getStartedBtn.textContent = 'Go to Dashboard';
        ctaSignupBtn.textContent = 'Go to Dashboard';
    } else {
        // User is not logged in
        loginBtn.classList.remove('hidden');
        signupBtn.classList.remove('hidden');
        dashboardBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }

    // Event listeners
    loginBtn.addEventListener('click', () => {
        window.location.href = '/login.html';
    });

    signupBtn.addEventListener('click', () => {
        window.location.href = '/signup.html';
    });

    dashboardBtn.addEventListener('click', () => {
        window.location.href = '/index.html';
    });

    logoutBtn.addEventListener('click', () => {
        window.authService.logout();
    });

    getStartedBtn.addEventListener('click', () => {
        if (isAuthenticated) {
            window.location.href = '/index.html';
        } else {
            window.location.href = '/signup.html';
        }
    });

    learnMoreBtn.addEventListener('click', () => {
        // Scroll to features section
        const featuresSection = document.querySelector('.mt-20');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    ctaSignupBtn.addEventListener('click', () => {
        if (isAuthenticated) {
            window.location.href = '/index.html';
        } else {
            window.location.href = '/signup.html';
        }
    });
});
