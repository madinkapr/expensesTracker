const API_URL = import.meta.env.VITE_API_URL;

document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = '/login.html';
        return;
    }

    await loadCategories();
    setupCategoryModal();
});

async function loadCategories() {
    const grid = document.getElementById('categories-grid');
    const mainCatsList = document.getElementById('main-cats-list');
    const currentLang = localStorage.getItem('language') || 'uz';

    try {
        const res = await fetch(`${API_URL}/categories`, {
            credentials: 'include'
        });
        const result = await res.json();
        const categories = result.data || [];

        // 1. Datalist ni to'ldirish
        const mainCats = categories.filter(c => !c.parentId && c.name !== 'Boshqa');
        mainCatsList.innerHTML = mainCats.map(c => `<option value="${window.i18n.getCategoryName(c.name)}">`).join('');

        // 2. Gridni render qilish
        if (categories.length === 0) {
            grid.innerHTML = `<p class="loading">${window.i18n.translations[currentLang].no_categories_found || 'No categories'}</p>`;
            return;
        }

        let html = '';
        mainCats.forEach(main => {
            const children = categories.filter(c => c.parentId === main._id);

            html += `
                <div class="category-group">
                    <div class="category-card" data-id="${main._id}">
                        <div class="category-main">
                            <div class="category-icon-box">${main.icon}</div>
                            <div class="category-info">
                                <h4>${window.i18n.getCategoryName(main.name)}</h4>
                                <small>${main.type === 'expense' ? window.i18n.translations[currentLang].type_expense : window.i18n.translations[currentLang].type_income}</small>
                            </div>
                        </div>
                        <div class="category-actions">
                            <button class="btn-icon add-sub-btn" data-name="${main.name}" title="${window.i18n.translations[currentLang].add_sub_category || 'Add Sub'}">➕</button>
                            ${!main.isDefault ? `<button class="btn-icon delete-cat" data-id="${main._id}">🗑️</button>` : ''}
                        </div>
                    </div>
                    ${children.length > 0 ? `
                        <div class="sub-categories">
                            ${children.map(child => `
                                <div class="category-card sub-category-card" data-id="${child._id}">
                                    <div class="category-main">
                                        <div class="category-icon-box">${child.icon}</div>
                                        <div class="category-info">
                                            <h4>${window.i18n.getCategoryName(child.name)}</h4>
                                        </div>
                                    </div>
                                    <div class="category-actions">
                                        <button class="btn-icon delete-cat" data-id="${child._id}">🗑️</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        grid.innerHTML = html;

        // "➕ Sub-kategoriya qo'shish" tugmasi mantiqi
        document.querySelectorAll('.add-sub-btn').forEach(btn => {
            btn.onclick = () => {
                const modal = document.getElementById('category-modal');
                const parentInput = document.getElementById('cat-parent-name');
                parentInput.value = window.i18n.getCategoryName(btn.dataset.name);
                modal.style.display = 'flex';
                document.getElementById('cat-name').focus();
            };
        });

        // O'chirish tugmalari
        document.querySelectorAll('.delete-cat').forEach(btn => {
            btn.onclick = async () => {
                if (confirm(window.i18n.translations[currentLang].delete_confirm)) {
                    await deleteCategory(btn.dataset.id);
                }
            };
        });

    } catch (err) {
        console.error("Xatolik:", err);
        grid.innerHTML = '<p class="loading">Error</p>';
    }
}

function setupCategoryModal() {
    const modal = document.getElementById('category-modal');
    const btn = document.getElementById('add-category-btn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('category-form');
    const currentLang = localStorage.getItem('language') || 'uz';

    if (btn) btn.onclick = () => modal.style.display = 'flex';
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        const name = document.getElementById('cat-name').value;
        const icon = document.getElementById('cat-icon').value;
        const type = document.getElementById('cat-type').value;
        const parentName = document.getElementById('cat-parent-name').value.trim();

        let parentId = null;

        try {
            if (parentName) {
                const res = await fetch(`${API_URL}/categories`, { credentials: 'include' });
                const result = await res.json();
                const categories = result.data || [];
                const existingParent = categories.find(c => (c.name.toLowerCase() === parentName.toLowerCase() || window.i18n.getCategoryName(c.name).toLowerCase() === parentName.toLowerCase()) && !c.parentId);

                if (existingParent) {
                    parentId = existingParent._id;
                } else {
                    const newParentRes = await fetch(`${API_URL}/categories`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ name: parentName, icon: '📁', type: type })
                    });
                    const newParentData = await newParentRes.json();
                    if (newParentRes.ok) parentId = newParentData.data._id;
                    else throw new Error(newParentData.message);
                }
            }

            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, icon, type, parentId })
            });

            if (res.ok) {
                modal.style.display = 'none';
                form.reset();
                await loadCategories();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            submitBtn.disabled = false;
        }
    };
}

async function deleteCategory(id) {
    const currentLang = localStorage.getItem('language') || 'uz';
    try {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            await loadCategories();
        } else {
            alert(window.i18n.translations[currentLang].alert_error);
        }
    } catch (err) {
        alert("Error");
    }
}

// TIL O'ZGARGANDA SAHIFANI RE-RENDER QILISH
window.addEventListener('languageChanged', () => {
    loadCategories();
});
