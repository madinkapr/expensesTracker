import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    defaultCurrency: { 
        type: String, 
        required: true,
        default: 'UZS',
        enum: ['UZS', 'USD', 'KRW', 'EUR']
    }
}, {
    versionKey: false,
    timestamps: true
});

export default model('User', userSchema);
