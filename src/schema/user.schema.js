import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

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
    },
    resetPasswordToken: {
        type:String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    versionKey: false,
    timestamps: true
});

// INSTANCE METHODLAR
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default model('User', userSchema);
