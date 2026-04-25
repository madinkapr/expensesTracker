const API_URL = 'http://localhost:3000/api';

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// RO'YXATDAN O'TISH (Register)
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Sahifa yangilanishini to'xtatamiz
    
    // Tugmani yuklanish holatiga o'tkazish
    const btn = registerForm.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Kutib turing...";
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
      if (!res.ok) throw new Error(response.message || "Ro'yxatdan o'tishda xatolik");

      alert("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kiring.");
      window.location.href = '/login.html'; // Login sahifasiga yo'naltirish
    } catch (err) {
      alert("Xatolik: " + err.message);
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
    
    const btn = loginForm.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Kirilmoqda...";
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
      if (!res.ok) throw new Error(response.message || "Email yoki parol xato");

      const data = response.data; // Backend 'data' ichida obyekt qaytaradi

      // Tokenlarni brauzer xotirasiga (localStorage) saqlash
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);

      alert("Tizimga kirdingiz!");
      // Dashborad sahifasiga yo'naltirish
      window.location.href = '/dashboard.html';
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  });
}
