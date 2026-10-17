// // import express from "express";
// // import {
// //   getAllChadhava,
// //   getChadhavaById,
// //   getChadhavaBySlug,
// //   createChadhava,
// //   updateChadhava,
// //   deleteChadhava,
// //   getChadhavaSlots,
// // } from "../controllers/ChadhavaController.js";
// // import {
// //   createChadhavaBooking,
// //   getMyChadhavaBookings,
// //   getChadhavaBookingById,
// //   cancelChadhavaBooking,
// // } from "../controllers/ChadhavaBookingController.js";
// // import {
// //   createChadhavaCheckout,
// //   verifyChadhavaPayment,
// // } from "../controllers/ChadhavaPaymentController.js";

// // import { protect, adminOnly } from "../middleware/authMiddleware.js";
// // import upload from "../middleware/uploadMiddleware.js";   // ⭐ ADD

// // const router = express.Router();

// // // ═══════════════════════════════════════
// // //   PUBLIC ROUTES
// // // ═══════════════════════════════════════
// // router.get("/", getAllChadhava);
// // router.get("/slug/:slug", getChadhavaBySlug);
// // router.get("/:id/slots", getChadhavaSlots);

// // // ═══════════════════════════════════════
// // //   PROTECTED ROUTES (User)
// // // ═══════════════════════════════════════
// // router.post("/book", protect, createChadhavaBooking);
// // router.get("/mybookings", protect, getMyChadhavaBookings);
// // router.get("/booking/:id", protect, getChadhavaBookingById);
// // router.put("/booking/:id/cancel", protect, cancelChadhavaBooking);

// // // ═══════════════════════════════════════
// // //   PAYMENT ROUTES
// // // ═══════════════════════════════════════
// // router.post("/create-checkout", protect, createChadhavaCheckout);
// // router.post("/verify-payment", protect, verifyChadhavaPayment);

// // // ═══════════════════════════════════════
// // //   ADMIN ROUTES (with multer for image)
// // // ═══════════════════════════════════════
// // router.post(
// //   "/create",
// //   protect,
// //   adminOnly,
// //   upload.single("image"),      // ⭐ Image upload
// //   createChadhava
// // );

// // router.put(
// //   "/:id",
// //   protect,
// //   adminOnly,
// //   upload.single("image"),      // ⭐ Image upload
// //   updateChadhava
// // );

// // router.delete("/:id", protect, adminOnly, deleteChadhava);

// // // ⚠️ Dynamic route SABSE LAST
// // router.get("/:id", getChadhavaById);

// // export default router;


// import express from "express";
// import {
//   getAllChadhava,
//   getChadhavaById,
//   getChadhavaBySlug,
//   createChadhava,
//   updateChadhava,
//   deleteChadhava,
//   getChadhavaSlots,
// } from "../controllers/ChadhavaController.js";
// import {
//   createChadhavaBooking,
//   getMyChadhavaBookings,
//   getChadhavaBookingById,
//   cancelChadhavaBooking,
//   getAllChadhavaBookings,   // ✅ NAYA ADD
// } from "../controllers/ChadhavaBookingController.js";
// import {
//   createChadhavaCheckout,
//   verifyChadhavaPayment,
// } from "../controllers/ChadhavaPaymentController.js";

// import { protect, adminOnly } from "../middleware/authMiddleware.js";
// import upload from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// // ═══════════════════════════════════════
// //   PUBLIC ROUTES
// // ═══════════════════════════════════════
// router.get("/", getAllChadhava);
// router.get("/slug/:slug", getChadhavaBySlug);
// router.get("/:id/slots", getChadhavaSlots);

// // ═══════════════════════════════════════
// //   PROTECTED ROUTES (User)
// // ═══════════════════════════════════════
// router.post("/book", protect, createChadhavaBooking);
// router.get("/mybookings", protect, getMyChadhavaBookings);
// router.get("/booking/:id", protect, getChadhavaBookingById);
// router.put("/booking/:id/cancel", protect, cancelChadhavaBooking);

// // ═══════════════════════════════════════
// //   PAYMENT ROUTES
// // ═══════════════════════════════════════
// router.post("/create-checkout", protect, createChadhavaCheckout);
// router.post("/verify-payment", protect, verifyChadhavaPayment);

// // ═══════════════════════════════════════
// //   ✅ ADMIN — ALL BOOKINGS
// //   ⚠️ Ye `/:id` se PEHLE hona chahiye!
// // ═══════════════════════════════════════
// router.get(
//   "/admin/allbookings",
//   protect,
//   adminOnly,
//   getAllChadhavaBookings
// );

// // ═══════════════════════════════════════
// //   ADMIN ROUTES (with multer)
// // ═══════════════════════════════════════
// router.post(
//   "/create",
//   protect,
//   adminOnly,
//   upload.single("image"),
//   createChadhava
// );

// router.put(
//   "/:id",
//   protect,
//   adminOnly,
//   upload.single("image"),
//   updateChadhava
// );

// router.delete("/:id", protect, adminOnly, deleteChadhava);

// // ⚠️ Dynamic route SABSE LAST
// router.get("/:id", getChadhavaById);

// export default router;


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
  getAllChadhavaBookings,
  updateChadhavaBookingStatus,      // ✅ NAYA
  updateChadhavaPaymentStatus,      // ✅ NAYA
  adminCancelChadhavaBooking,       // ✅ NAYA
} from "../controllers/ChadhavaBookingController.js";
import {
  createChadhavaCheckout,
  verifyChadhavaPayment,
} from "../controllers/ChadhavaPaymentController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

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
//   ✅ ADMIN — ALL BOOKINGS & ACTIONS
//   ⚠️ Ye `/:id` se PEHLE hone chahiye!
// ═══════════════════════════════════════
router.get(
  "/admin/allbookings",
  protect,
  adminOnly,
  getAllChadhavaBookings
);

// ✅ NAYA — Status Update
router.put(
  "/admin/booking/:id/status",
  protect,
  adminOnly,
  updateChadhavaBookingStatus
);

// ✅ NAYA — Payment Update
router.put(
  "/admin/booking/:id/payment",
  protect,
  adminOnly,
  updateChadhavaPaymentStatus
);

// ✅ NAYA — Admin Cancel
router.put(
  "/admin/booking/:id/cancel",
  protect,
  adminOnly,
  adminCancelChadhavaBooking
);

// ═══════════════════════════════════════
//   ADMIN ROUTES (with multer)
// ═══════════════════════════════════════
router.post(
  "/create",
  protect,
  adminOnly,
  upload.single("image"),
  createChadhava
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateChadhava
);

router.delete("/:id", protect, adminOnly, deleteChadhava);

// ⚠️ Dynamic route SABSE LAST
router.get("/:id", getChadhavaById);

export default router;