import './style.css'
import './auth.js'

// --- ROUTE GUARD ---
const publicPages = ['/', '/index.html', '/login.html', '/register.html'];
const currentPage = window.location.pathname;
const token = localStorage.getItem('accessToken');

// Agar foydalanuvchi tizimga kirmagan bo'lsa va yopiq sahifada bo'lsa - login'ga yo'naltirish
if (!token && !publicPages.includes(currentPage) && currentPage !== '/') {
  window.location.href = '/login.html';
}

// Agar tizimga kirgan bo'lsa va login/register sahifasida bo'lsa - dashboard'ga yo'naltirish
if (token && (currentPage === '/login.html' || currentPage === '/register.html')) {
  window.location.href = '/dashboard.html';
}

// --- LOGOUT LOGIKASI ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login.html';
  });
}

const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement = document.documentElement;

// Chiroyli SVG Ikonkalar (Oy va Quyosh)
const sunIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

const moonIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

function updateIcon(theme) {
  themeToggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
}

// 1. Dastlab brauzer xotirasidan qaysi tema ekanligini o'qiymiz
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  rootElement.setAttribute('data-theme', 'dark');
  updateIcon('dark');
} else {
  updateIcon('light');
}

// 2. Tugma bosilganda temani almashtirish
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = rootElement.getAttribute('data-theme');
  
  if (currentTheme === 'dark') {
    rootElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    updateIcon('light');
  } else {
    rootElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    updateIcon('dark');
  }
});
