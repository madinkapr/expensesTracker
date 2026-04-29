const API_URL = 'http://localhost:3000/api';

// URL dan tokenni olish
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    document.getElementById('step-form').style.display = 'none';
    document.getElementById('step-error').style.display = 'block';
}

document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Parollar mos kelmadi!');
        return;
    }

    const btn = e.target.querySelector('button');
    btn.textContent = 'Yangilanmoqda...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('step-form').style.display = 'none';
            document.getElementById('step-success').style.display = 'block';
        } else {
            document.getElementById('step-form').style.display = 'none';
            document.getElementById('step-error').style.display = 'block';
        }
    } catch (err) {
        alert('Server bilan aloqa yo\'q');
        btn.textContent = 'Parolni yangilash';
        btn.disabled = false;
    }
});