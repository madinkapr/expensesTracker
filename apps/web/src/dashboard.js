const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('accessToken');

let defaultAccountId = null;

// Elementlarni tanlab olamiz
const expenseModal = document.getElementById('expense-modal');
const addExpenseBtn = document.getElementById('add-expense-btn');
const closeModal = document.querySelector('.close-modal');
const expenseForm = document.getElementById('expense-form');
const categorySelect = document.getElementById('category');

// --- DASHBOARDNI SOZLASH (SETUP) ---
async function setupDashboard() {
    try {
        // 1. Hisoblarni tekshirish (Agar yo'q bo'lsa bitta ochamiz)
        let accountsRes = await fetch(`${API_URL}/accounts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let accountsData = await accountsRes.json();
        let accounts = accountsData.data || [];

        if (accounts.length === 0) {
            const createAcc = await fetch(`${API_URL}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: 'Asosiy hamyon', type: 'cash', initialBalance: 0 })
            });
            const newAcc = await createAcc.json();
            defaultAccountId = newAcc.data._id;
        } else {
            defaultAccountId = accounts[0]._id;
        }

        // 2. Kategoriyalarni tekshirish va Select ni to'ldirish
        let catsRes = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let catsData = await catsRes.json();
        let categories = catsData.data || [];

        // Agar kategoriyalar bo'lmasa, bir nechtasini yaratamiz
        if (categories.length === 0) {
            const defaults = [
                { name: 'Ovqat', type: 'expense', icon: '🍔' },
                { name: 'Transport', type: 'expense', icon: '🚗' },
                { name: 'Ko\'ngilochar', type: 'expense', icon: '🎮' }
            ];
            for (const cat of defaults) {
                await fetch(`${API_URL}/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(cat)
                });
            }
            // Qayta yuklaymiz
            return setupDashboard();
        }

        // Selectni tozalab yangilash
        categorySelect.innerHTML = '<option value="">Tanlang...</option>';
        categories.forEach(cat => {
            if (cat.type === 'expense') {
                const option = document.createElement('option');
                option.value = cat._id;
                option.textContent = `${cat.icon || ''} ${cat.name}`;
                categorySelect.appendChild(option);
            }
        });

    } catch (err) {
        console.error("Setup error:", err);
    }
}

setupDashboard();

// --- MODALNI BOSHQARISH ---
if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => {
        expenseModal.classList.add('active');
        document.getElementById('date').valueAsDate = new Date();
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        expenseModal.classList.remove('active');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === expenseModal) {
        expenseModal.classList.remove('active');
    }
});

// --- XARAJAT QO'SHISH (API) ---
if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const amount = document.getElementById('amount').value;
        const categoryId = categorySelect.value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;

        if (!defaultAccountId) {
            alert("Xatolik: Hisob topilmadi. Sahifani yangilang.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    categoryId,
                    accountId: defaultAccountId,
                    description: description || "Xarajat", // Bo'sh bo'lsa default qiymat
                    date,
                    type: 'expense'
                })
            });

            const response = await res.json();

            if (!res.ok) {
                throw new Error(response.message || "Xarajatni saqlashda xatolik");
            }

            alert("Xarajat muvaffaqiyatli saqlandi!");
            expenseModal.classList.remove('active');
            expenseForm.reset();
            window.location.reload();

        } catch (err) {
            alert("Xatolik: " + err.message);
        }
    });
}

//--- XARAJATLARNI TORTIB OLISH VA CHIQARISH ---
async function loadTransactions() {
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const response = await res.json();
        const transactions = response.data || [];

        renderStats(transactions);
        renderTransactionList(transactions);


    } catch (error) {
        console.error("Error loading transactions:", error);
        alert("Xarajatlar yuklanmadi");
    }
}

// 1. Hisob-kitoblarni yangilash (Stats)
function renderStats(transactions) {
    let total = 0;
    let monthly = 0;
    const currentMonth = new Date().getMonth();
    transactions.forEach(t => {
        total += t.amount;
        const tMonth = new Date(t.date).getMonth();
        if (tMonth === currentMonth) {
            monthly += t.amount;
        }
    });
    // UI'ni yangilash
    document.querySelectorAll('.stat-value')[0].textContent = total.toLocaleString() + " UZS";
    document.querySelectorAll('.stat-value')[1].textContent = monthly.toLocaleString() + " UZS";
}

// 2. Ro'yxatni chiqarish
function renderTransactionList(transactions) {
    const listContainer = document.querySelector('.recent-activity');

    if (transactions.length === 0) return;
    let html = `<h3>Oxirgi xarajatlar</h3><div class="transaction-list">`;

    transactions.slice(0, 10).forEach(t => { // Faqat oxirgi 10 tasini chiqaramiz
        const icon = t.categoryId?.icon || '💰';
        const catName = t.categoryId?.name || 'Boshqa';
        html += `
            <div class="transaction-item">
            <div class="t-info">
                <span class="t-category-icon">${icon}</span>
                <div>
                    <p class="t-desc">${t.description} <small>(${catName})</small></p>
                    <small class="t-date">${new Date(t.date).toLocaleDateString()}</small>
                </div>
            </div>
            <div class="t-amount">-${t.amount.toLocaleString()} UZS</div>
        </div>
        `;
    });
    html += `</div>`;
    listContainer.innerHTML = html;
    renderExpenseChart(transactions);
}
// Sahifa yuklanganda ishga tushiramiz
loadTransactions();

let myChart = null; // Grafikni qayta chizish uchun o'zgaruvchi

function renderExpenseChart(transactions) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    // 1. Kategoriyalar bo'yicha guruhlash
    const categoryTotals = {};
    transactions.forEach(t => {
        const catName = t.categoryId?.name || 'Boshqa';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // 2. Grafikni yaratish (Doughnut - doira shaklida)
    if (myChart) myChart.destroy(); // Eskisini o'chirib, yangisini chizamiz

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#1F8A70', '#38bdf8', '#fbbf24', '#f87171', '#a78bfa'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%' // Ichini bo'sh qilib chiroyliroq qilish
        }
    });
}
