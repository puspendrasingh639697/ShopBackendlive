import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Aap isko generic rakh sakte hain: targetId aur targetModel (Product/Astrologer)
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        required: true,
        enum: ['Product', 'Astrologer', 'Service'] // Jiske liye bhi review ho
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }
}, { timestamps: true });

// Ek user ek target par sirf ek hi review de sake (Optional restriction)
reviewSchema.index({ user: 1, targetId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;