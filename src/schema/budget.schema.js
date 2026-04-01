import {model, Schema} from 'mongoose';

const budgetSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min:1,
        max:12
    }, 
    year: {
        type: Number,
        required: true
    },
    totalBudget: {
        type: Number,
        required: true
    },
    spentAmount: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false,
    timestamps: true
})

export default model('Budget', budgetSchema)