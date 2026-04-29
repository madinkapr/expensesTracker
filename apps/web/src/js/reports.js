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

    try {
        const res = await fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const transactions = response.data || [];

        if (transactions.length === 0) {
            document.querySelector('.main-content').innerHTML += '<p style="text-align:center; padding: 50px;">Hali ma\'lumotlar yo\'q. Hisobotlar shakllanishi uchun xarajatlar qo\'shing.</p>';
            return;
        }

        renderStats(transactions);
        storedTransactions = transactions;
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
        // Asosiy kategoriya bo'yicha guruhlash
        const name = (t.categoryId && t.categoryId.parentId) ? t.categoryId.parentId.name : (t.categoryId ? t.categoryId.name : 'Noma\'lum');
        catTotals[name] = (catTotals[name] || 0) + t.amount;
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

    // 3. O'rtacha kunlik xarajat (oxirgi 30 kun uchun)
    document.getElementById('report-daily-average').textContent = `${Math.round(monthlyTotal / 30).toLocaleString()} UZS`;
}

function renderDailyChart(transactions) {
    const ctx = document.getElementById('dailyStatsChart');

    // Oxirgi 30 kunlik massiv
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
        if (dailyData.hasOwnProperty(day)) {
            dailyData[day] += t.amount;
        }
    });

    if (dailyChart) {
        dailyChart.destroy();
    }

    const textColor = getTextColor();

    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last30Days.map(d => d.split('-')[2]), // Faqat kunlar (DD)
            datasets: [{
                label: 'Kunlik xarajat',
                data: Object.values(dailyData),
                backgroundColor: '#38bdf8',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    labels: { color: textColor }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { color: textColor }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor }
                }
            }
        }
    });
}

function renderCategoryChart(transactions) {
    const ctx = document.getElementById('categoryDistributionChart');
    const catTotals = {};

    transactions.forEach(t => {
        // Asosiy kategoriya bo'yicha guruhlash
        const name = (t.categoryId && t.categoryId.parentId) ? t.categoryId.parentId.name : (t.categoryId ? t.categoryId.name : 'Noma\'lum');
        catTotals[name] = (catTotals[name] || 0) + t.amount;
    });

    if (categoryChart) {
        categoryChart.destroy();
    }

    const textColor = getTextColor();

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
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: textColor }
                }
            },
            cutout: '65%'
        }
    });
}

function renderTopExpenses(transactions) {
    const tbody = document.getElementById('top-expenses-tbody');

    // Sana bo'yicha teskari tartibda saralash va oxirgi 5 ta yozuvni olish
    const top5 = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    tbody.innerHTML = '';
    top5.forEach(t => {
        let categoryHtml = '<span class="category-badge">Boshqa</span>';
        if (t.categoryId) {
            const hasParent = t.categoryId.parentId && typeof t.categoryId.parentId === 'object';
            if (hasParent) {
                categoryHtml = `
                    <div class="category-badge">
                        <span>${t.categoryId.parentId.icon}</span>
                        <span class="cat-parent-label">${t.categoryId.parentId.name}</span>
                        <span class="cat-divider">/</span>
                        <span class="cat-main-label">${t.categoryId.name}</span>
                    </div>
                `;
            } else {
                categoryHtml = `
                    <div class="category-badge">
                        <span>${t.categoryId.icon}</span>
                        <span class="cat-main-label">${t.categoryId.name}</span>
                    </div>
                `;
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(t.date).toLocaleDateString('uz-UZ')}</td>
            <td>${categoryHtml}</td>
            <td>${t.description}</td>
            <td class="t-amount">-${t.amount.toLocaleString()} UZS</td>
        `;
        tbody.appendChild(tr);
    });
}
