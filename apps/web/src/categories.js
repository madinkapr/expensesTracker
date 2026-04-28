const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('accessToken');

document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    await loadCategories();
    setupCategoryModal();
});

async function loadCategories() {
    const grid = document.getElementById('categories-grid');
    const mainCatsList = document.getElementById('main-cats-list');
    
    try {
        const res = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        const categories = result.data || [];

        // 1. Datalist ni to'ldirish (takliflar uchun)
        const mainCats = categories.filter(c => !c.parentId && c.name !== 'Boshqa');
        mainCatsList.innerHTML = mainCats.map(c => `<option value="${c.name}">`).join('');

        // 2. Gridni render qilish
        if (categories.length === 0) {
            grid.innerHTML = '<p class="loading">Kategoriyalar topilmadi.</p>';
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
                                <h4>${main.name}</h4>
                                <small>${main.type === 'expense' ? 'Xarajat' : 'Daromad'}</small>
                            </div>
                        </div>
                        <div class="category-actions">
                            <button class="btn-icon add-sub-btn" data-name="${main.name}" title="Sub-kategoriya qo'shish">➕</button>
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
                                            <h4>${child.name}</h4>
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
                parentInput.value = btn.dataset.name;
                modal.style.display = 'flex';
                document.getElementById('cat-name').focus();
            };
        });

        // O'chirish tugmalari
        document.querySelectorAll('.delete-cat').forEach(btn => {
            btn.onclick = async (e) => {
                if (confirm('Ushbu kategoriyani o\'chirmoqchimisiz?')) {
                    await deleteCategory(btn.dataset.id);
                }
            };
        });

    } catch (err) {
        console.error("Xatolik:", err);
        grid.innerHTML = '<p class="loading">Yuklashda xato yuz berdi.</p>';
    }
}

function setupCategoryModal() {
    const modal = document.getElementById('category-modal');
    const btn = document.getElementById('add-category-btn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('category-form');

    btn.onclick = () => modal.style.display = 'flex';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('cat-name').value;
        const icon = document.getElementById('cat-icon').value;
        const type = document.getElementById('cat-type').value;
        const parentName = document.getElementById('cat-parent-name').value.trim();

        let parentId = null;

        try {
            // 1. Agar parentName yozilgan bo'lsa, uni ID sini topish yoki yaratish
            if (parentName) {
                const res = await fetch(`${API_URL}/categories`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                const categories = result.data || [];
                
                const existingParent = categories.find(c => c.name.toLowerCase() === parentName.toLowerCase() && !c.parentId);
                
                if (existingParent) {
                    parentId = existingParent._id;
                } else {
                    // Yangi asosiy kategoriya yaratish
                    const newParentRes = await fetch(`${API_URL}/categories`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: parentName,
                            icon: '📁', // Default ikonka
                            type: type
                        })
                    });
                    const newParentData = await newParentRes.json();
                    if (newParentRes.ok) {
                        parentId = newParentData.data._id;
                    } else {
                        throw new Error(newParentData.message || "Asosiy kategoriyani yaratib bo'lmadi");
                    }
                }
            }

            // 2. Haqiqiy kategoriyani yaratish
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, icon, type, parentId })
            });

            if (res.ok) {
                modal.style.display = 'none';
                form.reset();
                await loadCategories();
            } else {
                const data = await res.json();
                alert(data.message || "Xatolik yuz berdi");
            }
        } catch (err) {
            alert(err.message || "Server bilan aloqa yo'q");
        }
    };
}


async function deleteCategory(id) {
    try {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            await loadCategories();
        } else {
            alert("O'chirishda xatolik (Balki bu standart kategoriyadir)");
        }
    } catch (err) {
        alert("Server bilan aloqa yo'q");
    }
}
