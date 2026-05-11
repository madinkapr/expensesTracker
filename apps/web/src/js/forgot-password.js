const API_URL = import.meta.env.VITE_API_URL;

document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentLang = localStorage.getItem('language') || 'uz';
    const t = window.i18n.translations[currentLang];
    
    const email = document.getElementById('email').value;
    const btn = e.target.querySelector('button');
    btn.textContent = t.btn_sending || 'Sending...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/forget-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('step-email').style.display = 'none';
            document.getElementById('step-success').style.display = 'block';
        } else {
            alert(data.message || t.error_general);
            btn.textContent = t.btn_send_link;
            btn.disabled = false;
        }
    } catch (err) {
        alert(t.error_no_server || 'No server connection');
        btn.textContent = t.btn_send_link;
        btn.disabled = false;
    }
});