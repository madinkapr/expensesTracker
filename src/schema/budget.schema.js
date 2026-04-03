import { model, Schema } from 'mongoose';

const budgetSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    totalBudget: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value > 0;
            },
            message: 'Budget must be greater than 0'
        }
    },
    spentAmount: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: 'Spent amount cannot be negative'
        }
    }
}, {
    versionKey: false,
    timestamps: true
})

// INDEXLAR
budgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true })

// INSTANCE METHODLAR
// Budjet holati
budgetSchema.methods.getRemaining = function () {
    return this.totalBudget - this.spentAmount
};

budgetSchema.methods.getSpentPercentage = function() {
    if (this.totalBudget === 0) return 0;
    return (this.spentAmount / this.totalBudget) * 100;
};

budgetSchema.methods.isOverBudget = function() {
    return this.spentAmount > this.totalBudget;
};

//STATIC METHODLAR
// Joriy oy budjetini olish
budgetSchema.statics.getCurrentBudget = async function(userId) {
    const now = new Date();
    return this.findOne({
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear()
    });
};


export default model('Budget', budgetSchema)