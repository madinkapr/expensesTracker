const API_URL = 'http://localhost:3000/api';

document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const btn = e.target.querySelector('button');
    btn.textContent = 'Yuborilmoqda...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/forget-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('step-email').style.display = 'none';
            document.getElementById('step-success').style.display = 'block';
        } else {
            alert(data.message || 'Xatolik yuz berdi');
            btn.textContent = 'Havola yuborish';
            btn.disabled = false;
        }
    } catch (err) {
        alert('Server bilan aloqa yo\'q');
        btn.textContent = 'Havola yuborish';
        btn.disabled = false;
    }
});