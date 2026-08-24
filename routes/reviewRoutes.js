import express from 'express';
import { addReview, getReviewsByTarget, deleteReview } from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get reviews for a product/astrologer
router.get('/:targetId', getReviewsByTarget);

// Protected routes (Customer, Astrologer, Admin can add review)
router.post('/add', protect, restrictTo('user', 'customer', 'astrologer', 'admin', 'super_admin'), addReview);

// Delete review route
router.delete('/:id', protect, deleteReview);

export default router;