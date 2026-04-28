import { Schema, model } from "mongoose";

const categorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    color: {
        type: String
    },
    icon: {
        type: String
    },
    type: {
        type: String,
        enum: ['expense', 'income'],
        required: true
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
        default: null
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true
})

// INDEXLAR
categorySchema.index({ userId: 1, type: 1 })

export default model('Category', categorySchema)