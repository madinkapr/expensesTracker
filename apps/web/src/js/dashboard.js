const API_URL = import.meta.env.VITE_API_URL;

// Global Chart ob'ektlari
let expenseChartObj = null;
let weeklyChartObj = null;
let dashboardTransactions = [];
let allCategories = []; // Kategoriyalarni saqlash uchun
let currentBudget = null;
let defaultAccountId = null;

const getTextColor = () => document.documentElement.getAttribute('data-theme') === 'dark' ? 'white' : '#1f2937';

const initDashboardThemeObserver = () => {
    const observer = new MutationObserver(() => {
        if (dashboardTransactions.length > 0) {
            renderExpenseChart(dashboardTransactions);
            renderWeeklyChart(dashboardTransactions);
        }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
};

document.addEventListener('DOMContentLoaded', async () => {
    initDashboardThemeObserver();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
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
            credentials: 'include'
        });
        const catData = await catRes.json();
        if (catData.data) {
            allCategories = catData.data;
            renderCategoryOptions(allCategories);
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

            const selectedDate = document.getElementById('date').value;
            const now = new Date();

            // Mahalliy bugungi sanani aniqlaymiz (YYYY-MM-DD)
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const localTodayStr = `${year}-${month}-${day}`;

            let finalDate;
            if (selectedDate === localTodayStr || !selectedDate) {
                finalDate = now.toISOString();
            } else {
                finalDate = new Date(selectedDate).toISOString();
            }

            const formData = {
                amount: Number(document.getElementById('amount').value),
                categoryId: document.getElementById('category').value,
                accountId: defaultAccountId, // Hisob ID sini yuboramiz
                description: document.getElementById('description').value,
                date: finalDate,
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
                    const errorBody = await res.json();
                    alert("Xatolik: " + (errorBody.message || "Serverda xato yuz berdi"));
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
            credentials: 'include'
        });
        const userData = await userRes.json();
        if (userData.data) {
            window.currentUserName = userData.data.name; // Ismni eslab qolamiz
            updateWelcomeMessage(); // Salomlashishni yozamiz
        }

        // 2. Hisob va Kategoriyalarni tekshirish (faqat birinchi marta kirgan bo'lsa)
        const accountsRes = await fetch(`${API_URL}/accounts`, {
            credentials: 'include'
        });
        const accountsData = await accountsRes.json();
        if (accountsData.data && accountsData.data.length > 0) {
            defaultAccountId = accountsData.data[0]._id; // Birinchi topilgan hisobni saqlaymiz
        }

        if (accountsData.data && accountsData.data.length === 0) {
            console.log("Dastlabki sozlamalar bajarilmoqda...");
            // Bu yerda backendda avtomatik hisob yaratish logikasi bo'lishi mumkin
            // Hozircha dashboard ishlayveradi
        }
    } catch (error) {
        console.error("Setup error:", error);
    }
}

// BU FUNKSIYA TIL O'ZGARISHI BILAN SALOMLASHISHNI HAM O'ZGARTIRADI
function updateWelcomeMessage() {
    const welcomeEl = document.getElementById('user-welcome');
    if (welcomeEl && window.currentUserName) {
        const greetings = {
            uz: "Xush kelibsiz",
            ru: "Добро пожаловать",
            en: "Welcome"
        };
        const currentLang = localStorage.getItem('language') || 'uz';
        const greeting = greetings[currentLang] || greetings.uz;
        welcomeEl.textContent = `${greeting}, ${window.currentUserName}!`;
    }
}

// --- MA'LUMOTLARNI YUKLASH ---
async function loadDashboardData() {
    try {
        const [transRes, budgetRes] = await Promise.all([
            fetch(`${API_URL}/transactions`, { credentials: 'include' }),
            fetch(`${API_URL}/budgets`, { credentials: 'include' })
        ]);

        const transData = await transRes.json();
        const budgetData = await budgetRes.json();

        const transactions = transData.data || [];
        const budgets = budgetData.data || [];

        // Hozirgi oy budjetini topish
        const now = new Date();
        currentBudget = budgets.find(b => b.month === (now.getMonth() + 1) && b.year === now.getFullYear());

        renderStats(transactions, currentBudget);
        dashboardTransactions = transactions;
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
        // Tilni aniqlash
        const currentLang = localStorage.getItem('language') || 'uz';

        const labels = {
            uz: { remaining: "Limitdan qoldi", noLimit: "Limit belgilanmagan", setLimit: "Sozlamalarda o'rnating" },
            ru: { remaining: "Остаток лимита", noLimit: "Лимит не установлен", setLimit: "Установите в настройках" },
            en: { remaining: "Remaining Limit", noLimit: "No limit set", setLimit: "Set in settings" }
        };

        const currentLabels = labels[currentLang] || labels.uz;

        if (budget && budget.totalBudget > 0) {
            const limitAmount = budget.totalBudget;
            const remaining = limitAmount - monthly;

            limitLabelEl.textContent = currentLabels.remaining;
            limitValueEl.textContent = (remaining > 0 ? remaining.toLocaleString() : 0) + " UZS";
            limitValueEl.style.fontSize = "";
            limitValueEl.style.color = remaining <= 0 ? "var(--danger)" : "";
        } else {
            limitLabelEl.textContent = currentLabels.noLimit;
            limitValueEl.textContent = currentLabels.setLimit;
            limitValueEl.style.fontSize = "14px";
            limitValueEl.style.color = "var(--text-muted)";
        }
    }
}

