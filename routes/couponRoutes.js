import express from 'express';
import { 
    createCoupon, 
    bulkCreateCoupons, // ✅ 50K+ bulk generation support
    applyCoupon, 
    markCouponAsUsed,
    getAllCoupons,
    deleteCoupon,
    getUserVouchers,
    toggleCouponStatus
} from '../controllers/couponController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js'; // ✅ restrictTo import kiya

const router = express.Router();

// 🛒 Customer & Astrologer Routes
router.post('/apply', protect, restrictTo('user','customer', 'astrologer', 'admin', 'super_admin'), applyCoupon);
router.post('/mark-used', protect, restrictTo('user','customer', 'astrologer', 'admin', 'super_admin'), markCouponAsUsed);
router.get('/my-vouchers', protect, restrictTo('user','customer', 'astrologer', 'admin', 'super_admin'), getUserVouchers);

// 🛠️ Admin & Super Admin Routes (Coupon Management & Bulk Generation)
router.post('/create', protect, restrictTo('admin', 'super_admin'), createCoupon);
router.post('/bulk-create', protect, restrictTo('admin', 'super_admin'), bulkCreateCoupons); // ✅ Bulk coupons route
router.get('/admin/all', protect, restrictTo('admin', 'super_admin'), getAllCoupons);
router.delete('/admin/:id', protect, restrictTo('admin', 'super_admin'), deleteCoupon);
router.put('/admin/:id/toggle', protect, restrictTo('admin', 'super_admin'), toggleCouponStatus);

export default router;