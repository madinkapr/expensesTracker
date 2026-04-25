const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('accessToken');

// Global Chart ob'ektlari
let expenseChartObj = null;
let weeklyChartObj = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    await setupDashboard();
    await loadDashboardData();
});

// --- DASHBOARDNI SOZLASH (SETUP) ---
async function setupDashboard() {
    const modal = document.getElementById('expense-modal');
    const addBtn = document.getElementById('add-expense-btn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('expense-form');
    const categorySelect = document.getElementById('category');

    // 1. Modalni boshqarish
    if (addBtn && modal) {
        addBtn.onclick = () => modal.style.display = 'flex';
    }
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    // 2. Kategoriyalarni yuklash
    try {
        const catRes = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const catData = await catRes.json();
        if (catData.data && categorySelect) {
            categorySelect.innerHTML = catData.data.map(c => 
                `<option value="${c._id}">${c.icon} ${c.name}</option>`
            ).join('');
        }
    } catch (err) {
        console.error("Kategoriyalarni yuklashda xato:", err);
    }

    // 3. Formani yuborish
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saqlanmoqda...';

            const formData = {
                amount: Number(document.getElementById('amount').value),
                categoryId: document.getElementById('category').value,
                description: document.getElementById('description').value,
                date: document.getElementById('date').value || new Date().toISOString(),
                type: 'expense'
            };

            try {
                const res = await fetch(`${API_URL}/transactions`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    modal.style.display = 'none';
                    form.reset();
                    await loadDashboardData(); // Ma'lumotlarni yangilash
                } else {
                    alert("Xatolik yuz berdi");
                }
            } catch (err) {
                alert("Server bilan aloqa yo'q");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Saqlash';
            }
        };
    }

    try {
        // 4. Foydalanuvchi ismini yuklash
        const userRes = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (userData.data && document.getElementById('user-welcome')) {
            document.getElementById('user-welcome').textContent = `Xush kelibsiz, ${userData.data.name}!`;
        }

        // 2. Hisob va Kategoriyalarni tekshirish (faqat birinchi marta kirgan bo'lsa)
        const accountsRes = await fetch(`${API_URL}/accounts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const accountsData = await accountsRes.json();

        if (accountsData.data && accountsData.data.length === 0) {
            console.log("Dastlabki sozlamalar bajarilmoqda...");
            // Bu yerda backendda avtomatik hisob yaratish logikasi bo'lishi mumkin
            // Hozircha dashboard ishlayveradi
        }
    } catch (error) {
        console.error("Setup error:", error);
    }
}

// --- MA'LUMOTLARNI YUKLASH ---
async function loadDashboardData() {
    try {
        const [transRes, budgetRes] = await Promise.all([
            fetch(`${API_URL}/transactions`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/budgets`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const transData = await transRes.json();
        const budgetData = await budgetRes.json();

        const transactions = transData.data || [];
        const budgets = budgetData.data || [];

        // Hozirgi oy budjetini topish
        const now = new Date();
        const currentBudget = budgets.find(b => b.month === (now.getMonth() + 1) && b.year === now.getFullYear());

        renderStats(transactions, currentBudget);
        renderRecentActivity(transactions);
        renderExpenseChart(transactions);
        renderWeeklyChart(transactions);

    } catch (error) {
        console.error("Dashboard yuklashda xatolik:", error);
    }
}

// 1. Statistika (Cards)
function renderStats(transactions, budget) {
    let total = 0;
    let monthly = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    transactions.forEach(t => {
        total += t.amount;
        const tDate = new Date(t.date);
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            monthly += t.amount;
        }
    });

    const totalEl = document.getElementById('stat-total');
    const monthlyEl = document.getElementById('stat-monthly');
    const limitLabelEl = document.getElementById('stat-limit-label');
    const limitValueEl = document.getElementById('stat-limit-value');

    if (totalEl) totalEl.textContent = total.toLocaleString() + " UZS";
    if (monthlyEl) monthlyEl.textContent = monthly.toLocaleString() + " UZS";

    if (limitLabelEl && limitValueEl) {
        if (budget && budget.totalBudget > 0) {
            const limitAmount = budget.totalBudget;
            const remaining = limitAmount - monthly;
            
            limitLabelEl.textContent = "Limitdan qoldi";
            limitValueEl.textContent = (remaining > 0 ? remaining.toLocaleString() : 0) + " UZS";
            limitValueEl.style.fontSize = "";
            limitValueEl.style.color = remaining <= 0 ? "var(--danger)" : "";
        } else {
            limitLabelEl.textContent = "Limit belgilanmagan";
            limitValueEl.textContent = "Sozlamalarda o'rnating";
            limitValueEl.style.fontSize = "14px";
            limitValueEl.style.color = "var(--text-muted)";
        }
    }
}

// 2. Oxirgi harakatlar ro'yxati
function renderRecentActivity(transactions) {
    const listContainer = document.querySelector('.recent-activity');
    if (!listContainer) return;

    if (transactions.length === 0) {
        listContainer.innerHTML = `<h3>Oxirgi xarajatlar</h3><p style="text-align:center; padding: 20px; color: var(--text-muted);">Hozircha hech qanday xarajat kiritilmagan.</p>`;
        return;
    }

    let html = `<h3>Oxirgi xarajatlar</h3><div class="transaction-list">`;
    transactions.slice().reverse().slice(0, 5).forEach(t => {
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
}

// 3. Xarajatlar taqsimoti (Pie Chart)
function renderExpenseChart(transactions) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    const categoryTotals = {};
    transactions.forEach(t => {
        const catName = t.categoryId?.name || 'Boshqa';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
    });

    if (expenseChartObj) expenseChartObj.destroy();

    expenseChartObj = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ['#1F8A70', '#38bdf8', '#fbbf24', '#f87171', '#a78bfa'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            cutout: '70%'
        }
    });
}

// 4. Haftalik dinamika (Line Chart)
function renderWeeklyChart(transactions) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toISOString().split('T')[0]);
    }

    const dailyTotals = {};
    last7Days.forEach(date => dailyTotals[date] = 0);

    transactions.forEach(t => {
        const tDate = new Date(t.date).toISOString().split('T')[0];
        if (dailyTotals.hasOwnProperty(tDate)) {
            dailyTotals[tDate] += t.amount;
        }
    });

    if (weeklyChartObj) weeklyChartObj.destroy();

    weeklyChartObj = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(d => new Date(d).toLocaleDateString('uz-UZ', { weekday: 'short' })),
            datasets: [{
                label: 'Xarajatlar',
                data: Object.values(dailyTotals),
                borderColor: '#1F8A70',
                backgroundColor: 'rgba(31, 138, 112, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}
