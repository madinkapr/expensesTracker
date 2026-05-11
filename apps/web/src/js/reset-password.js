const API_URL = import.meta.env.VITE_API_URL;

// URL dan tokenni olish
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    document.getElementById('step-form').style.display = 'none';
    document.getElementById('step-error').style.display = 'block';
}

document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentLang = localStorage.getItem('language') || 'uz';
    const t = window.i18n.translations[currentLang];
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert(t.error_pass_mismatch || 'Passwords do not match!');
        return;
    }

    const btn = e.target.querySelector('button');
    btn.textContent = t.btn_updating || 'Updating...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword }),
            credentials: 'include'
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
        alert(t.error_no_server || 'No server connection');
        btn.textContent = t.btn_update_pass;
        btn.disabled = false;
    }
});