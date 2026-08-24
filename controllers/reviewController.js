import Review from '../models/Review.js';

// ✅ 1. Add or Update Review
export const addReview = async (req, res) => {
    try {
        const { targetId, targetModel, rating, comment } = req.body;
        const userId = req.user._id;

        if (!targetId || !targetModel || !rating || !comment) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check if user already reviewed this item, if yes, update it or throw error
        let review = await Review.findOne({ user: userId, targetId });

        if (review) {
            review.rating = rating;
            review.comment = comment;
            await review.save();
            return res.status(200).json({
                success: true,
                message: 'Review updated successfully',
                review
            });
        }

        // Create new review
        review = await Review.create({
            user: userId,
            targetId,
            targetModel,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 2. Get Reviews for a Specific Target (Product/Astrologer)
export const getReviewsByTarget = async (req, res) => {
    try {
        const { targetId } = req.params;

        const reviews = await Review.find({ targetId })
            .populate('user', 'name profilePic') // Review dene wale ka naam aur photo dikhane ke liye
            .sort({ createdAt: -1 });

        // Calculate Average Rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
            averageRating = (sum / reviews.length).toFixed(1);
        }

        res.status(200).json({
            success: true,
            count: reviews.length,
            averageRating,
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 3. Delete Review (User can delete their own, or Admin can delete any)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Check if user is owner of the review or an admin/super_admin
        if (review.user.toString() !== req.user._id.toString() && !['admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};