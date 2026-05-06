const API_URL = 'http://localhost:3000/api';

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// RO'YXATDAN O'TISH (Register)
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentLang = localStorage.getItem('language') || 'uz';
    const t = window.i18n.translations[currentLang];
    
    const btn = registerForm.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = t.btn_loading || "Wait...";
    btn.disabled = true;

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const response = await res.json();
      if (!res.ok) throw new Error(response.message || t.error_register);

      alert(t.alert_register_success);
      window.location.href = '/login.html';
    } catch (err) {
      alert(t.error_prefix + " " + err.message);
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  });
}

// TIZIMGA KIRISH (Login)
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentLang = localStorage.getItem('language') || 'uz';
    const t = window.i18n.translations[currentLang];
    
    const btn = loginForm.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = t.btn_logging_in || "Logging in...";
    btn.disabled = true;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const response = await res.json();
      if (!res.ok) throw new Error(response.message || t.error_login);

      const data = response.data;
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);

      alert(t.alert_login_success);
      window.location.href = '/dashboard.html';
    } catch (err) {
      alert(t.error_prefix + " " + err.message);
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  });
}
