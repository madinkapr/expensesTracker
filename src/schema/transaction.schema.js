import { model, Schema, Types } from 'mongoose';

const transactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['expense', 'income', 'transfer'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value <= new Date();
            },
            message: 'Date cannot be in the future'
        }
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    amount: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value > 0;
            },
            message: 'Amount must be greater than 0'
        }
    },
    note: {
        type: String
    },
    cleared: {
        type: Boolean,
        default: false
    },
}, {
    versionKey: false,
    timestamps: true
});

// INDEXLAR
transactionSchema.index({ userId: 1 });
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1 });

// INSTANCE METHODLAR
// Transaction turi aniqlash
transactionSchema.methods.isExpense = function(){
    return this.type === 'expense';
};

transactionSchema.methods.isIncome = function(){
    return this.type === 'income';
};

transactionSchema.methods.isTransfer = function() {
    return this.type === 'transfer';
};

// STATIC METHODLAR

// Oylik jami xarajat
transactionSchema.statics.getMonthlyTotal = async function(userId, year, month){
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.aggregate([
        {
            $match: {
                userId: new Types.ObjectId(userId),
                type: 'expense',
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ])
    return result.length > 0 ? result[0].total : 0;
}

// Kategoriya bo'yicha statistika (Pie Chart uchun)
transactionSchema.statics.getCategoryBreakdown = async function(userId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    return this.aggregate([
        {
            $match: {
                userId: new Types.ObjectId(userId),
                type: 'expense',
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$categoryId',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }
    ]);
};

export default model('Transaction', transactionSchema);