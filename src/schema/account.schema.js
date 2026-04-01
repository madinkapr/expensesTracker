import { model, Schema } from 'mongoose';

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
        default: 0
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

export default model('Account', accountSchema);