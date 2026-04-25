import mongoose from 'mongoose';
import Category from '../src/schema/category.schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env faylini bir qadam tepadan qidirish
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ExpensesTracker';
        await mongoose.connect(mongoUri);
        console.log('✅ DB ulandi');

        const defaults = [
            { name: 'Oziq-ovqat', icon: '🍔', color: '#F44336', isDefault: true, type: 'expense' },
            { name: 'Transport', icon: '🚗', color: '#2196F3', isDefault: true, type: 'expense' },
            { name: 'Ijara', icon: '🏠', color: '#9C27B0', isDefault: true, type: 'expense' },
            { name: 'Ko\'ngilochar', icon: '🎬', color: '#FFEB3B', isDefault: true, type: 'expense' },
            { name: 'Maosh', icon: '💰', color: '#4CAF50', isDefault: true, type: 'income' },
            { name: 'Boshqa', icon: '📦', color: '#9E9E9E', isDefault: true, type: 'expense' }
        ];

        for (const c of defaults) {
            await Category.findOneAndUpdate(
                { name: c.name, isDefault: true },
                c,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Standart kategoriyalar tayyor!');
    } catch (err) {
        console.error('❌ Xato:', err.message);
    } finally {
        process.exit(0);
    }
}

seed();
