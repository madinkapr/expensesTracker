const API_URL = 'http://localhost:3000/api';

let tempAvatarData = null;
let tempAvatarName = null;
let savedAvatarData = null;
let avatarRemoved = false;

function getUserIdFromToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch (e) { return null; }
}

const initAvatarControls = () => {
    const fileInput = document.getElementById('settings-avatar');
    const removeBtn = document.getElementById('avatar-remove');
    const preview = document.getElementById('avatar-preview');

    if (fileInput) fileInput.addEventListener('change', handleAvatarUpload);
    if (removeBtn) removeBtn.addEventListener('click', removeAvatarSelection);
    if (preview) preview.addEventListener('click', handleAvatarPreviewClick);
};

document.addEventListener('DOMContentLoaded', () => {
    initAvatarControls();
    loadUserData();
    loadBudgetData();

    const profileForm = document.getElementById('profile-form');
    const budgetForm = document.getElementById('budget-form');
    const passwordForm = document.getElementById('password-form');

    if (profileForm) profileForm.addEventListener('submit', updateProfile);
    if (budgetForm) budgetForm.addEventListener('submit', updateBudget);
    if (passwordForm) passwordForm.addEventListener('submit', updatePassword);
});

async function loadUserData() {
    const token = localStorage.getItem('accessToken');
    const currentLang = localStorage.getItem('language') || 'uz';
    try {
        const res = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await res.json();
        const user = response.data;

        if (user) {
            const nameEl = document.getElementById('settings-name');
            const emailEl = document.getElementById('settings-email');
            if (nameEl) nameEl.value = user.name;
            if (emailEl) emailEl.value = user.email;
        }
        loadStoredAvatar();
        const userId = getUserIdFromToken();
        updatePageAvatar(localStorage.getItem(`profileImage_${userId}`));
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
    const currentLang = localStorage.getItem('language') || 'uz';
    filenameEl.textContent = name || window.i18n.translations[currentLang].no_pic;
}

function loadStoredAvatar() {
    const userId = getUserIdFromToken();
    const AVATAR_KEY = `profileImage_${userId}`;
    const AVATAR_NAME_KEY = `profileImageName_${userId}`;

    savedAvatarData = localStorage.getItem(AVATAR_KEY);
    const imageName = localStorage.getItem(AVATAR_NAME_KEY);

    updateAvatarPreview(savedAvatarData);
    updateAvatarFilename(imageName);

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
    if (fileInput) fileInput.value = '';
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
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const currentBudget = budgets.find(b => b.month === month && b.year === year);

        if (currentBudget) {
            currentBudgetId = currentBudget._id;
            const budgetEl = document.getElementById('settings-budget');
            if (budgetEl) budgetEl.value = currentBudget.totalBudget;
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
    const currentLang = localStorage.getItem('language') || 'uz';

    try {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });

        if (res.ok) {
            await applyAvatarChanges();
            alert(window.i18n.translations[currentLang].alert_profile_updated || "Profile updated!");
        } else {
            alert(window.i18n.translations[currentLang].alert_error);
        }
    } catch (error) {
        console.error("Profile update error:", error);
    }
}

async function applyAvatarChanges() {
    const userId = getUserIdFromToken();
    const AVATAR_KEY = `profileImage_${userId}`;
    const AVATAR_NAME_KEY = `profileImageName_${userId}`;

    if (avatarRemoved) {
        localStorage.removeItem(AVATAR_KEY);
        localStorage.removeItem(AVATAR_NAME_KEY);
        savedAvatarData = null;
        updatePageAvatar(null);
    }

    if (tempAvatarData) {
        localStorage.setItem(AVATAR_KEY, tempAvatarData);
        localStorage.setItem(AVATAR_NAME_KEY, tempAvatarName);
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
    const currentLang = localStorage.getItem('language') || 'uz';

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
        let res;
        if (currentBudgetId) {
            res = await fetch(`${API_URL}/budgets/${currentBudgetId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalBudget })
            });
        } else {
            res = await fetch(`${API_URL}/budgets`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year, totalBudget })
            });
        }

        if (res.ok) {
            alert(window.i18n.translations[currentLang].alert_limit_updated || "Limit updated!");
            loadBudgetData();
        } else {
            alert(window.i18n.translations[currentLang].alert_error);
        }
    } catch (error) {
        console.error("Budget update error:", error);
    }
}

async function updatePassword(e) {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const password = document.getElementById('settings-password').value;
    const currentLang = localStorage.getItem('language') || 'uz';

    if (!password) {
        alert(window.i18n.translations[currentLang].alert_enter_password || "Enter password");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
            alert(window.i18n.translations[currentLang].alert_pass_updated || "Password updated!");
            document.getElementById('settings-password').value = '';
        } else {
            alert(window.i18n.translations[currentLang].alert_error);
        }
    } catch (error) {
        console.error("Password update error:", error);
    }
}

export function loadAvatarForWholeApp() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        const avatar = localStorage.getItem(`profileImage_${userId}`);
        updatePageAvatar(avatar);
    } catch (e) {}
}

window.addEventListener('languageChanged', () => {
    loadUserData();
    loadBudgetData();
});
