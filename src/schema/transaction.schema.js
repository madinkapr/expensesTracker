import { model, Schema } from 'mongoose';

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
        required: true 
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
        required: true 
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

export default model('Transaction', transactionSchema);