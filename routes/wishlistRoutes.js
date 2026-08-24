import express from 'express';
import { getWishlist, toggleWishlist, removeFromWishlist } from '../controllers/wishlistController.js'; //removeFromWishlist import karein
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getWishlist).post(protect, toggleWishlist);

// Yeh line add karein DELETE ke liye:
router.route('/:id').delete(protect, removeFromWishlist);

export default router;