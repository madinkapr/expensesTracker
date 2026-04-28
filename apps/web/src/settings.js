const API_URL = 'http://localhost:3000/api';

let tempAvatarData = null;
let tempAvatarName = null;
let savedAvatarData = null;
let avatarRemoved = false;

const initAvatarControls = () => {
    const fileInput = document.getElementById('settings-avatar');
    const removeBtn = document.getElementById('avatar-remove');
    const preview = document.getElementById('avatar-preview');

    if (fileInput) {
        fileInput.addEventListener('change', handleAvatarUpload);
    }
    if (removeBtn) {
        removeBtn.addEventListener('click', removeAvatarSelection);
    }
    if (preview) {
        preview.addEventListener('click', handleAvatarPreviewClick);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initAvatarControls();
    loadUserData();
    loadBudgetData();

    // Formlarni bog'lash
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    document.getElementById('budget-form').addEventListener('submit', updateBudget);
    document.getElementById('password-form').addEventListener('submit', updatePassword);
});

async function loadUserData() {
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const user = response.data;

        if (user) {
            document.getElementById('settings-name').value = user.name;
            document.getElementById('settings-email').value = user.email;
        }
        loadStoredAvatar();
        updatePageAvatar(localStorage.getItem('profileImage'));
    } catch (error) {
        console.error("User load error:", error);
    }
}

function updateAvatarPreview(imageData) {
    const preview = document.getElementById('avatar-preview');
    if (!preview) return;
    if (imageData) {
        preview.style.backgroundImage = `url('${imageData}')`;
        preview.textContent = '';
    } else {
        preview.style.backgroundImage = '';
        preview.textContent = '📷';
    }
}

function updateAvatarFilename(name) {
    const filenameEl = document.getElementById('avatar-filename');
    if (!filenameEl) return;
    filenameEl.textContent = name || 'Hech rasm tanlanmadi';
}

function loadStoredAvatar() {
    savedAvatarData = localStorage.getItem('profileImage');
    const imageName = localStorage.getItem('profileImageName');
    updateAvatarPreview(savedAvatarData);
    updateAvatarFilename(imageName || (savedAvatarData ? 'Tanlangan profil rasmi' : null));
    tempAvatarData = null;
    tempAvatarName = null;
    avatarRemoved = false;
    return savedAvatarData;
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Iltimos, faqat rasm faylini tanlang.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const imageData = reader.result;
        tempAvatarData = imageData;
        tempAvatarName = file.name;
        avatarRemoved = false;
        updateAvatarPreview(imageData);
        updateAvatarFilename(file.name);
    };
    reader.readAsDataURL(file);
}

function removeAvatarSelection() {
    const fileInput = document.getElementById('settings-avatar');
    if (fileInput) {
        fileInput.value = '';
    }
    tempAvatarData = null;
    tempAvatarName = null;
    avatarRemoved = true;
    updateAvatarPreview(null);
    updateAvatarFilename(null);
}

function handleAvatarPreviewClick() {
    const url = tempAvatarData || savedAvatarData;
    if (!url) return;

    const overlay = document.createElement('div');
    overlay.className = 'avatar-overlay';
    overlay.innerHTML = `
        <div class="avatar-overlay-backdrop"></div>
        <img class="avatar-overlay-image" src="${url}" alt="Avatar preview">
    `;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
}

function updatePageAvatar(imageData) {
    const avatarEls = document.querySelectorAll('.avatar');
    avatarEls.forEach(el => {
        if (imageData) {
            el.style.backgroundImage = `url('${imageData}')`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
            el.textContent = '';
        } else {
            el.style.backgroundImage = '';
            el.textContent = '👤';
        }
    });
}

let currentBudgetId = null;

async function loadBudgetData() {
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/budgets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const budgets = response.data || [];

        // Hozirgi oy va yilni olish
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Shu oy uchun budjet bor-yo'qligini tekshirish
        const currentBudget = budgets.find(b => b.month === month && b.year === year);

        if (currentBudget) {
            currentBudgetId = currentBudget._id;
            document.getElementById('settings-budget').value = currentBudget.totalBudget;
        }
    } catch (error) {
        console.error("Budget load error:", error);
    }
}

async function updateProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const name = document.getElementById('settings-name').value;
    const email = document.getElementById('settings-email').value;

    try {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });

        if (res.ok) {
            await applyAvatarChanges();
            alert("Profil muvaffaqiyatli yangilandi!");
        } else {
            alert("Xatolik yuz berdi");
        }
    } catch (error) {
        console.error("Profile update error:", error);
    }
}

async function applyAvatarChanges() {
    if (avatarRemoved) {
        localStorage.removeItem('profileImage');
        localStorage.removeItem('profileImageName');
        savedAvatarData = null;
        updatePageAvatar(null);
    }
    if (tempAvatarData) {
        localStorage.setItem('profileImage', tempAvatarData);
        localStorage.setItem('profileImageName', tempAvatarName);
        savedAvatarData = tempAvatarData;
        updatePageAvatar(savedAvatarData);
    }
    tempAvatarData = null;
    tempAvatarName = null;
    avatarRemoved = false;
    loadStoredAvatar();
}

async function updateBudget(e) {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const totalBudget = Number(document.getElementById('settings-budget').value);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
        let res;
        if (currentBudgetId) {
            // Bor bo'lsa yangilash
            res = await fetch(`${API_URL}/budgets/${currentBudgetId}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ totalBudget })
            });
        } else {
            // Yo'q bo'lsa yaratish
            res = await fetch(`${API_URL}/budgets`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ month, year, totalBudget })
            });
        }

        if (res.ok) {
            alert("Oylik limit yangilandi!");
            loadBudgetData(); // ID ni olish uchun qayta yuklash
        } else {
            alert("Xatolik yuz berdi");
        }
    } catch (error) {
        console.error("Budget update error:", error);
    }
}

async function updatePassword(e) {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const password = document.getElementById('settings-password').value;

    if (!password) {
        alert("Iltimos, yangi parolni kiriting");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
            alert("Parol muvaffaqiyatli yangilandi!");
            document.getElementById('settings-password').value = '';
        } else {
            alert("Xatolik yuz berdi");
        }
    } catch (error) {
        console.error("Password update error:", error);
    }
}
