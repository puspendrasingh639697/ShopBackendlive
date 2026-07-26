// import express from 'express';
// import { checkout, paymentVerification } from '../controllers/paymentController.js';
// import { protect } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Pehle user login check hoga (protect), fir checkout hoga
// router.post('/checkout', protect, checkout);
// router.post('/verify', protect, paymentVerification);

// export default router;


// backend/routes/paymentRoutes.js

import express from 'express';
import { 
    checkout, 
    paymentVerification,
    paymentFailure 
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ User Routes (Protected)
router.post('/checkout', protect, checkout);
router.post('/verify', protect, paymentVerification);

// ✅ Easebuzz Callback Routes (No Auth - Easebuzz se aayega)
router.post('/easebuzz/callback', paymentVerification);
router.post('/easebuzz/failure', paymentFailure);

// ✅ Payment Success/Failure (Frontend redirect)
router.get('/success', (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com'}/payment-success`);
});

router.get('/failure', (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com'}/payment-failure`);
});

export default router;