import express from "express";
import {
  getAllChadhava,
  getChadhavaById,
  getChadhavaBySlug,
  createChadhava,
  updateChadhava,
  deleteChadhava,
  getChadhavaSlots,
} from "../controllers/ChadhavaController.js";
import {
  createChadhavaBooking,
  getMyChadhavaBookings,
  getChadhavaBookingById,
  cancelChadhavaBooking,
} from "../controllers/ChadhavaBookingController.js";
import {
  createChadhavaCheckout,
  verifyChadhavaPayment,
} from "../controllers/ChadhavaPaymentController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";   // ⭐ ADD

const router = express.Router();

// ═══════════════════════════════════════
//   PUBLIC ROUTES
// ═══════════════════════════════════════
router.get("/", getAllChadhava);
router.get("/slug/:slug", getChadhavaBySlug);
router.get("/:id/slots", getChadhavaSlots);

// ═══════════════════════════════════════
//   PROTECTED ROUTES (User)
// ═══════════════════════════════════════
router.post("/book", protect, createChadhavaBooking);
router.get("/mybookings", protect, getMyChadhavaBookings);
router.get("/booking/:id", protect, getChadhavaBookingById);
router.put("/booking/:id/cancel", protect, cancelChadhavaBooking);

// ═══════════════════════════════════════
//   PAYMENT ROUTES
// ═══════════════════════════════════════
router.post("/create-checkout", protect, createChadhavaCheckout);
router.post("/verify-payment", protect, verifyChadhavaPayment);

// ═══════════════════════════════════════
//   ADMIN ROUTES (with multer for image)
// ═══════════════════════════════════════
router.post(
  "/create",
  protect,
  adminOnly,
  upload.single("image"),      // ⭐ Image upload
  createChadhava
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),      // ⭐ Image upload
  updateChadhava
);

router.delete("/:id", protect, adminOnly, deleteChadhava);

// ⚠️ Dynamic route SABSE LAST
router.get("/:id", getChadhavaById);

export default router;