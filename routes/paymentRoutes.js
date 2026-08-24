import express from 'express';
import { 
    checkout, 
    paymentVerification,
    razorpayWebhook 
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/checkout', protect, checkout);
router.post('/verify', protect, paymentVerification);

// ✅ Razorpay Webhook Route (Isme 'protect' nahi lagta kyunki Razorpay server hit karega)
router.post('/webhook', razorpayWebhook);

router.get('/success', (req, res) => {
    res.redirect(`${FRONTEND_URL}/payment-success`);
});

router.get('/failure', (req, res) => {
    res.redirect(`${FRONTEND_URL}/payment-failure`);
});

export default router;