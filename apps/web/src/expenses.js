const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadExpenses();

    document.getElementById('apply-filters').addEventListener('click', loadExpenses);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
});

async function loadCategories() {
    const token = localStorage.getItem('accessToken');
    const select = document.getElementById('filter-category');

    try {
        const res = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const categories = response.data || [];

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat._id;
            option.textContent = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Categories load error:", error);
    }
}

async function loadExpenses() {
    const token = localStorage.getItem('accessToken');
    const tbody = document.getElementById('expenses-tbody');
    
    // Filtr qiymatlarini olish
    const categoryId = document.getElementById('filter-category').value;
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;

    try {
        const res = await fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        let transactions = response.data || [];

        // --- FILTRLASH (Frontend qismida) ---
        if (categoryId !== 'all') {
            transactions = transactions.filter(t => t.categoryId && t.categoryId._id === categoryId);
        }
        if (dateFrom) {
            transactions = transactions.filter(t => new Date(t.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59); // Kun oxirigacha
            transactions = transactions.filter(t => new Date(t.date) <= toDate);
        }

        // Jadvalni tozalash
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Xarajatlar topilmadi</td></tr>';
            return;
        }

        transactions.reverse().forEach(t => {
            const date = new Date(t.date).toLocaleDateString('uz-UZ');
            const categoryName = t.categoryId ? `${t.categoryId.icon} ${t.categoryId.name}` : 'Kategoriyasiz';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td><span class="category-badge">${categoryName}</span></td>
                <td>${t.description}</td>
                <td class="t-amount">-${t.amount.toLocaleString()} UZS</td>
                <td>
                    <button class="btn-delete" onclick="deleteTransaction('${t._id}')">O'chirish</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Expenses load error:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Xatolik yuz berdi</td></tr>';
    }
}

function resetFilters() {
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    loadExpenses();
}

// Global window ob'ektiga qo'shamizki, HTML dagi onclick ishlasin
window.deleteTransaction = async (id) => {
    if (!confirm("Haqiqatan ham bu xarajatni o'chirmoqchimisiz?")) return;

    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            loadExpenses(); // Jadvalni yangilash
        } else {
            alert("O'chirishda xatolik yuz berdi");
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}
