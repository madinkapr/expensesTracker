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
    const currentLang = localStorage.getItem('language') || 'uz';

    try {
        const res = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const categories = response.data || [];

        // Selectni tozalash va "Barchasi"ni qo'shish
        if (select) {
            select.innerHTML = `<option value="all" data-i18n="all_categories">${window.i18n.translations[currentLang].all_categories}</option>`;

            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat._id;
                option.textContent = `${cat.icon} ${window.i18n.getCategoryName(cat.name)}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Categories load error:", error);
    }
}

async function loadExpenses() {
    const token = localStorage.getItem('accessToken');
    const tbody = document.getElementById('expenses-tbody');
    const currentLang = localStorage.getItem('language') || 'uz';
    const langMap = { 'uz': 'uz-UZ', 'ru': 'ru-RU', 'en': 'en-US' };

    const categoryId = document.getElementById('filter-category').value;
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;

    try {
        const res = await fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        let transactions = response.data || [];

        if (categoryId !== 'all') {
            transactions = transactions.filter(t => {
                if (!t.categoryId) return false;
                return t.categoryId._id === categoryId || (t.categoryId.parentId && t.categoryId.parentId._id === categoryId);
            });
        }
        if (dateFrom) {
            transactions = transactions.filter(t => new Date(t.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59);
            transactions = transactions.filter(t => new Date(t.date) <= toDate);
        }

        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">${window.i18n.translations[currentLang].no_expenses_found}</td></tr>`;
            return;
        }

        transactions.forEach(t => {
            const date = new Date(t.date).toLocaleDateString(langMap[currentLang]);

            let categoryHtml = `<span class="category-badge">${window.i18n.translations[currentLang].no_category}</span>`;
            if (t.categoryId) {
                const hasParent = t.categoryId.parentId && typeof t.categoryId.parentId === 'object';
                if (hasParent) {
                    categoryHtml = `
                        <div class="category-badge">
                            <span>${t.categoryId.parentId.icon}</span>
                            <span class="cat-parent-label">${window.i18n.getCategoryName(t.categoryId.parentId.name)}</span>
                            <span class="cat-divider">/</span>
                            <span class="cat-main-label">${window.i18n.getCategoryName(t.categoryId.name)}</span>
                        </div>
                    `;
                } else {
                    categoryHtml = `
                        <div class="category-badge">
                            <span>${t.categoryId.icon}</span>
                            <span class="cat-main-label">${window.i18n.getCategoryName(t.categoryId.name)}</span>
                        </div>
                    `;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td>${categoryHtml}</td>
                <td>${t.description}</td>
                <td class="t-amount">-${t.amount.toLocaleString()} UZS</td>
                <td>
                    <button class="btn-delete" onclick="deleteTransaction('${t._id}')">${window.i18n.translations[currentLang].btn_delete}</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Expenses load error:", error);
    }
}

function resetFilters() {
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    loadExpenses();
}

window.deleteTransaction = async (id) => {
    const currentLang = localStorage.getItem('language') || 'uz';
    if (!confirm(window.i18n.translations[currentLang].delete_confirm)) return;

    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            loadExpenses();
        } else {
            alert(window.i18n.translations[currentLang].alert_error || "Error");
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

window.addEventListener('languageChanged', () => {
    loadCategories();
    loadExpenses();
});
