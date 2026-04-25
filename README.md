# ExpenseWise 💸 - Moliyaviy Nazorat Platformasi

ExpenseWise — bu shaxsiy xarajatlarni kuzatib borish, moliyaviy maqsadlarni belgilash va oylik hisobotlarni tahlil qilish uchun mo'ljallangan zamonaviy web-ilova.

## ✨ Imkoniyatlar

- 🔐 **To'liq Autentifikatsiya**: Ro'yxatdan o'tish, tizimga kirish va parolni email orqali tiklash.
- 📊 **Interaktiv Dashboard**: Xarajatlar statistikasi, haftalik dinamika va oylik limit nazorati.
- 💸 **Xarajatlar Boshqaruvi**: Xarajatlarni qo'shish, o'chirish va kategoriyalar bo'yicha filtrlash.
- 📈 **Chuqur Analitika**: Eng ko'p sarf qilinayotgan kategoriyalar va kunlik o'sish grafiklari.
- ⚙️ **Shaxsiy Sozlamalar**: Profil ma'lumotlarini tahrirlash, parolni o'zgartirish va oylik budjet limitini o'rnatish.
- 🌗 **Dark Mode**: Ko'zga qulay qorong'u va yorug' rejimlar.
- 📱 **Responsive Design**: Mobil qurilmalar, planshet va kompyuterlar uchun to'liq moslashgan interfeys.

## 🛠 Texnologiyalar

**Frontend:**
- HTML5, Vanilla CSS3 (Glassmorphism design)
- JavaScript (ES6+)
- [Chart.js](https://www.chartjs.org/) - Grafika va diagrammalar uchun
- [Vite](https://vitejs.dev/) - Tezkor yig'uvchi (Bundler)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/) (JSON Web Tokens) - Xavfsizlik uchun
- [Nodemailer](https://nodemailer.com/) - Email xabarlari uchun

## 🚀 O'rnatish va Ishga tushirish

### 1. Loyihani klonlash
```bash
git clone https://github.com/username/expenses-tracker.git
cd expenses-tracker
```

### 2. Bog'liqliklarni o'rnatish
Loyiha `pnpm` monorepo asosida qurilgan:
```bash
pnpm install
```

### 3. Muhit o'zgaruvchilarini sozlash (.env)
`apps/api` papkasi ichida `.env` faylini yarating va quyidagilarni to'ldiring:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ExpensesTracker
JWT_SECRET=sizning_maxfiy_kalitingiz
EMAIL_USER=sizning_emailingiz@gmail.com
EMAIL_PASS=sizning_app_passwordingiz
```

### 4. Loyihani ishga tushirish
Ikkala qismni (Frontend va API) bir vaqtda ishga tushirish:
```bash
pnpm dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

## 📂 Loyiha Strukturasi

- `apps/web`: Frontend qismi (HTML, CSS, JS).
- `apps/api`: Backend qismi (Node.js API).
- `packages/`: Umumiy paketlar va utilitalar (agar mavjud bo'lsa).

## 🔒 Xavfsizlik
Barcha parollar `bcrypt` orqali hashlangan holda saqlanadi. Foydalanuvchi sessiyalari JWT tokenlar orqali himoyalangan.

---
Yaratuvchi: **Madinabonu Primova** 🦾
