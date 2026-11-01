// routes/navigationRoutes.js
import express from 'express';
import {
  getNavigationForBooking,
  getNavigationForPuja,
  getNavigationForChadhava,
  getNavigationForTemple
} from '../controllers/navigationController.js';

// ✅ Auth middleware (aapke project se confirm)
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
//   NAVIGATION ROUTES
// ═══════════════════════════════════════════════════════════

// 1. Booking ke baad mandir ka lat/lng (login required)
// GET /api/navigation/booking/:bookingId
router.get('/booking/:bookingId', protect, getNavigationForBooking);

// 2. Direct puja → lat/lng (public — booking ke bina bhi)
// GET /api/navigation/puja/:pujaId
router.get('/puja/:pujaId', getNavigationForPuja);

// 3. Direct chadhava → lat/lng (public)
// GET /api/navigation/chadhava/:chadhavaId
router.get('/chadhava/:chadhavaId', getNavigationForChadhava);

// 4. Direct temple → lat/lng (public)
// GET /api/navigation/temple/:templeId
router.get('/temple/:templeId', getNavigationForTemple);

export default router;