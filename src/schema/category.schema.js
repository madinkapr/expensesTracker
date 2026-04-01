import { Schema, model } from "mongoose";

const categorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { 
        type: String, 
        required: true 
    },
    color: {
        type: String
    },
    icon : {
        type: String
    }, 
    type: {
        type: String,
        enum: ['expense', 'income'],
        required: true
    },
    isDefault: {
        type: Boolean, 
        default: false
    }
}, {
    versionKey: false,
    timestamps: true
})

export default model('Category', categorySchema)