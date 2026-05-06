const API_URL = 'http://localhost:3000/api';

let storedTransactions = [];
let dailyChart = null;
let categoryChart = null;

const getTextColor = () => document.documentElement.getAttribute('data-theme') === 'dark' ? 'white' : '#1f2937';

const initThemeObserver = () => {
    const observer = new MutationObserver(() => {
        if (storedTransactions.length > 0) {
            renderDailyChart(storedTransactions);
            renderCategoryChart(storedTransactions);
        }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
};

document.addEventListener('DOMContentLoaded', () => {
    loadReportsData();
    initThemeObserver();
});

async function loadReportsData() {
    const token = localStorage.getItem('accessToken');
    const currentLang = localStorage.getItem('language') || 'uz';

    try {
        const res = await fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const transactions = response.data || [];

        if (transactions.length === 0) {
            const container = document.querySelector('.main-content');
            container.innerHTML += `<p style="text-align:center; padding: 50px; color: var(--text-muted);">${window.i18n.translations[currentLang].no_expenses_found}</p>`;
            return;
        }

        storedTransactions = transactions;
        renderStats(transactions);
        renderDailyChart(transactions);
        renderCategoryChart(transactions);
        renderTopExpenses(transactions);

    } catch (error) {
        console.error("Reports load error:", error);
    }
}

function renderStats(transactions) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const currentLang = localStorage.getItem('language') || 'uz';

    // 1. Ushbu oydagi jami xarajat
    const monthlyTotal = transactions
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('report-monthly-total').textContent = `${monthlyTotal.toLocaleString()} UZS`;

    // 2. Eng ko'p sarflangan kategoriya
    const catTotals = {};
    transactions.forEach(t => {
        const name = (t.categoryId && t.categoryId.parentId) ? t.categoryId.parentId.name : (t.categoryId ? t.categoryId.name : 'Other');
        const translatedName = name === 'Other' ? window.i18n.translations[currentLang].cat_other : window.i18n.getCategoryName(name);
        catTotals[translatedName] = (catTotals[translatedName] || 0) + t.amount;
    });

    let topCat = '-';
    let maxVal = 0;
    for (const cat in catTotals) {
        if (catTotals[cat] > maxVal) {
            maxVal = catTotals[cat];
            topCat = cat;
        }
    }
    document.getElementById('report-top-category').textContent = topCat;

    // 3. O'rtacha kunlik xarajat
    document.getElementById('report-daily-average').textContent = `${Math.round(monthlyTotal / 30).toLocaleString()} UZS`;
}

function renderDailyChart(transactions) {
    const ctx = document.getElementById('dailyStatsChart');
    const currentLang = localStorage.getItem('language') || 'uz';

    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last30Days.push(d.toISOString().split('T')[0]);
    }

    const dailyData = {};
    last30Days.forEach(day => dailyData[day] = 0);
    transactions.forEach(t => {
        const day = new Date(t.date).toISOString().split('T')[0];
        if (dailyData.hasOwnProperty(day)) dailyData[day] += t.amount;
    });

    if (dailyChart) dailyChart.destroy();
    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last30Days.map(d => d.split('-')[2]),
            datasets: [{
                label: window.i18n.translations[currentLang].table_amount,
                data: Object.values(dailyData),
                backgroundColor: '#38bdf8',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { display: false }, ticks: { color: getTextColor() } },
                x: { grid: { display: false }, ticks: { color: getTextColor() } }
            }
        }
    });
}

function renderCategoryChart(transactions) {
    const ctx = document.getElementById('categoryDistributionChart');
    const currentLang = localStorage.getItem('language') || 'uz';
    const catTotals = {};

    transactions.forEach(t => {
        const name = (t.categoryId && t.categoryId.parentId) ? t.categoryId.parentId.name : (t.categoryId ? t.categoryId.name : 'Other');
        const translatedName = name === 'Other' ? window.i18n.translations[currentLang].cat_other : window.i18n.getCategoryName(name);
        catTotals[translatedName] = (catTotals[translatedName] || 0) + t.amount;
    });

    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(catTotals),
            datasets: [{
                data: Object.values(catTotals),
                backgroundColor: ['#1F8A70', '#38bdf8', '#fbbf24', '#f87171', '#a78bfa', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: getTextColor() } } },
            cutout: '65%'
        }
    });
}

function renderTopExpenses(transactions) {
    const tbody = document.getElementById('top-expenses-tbody');
    const currentLang = localStorage.getItem('language') || 'uz';
    const langMap = { 'uz': 'uz-UZ', 'ru': 'ru-RU', 'en': 'en-US' };

    const top5 = [...transactions].sort((a, b) => {
        // 1. Birinchi summaga qaraymiz (kattadan kichikka)
        if (b.amount !== a.amount) {
            return b.amount - a.amount;
        }
        // 2. Agar summa teng bo'lsa, yangi sanasini tepaga qo'yamiz
        return new Date(b.date) - new Date(a.date);
    }).slice(0, 5);

    tbody.innerHTML = '';
    top5.forEach(t => {
        const date = new Date(t.date).toLocaleDateString(langMap[currentLang]);
        const catName = t.categoryId ? window.i18n.getCategoryName(t.categoryId.name) : window.i18n.translations[currentLang].cat_other;
        const icon = t.categoryId ? (t.categoryId.parentId ? t.categoryId.parentId.icon : t.categoryId.icon) : '💰';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${date}</td>
            <td><div class="category-badge"><span>${icon}</span> ${catName}</div></td>
            <td>${t.description || '-'}</td>
            <td class="t-amount">-${t.amount.toLocaleString()} UZS</td>
        `;
        tbody.appendChild(tr);
    });
}

window.addEventListener('languageChanged', () => {
    if (storedTransactions.length > 0) {
        renderStats(storedTransactions);
        renderDailyChart(storedTransactions);
        renderCategoryChart(storedTransactions);
        renderTopExpenses(storedTransactions);
    }
});
