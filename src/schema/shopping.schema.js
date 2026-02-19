import { model, Schema } from 'mongoose';

const shoppingSchema = new Schema({
    item: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    marketName: { type: String }
}, {
    versionKey: false,
    timestamps: true
})

export default model('Shopping', shoppingSchema);