# ExpenseWise 💸 - Moliyaviy Nazorat Platformasi

ExpenseWise — bu shaxsiy xarajatlarni kuzatib borish, moliyaviy maqsadlarni belgilash va oylik hisobotlarni tahlil qilish uchun mo'ljallangan zamonaviy web-ilova.

## 📸 Skrinshotlar

<div align="center">
  <p><b>Asosiy sahifa (Landing Page)</b></p>
  <img src="screenshots/landing.png" width="90%" />
  <br><br>
  <p><b>Ro'yxatdan o'tish</b></p>
  <img src="screenshots/register.png" width="90%" />
  <br><br>
  <p><b>Tizimga kirish (Login)</b></p>
  <img src="screenshots/login.png" width="90%" />
  <br><br>
  <p><b>Parolni unutdim</b></p>
  <img src="screenshots/forgot-password.png" width="90%" />
  <br><br>
  <p><b>Parolni tiklash</b></p>
  <img src="screenshots/reset-password.png" width="90%" />
  <br><br>
  <p><b>Dashboard</b></p>
  <img src="screenshots/dashboard.png" width="90%" />
  <br><br>
  <p><b>Xarajat qo'shish</b></p>
  <img src="screenshots/add-expense.png" width="90%" />
  <br><br>
  <p><b>Xarajatlar ro'yxati</b></p>
  <img src="screenshots/expense.png" width="90%" />
  <br><br>
  <p><b>Kategoriyalar</b></p>
  <img src="screenshots/category.png" width="90%" />
  <br><br>
  <p><b>Yangi kategoriya qo'shish</b></p>
  <img src="screenshots/new_category.png" width="90%" />
  <br><br>
  <p><b>Hisobotlar</b></p>
  <img src="screenshots/reports.png" width="90%" />
  <br><br>
  <p><b>Hisobotlar tahlili</b></p>
  <img src="screenshots/reports_analyz.png" width="90%" />
  <br><br>
  <p><b>Sozlamalar</b></p>
  <img src="screenshots/settings.png" width="90%" />
</div>

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
