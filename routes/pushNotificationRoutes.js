import express from 'express';
import {
  saveFCMToken,
  sendPushNotification,
  getAllFCMTokens,
} from '../controllers/pushNotificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════
//  USER ROUTES
// ═══════════════════════════════════════

// ✅ Save FCM token
router.post('/save-token', saveFCMToken);

// ═══════════════════════════════════════
//  ADMIN ROUTES
// ═══════════════════════════════════════

// ✅ Send push notification
router.post('/admin/send', protect, adminOnly, sendPushNotification);

// ✅ Get all FCM tokens
router.get('/admin/tokens', protect, adminOnly, getAllFCMTokens);

export default router;