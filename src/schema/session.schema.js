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

// INSTANCE METHODLAR
sessionSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

// INDEXLAR
sessionSchema.index({ userId: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('Session', sessionSchema)