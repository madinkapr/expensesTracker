import { model, Schema, Types } from 'mongoose';

const accountSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['cash', 'bank_card', 'bank_account', 'savings', 'other'],
        required: true,
        default: 'cash'
    },
    currency: {
        type: String,
        required: true,
        default: 'UZS'
    },
    initialBalance: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: 'Initial balance cannot be negative'
        }
    },
    currentBalance: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    versionKey: false,
    timestamps: true
});

// INDEXLAR
accountSchema.index({ userId: 1 });

// INSTANCE METHODLAR

// Balans yangilash
accountSchema.methods.updateBalance = function(amount) {
    this.currentBalance += amount;
    return this.save();
};
// Hisob turi tekshirish
accountSchema.methods.isCash = function() {
    return this.type === 'cash';
};

accountSchema.methods.isBankCard = function() {
    return this.type === 'bank_card';
};

//STATIC METHODLAR
// User barcha hisoblarining jami balansi
accountSchema.statics.getTotalBalance = async function(userId) {
    const result = await this.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$currentBalance' } } }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
};

export default model('Account', accountSchema);