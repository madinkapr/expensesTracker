const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadReportsData();
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
        const name = t.categoryId ? t.categoryId.name : 'Noma\'lum';
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

    new Chart(ctx, {
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
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderCategoryChart(transactions) {
    const ctx = document.getElementById('categoryDistributionChart');
    const catTotals = {};

    transactions.forEach(t => {
        const name = t.categoryId ? t.categoryId.name : 'Noma\'lum';
        catTotals[name] = (catTotals[name] || 0) + t.amount;
    });

    new Chart(ctx, {
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
                legend: { position: 'right' }
            },
            cutout: '65%'
        }
    });
}

function renderTopExpenses(transactions) {
    const tbody = document.getElementById('top-expenses-tbody');
    
    // Miqdor bo'yicha kamayish tartibida saralash va top 5 tani olish
    const top5 = [...transactions]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    tbody.innerHTML = '';
    top5.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(t.date).toLocaleDateString('uz-UZ')}</td>
            <td>${t.categoryId ? t.categoryId.icon + ' ' + t.categoryId.name : '-'}</td>
            <td>${t.description}</td>
            <td class="t-amount">-${t.amount.toLocaleString()} UZS</td>
        `;
        tbody.appendChild(tr);
    });
}
