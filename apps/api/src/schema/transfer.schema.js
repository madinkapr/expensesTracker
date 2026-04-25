import {model, Schema} from 'mongoose';

const transferSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromAccountId:{
        type: Schema.Types.ObjectId,
        ref:'Account',
        required: true
    },
    toAccountId:{
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    note: {
        type: String
    }
}, {
    versionKey: false,
    timestamps: true
})

// INDEXLAR
transferSchema.index({ userId: 1 });
transferSchema.index({ userId: 1, date: -1 });

export default model('Transfer', transferSchema)