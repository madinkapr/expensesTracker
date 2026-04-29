import '../style.css'
import './auth.js'
import { loadAvatarForWholeApp } from './settings.js';

// Dark mode sahifa yuklangunga qadar ham ishlashi uchun
// (fon o'zgarmasligi uchun)
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

document.addEventListener('DOMContentLoaded', () => {

    loadAvatarForWholeApp();
    
    // --- ROUTE GUARD ---
    const publicPages = ['/', '/index.html', '/login.html', '/register.html', '/forgot-password.html', '/reset-password.html'];
    const currentPage = window.location.pathname;
    const token = localStorage.getItem('accessToken');

    if (!token && !publicPages.includes(currentPage) && currentPage !== '/') {
        window.location.href = '/login.html';
        return;
    }
    if (token && (currentPage === '/login.html' || currentPage === '/register.html')) {
        window.location.href = '/dashboard.html';
        return;
    }

    // --- LOGOUT ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login.html';
        });
    }

    const profileImage = localStorage.getItem('profileImage');
    if (profileImage) {
        const avatarEls = document.querySelectorAll('.avatar');
        avatarEls.forEach(el => {
            el.style.backgroundImage = `url('${profileImage}')`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
            el.textContent = '';
        });
    }

    // --- DARK MODE ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    if (themeToggleBtn) {
        const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

        // Ikonkani joriy holatga mos belgilash
        themeToggleBtn.innerHTML = (root.getAttribute('data-theme') === 'dark') ? sunIcon : moonIcon;

        themeToggleBtn.addEventListener('click', () => {
            const isDark = root.getAttribute('data-theme') === 'dark';
            if (isDark) {
                root.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = moonIcon;
            } else {
                root.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = sunIcon;
            }
        });
    }

    // --- MOBILE MENU ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
});
