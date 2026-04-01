import { model, Schema } from 'mongoose';

const sessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true
})

export default model('Session', sessionSchema)