// 2. Oxirgi harakatlar ro'yxati
function renderRecentActivity(transactions) {
    const listContainer = document.querySelector('.recent-activity');
    if (!listContainer) return;

    // Tilni aniqlash
    const currentLang = localStorage.getItem('language') || 'uz';
    const labels = {
        uz: { title: "Oxirgi xarajatlar", empty: "Hozircha hech qanday xarajat kiritilmagan.", other: "Boshqa" },
        ru: { title: "Последние расходы", empty: "Расходов пока нет.", other: "Прочее" },
        en: { title: "Recent Activity", empty: "No expenses recorded yet.", other: "Other" }
    };
    const cur = labels[currentLang] || labels.uz;

    if (transactions.length === 0) {
        listContainer.innerHTML = `<h3>${cur.title}</h3><p style="text-align:center; padding: 20px; color: var(--text-muted);">${cur.empty}</p>`;
        return;
    }

    let html = `<h3>${cur.title}</h3><div class="transaction-list">`;
    transactions.slice(0, 5).forEach(t => {
        let categoryHtml = `<span class="cat-main-label">${cur.other}</span>`;
        let icon = '💰';

        if (t.categoryId) {
            const hasParent = t.categoryId.parentId && typeof t.categoryId.parentId === 'object';
            icon = hasParent ? t.categoryId.parentId.icon : t.categoryId.icon;

            if (hasParent) {
                categoryHtml = `
                    <div class="category-badge" style="background: none; border: none; padding: 0; box-shadow: none;">
                        <span class="cat-parent-label">${window.i18n.getCategoryName(t.categoryId.parentId.name)}</span>
                        <span class="cat-divider">/</span>
                        <span class="cat-main-label">${window.i18n.getCategoryName(t.categoryId.name)}</span>
                    </div>
                `;
            } else {
                categoryHtml = `<span class="cat-main-label">${window.i18n.getCategoryName(t.categoryId.name)}</span>`;
            }
        }

        html += `
            <div class="transaction-item">
                <div class="t-info">
                    <span class="t-category-icon">${icon}</span>
                    <div>
                        <p class="t-desc">${t.description}</p>
                        <div style="margin-top: 4px;">${categoryHtml}</div>
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
        // Sub-kategoriyalarni asosiy kategoriyaga guruhlash
        const catName = (t.categoryId && t.categoryId.parentId) ? t.categoryId.parentId.name : (t.categoryId ? t.categoryId.name : 'Boshqa');
        categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
    });

    if (expenseChartObj) expenseChartObj.destroy();

    const textColor = getTextColor();
    expenseChartObj = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ['#1F8A70', '#38bdf8', '#fbbf24', '#f87171', '#a78bfa', '#ec4899', '#f97316'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: textColor } } },
            cutout: '70%'
        }
    });
}

// 4. Haftalik dinamika (Line Chart)
function renderWeeklyChart(transactions) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    const last7Days = [];
    const dailyTotals = {};

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const localDate = d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        last7Days.push(localDate);
        dailyTotals[localDate] = 0;
    }

    transactions.forEach(t => {
        const tDate = new Date(t.date).toLocaleDateString('en-CA');
        if (dailyTotals.hasOwnProperty(tDate)) {
            dailyTotals[tDate] += t.amount;
        }
    });

    if (weeklyChartObj) weeklyChartObj.destroy();

    const textColor = getTextColor();
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
                y: { beginAtZero: true, grid: { display: false }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });
}

function renderCategoryOptions(categories) {
    const categorySelect = document.getElementById('category');
    if (!categorySelect || !categories) return;

    const mainCats = categories.filter(c => !c.parentId);
    let optionsHtml = '';

    mainCats.forEach(main => {
        optionsHtml += `<option value="${main._id}">${main.icon} ${window.i18n.getCategoryName(main.name)}</option>`;
        const children = categories.filter(c => c.parentId === main._id);
        children.forEach(child => {
            optionsHtml += `<option value="${child._id}">&nbsp;&nbsp;&nbsp;${child.icon} ${window.i18n.getCategoryName(child.name)}</option>`;
        });
    });

    categorySelect.innerHTML = optionsHtml;
}

window.addEventListener('languageChanged', () => {
    updateWelcomeMessage(); // TIL O'ZGARISHI BILAN BU HAM ISHLAYDI!
    // 1. Statistikani qayta chizish
    if (dashboardTransactions && dashboardTransactions.length > 0) {
        renderStats(dashboardTransactions, currentBudget);
        renderRecentActivity(dashboardTransactions);
    }
    // 2. Modal ichidagi kategoriyalarni qayta chizish
    if (allCategories && allCategories.length > 0) {
        renderCategoryOptions(allCategories);
    }
});

