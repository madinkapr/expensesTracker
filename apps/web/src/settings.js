const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadBudgetData();

    // Formlarni bog'lash
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    document.getElementById('budget-form').addEventListener('submit', updateBudget);
    document.getElementById('password-form').addEventListener('submit', updatePassword);
});

async function loadUserData() {
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const user = response.data;

        if (user) {
            document.getElementById('settings-name').value = user.name;
            document.getElementById('settings-email').value = user.email;
        }
    } catch (error) {
        console.error("User load error:", error);
    }
}

let currentBudgetId = null;

async function loadBudgetData() {
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/budgets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const budgets = response.data || [];

        // Hozirgi oy va yilni olish
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Shu oy uchun budjet bor-yo'qligini tekshirish
        const currentBudget = budgets.find(b => b.month === month && b.year === year);

        if (currentBudget) {
            currentBudgetId = currentBudget._id;
            document.getElementById('settings-budget').value = currentBudget.totalBudget;
        }
    } catch (error) {
        console.error("Budget load error:", error);
    }
}

async function updateProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const name = document.getElementById('settings-name').value;
    const email = document.getElementById('settings-email').value;

    try {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });

        if (res.ok) {
            alert("Profil muvaffaqiyatli yangilandi!");
        } else {
            alert("Xatolik yuz berdi");
        }
    } catch (error) {
        console.error("Profile update error:", error);
    }
}

async function updateBudget(e) {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const totalBudget = Number(document.getElementById('settings-budget').value);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
        let res;
        if (currentBudgetId) {
            // Bor bo'lsa yangilash
            res = await fetch(`${API_URL}/budgets/${currentBudgetId}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ totalBudget })
            });
        } else {
            // Yo'q bo'lsa yaratish
            res = await fetch(`${API_URL}/budgets`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ month, year, totalBudget })
            });
        }

        if (res.ok) {
            alert("Oylik limit yangilandi!");
            loadBudgetData(); // ID ni olish uchun qayta yuklash
        } else {
            alert("Xatolik yuz berdi");
        }
    } catch (error) {
        console.error("Budget update error:", error);
    }
}

async function updatePassword(e) {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const password = document.getElementById('settings-password').value;

    if (!password) {
        alert("Iltimos, yangi parolni kiriting");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
            alert("Parol muvaffaqiyatli yangilandi!");
            document.getElementById('settings-password').value = '';
        } else {
            alert("Xatolik yuz berdi");
        }
    } catch (error) {
        console.error("Password update error:", error);
    }
}
