import express from 'express';
import { createBooking } from '../controllers/BookPoojaController.js';
import { protect } from '../middleware/authMiddleware.js'; // 👈 Yahan curly braces use karein

const router = express.Router();

// Protected booking route
router.post('/bookpooja', protect, createBooking);

export default router;