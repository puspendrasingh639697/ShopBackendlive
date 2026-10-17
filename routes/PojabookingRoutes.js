


// // import express from "express";
// // import {
// //   getallpooja,
// //   poojaDetailsByName,
// //   createPooja,
// //   getPoojaById,
// // } from "../controllers/PoojaController.js";
// // import {
// //   createBooking,
// //   getMyBookings,
// //   getBookingById,
// //   cancelBooking,
// // } from "../controllers/BookPoojaController.js";
// // import {
// //   createPoojaCheckout,
// //   verifyPoojaPayment,
// // } from "../controllers/poojaPaymentController.js";

// // import { BookPoojaValidation } from "../middleware/validationMiddleware.js";
// // import { protect, adminOnly } from "../middleware/authMiddleware.js";
// // import upload from "../middleware/uploadMiddleware.js";

// // const router = express.Router();

// // // ─── Public ───
// // router.get("/allpooja", getallpooja);
// // router.get("/name/:PujaName", poojaDetailsByName);

// // // ─── Protected ───
// // router.post("/bookpooja", protect, BookPoojaValidation, createBooking);
// // router.get("/mybookings", protect, getMyBookings);           // ⭐ ye
// // router.get("/booking/:id", protect, getBookingById);
// // router.put("/booking/:id/cancel", protect, cancelBooking);
// // router.post("/create-checkout", protect, createPoojaCheckout);
// // router.post("/verify-payment", protect, verifyPoojaPayment);

// // // ─── Admin ───
// // router.post(
// //   "/createpooja",
// //   protect,
// //   adminOnly,
// //   upload.single("image"),
// //   createPooja
// // );

// // // ─── Dynamic (SABSE LAST) ───
// // router.get("/:id", getPoojaById);

// // export default router;


// import express from "express";
// import {
//   getallpooja,
//   poojaDetailsByName,
//   createPooja,
//   getPoojaById,
//   updatePooja,   // ✅ NAYA ADD
//   deletePooja,   // ✅ NAYA ADD
// } from "../controllers/PoojaController.js";
// import {
//   createBooking,
//   getMyBookings,
//   getBookingById,
//   cancelBooking,
//     getAllBookings,
// } from "../controllers/BookPoojaController.js";
// import {
//   createPoojaCheckout,
//   verifyPoojaPayment,
// } from "../controllers/poojaPaymentController.js";

// import { BookPoojaValidation } from "../middleware/validationMiddleware.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js";
// import upload from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// // ─── Public ───
// router.get("/allpooja", getallpooja);
// router.get("/name/:PujaName", poojaDetailsByName);

// // ─── Protected ───
// router.post("/bookpooja", protect, BookPoojaValidation, createBooking);
// router.get("/mybookings", protect, getMyBookings);
// router.get("/booking/:id", protect, getBookingById);
// router.put("/booking/:id/cancel", protect, cancelBooking);
// router.post("/create-checkout", protect, createPoojaCheckout);
// router.post("/verify-payment", protect, verifyPoojaPayment);

// // ─── Admin ───
// router.post(
//   "/createpooja",
//   protect,
//   adminOnly,
//   upload.single("image"),
//   createPooja
// );

// // ✅ NAYE ROUTES — Update aur Delete
// router.put(
//   "/:id",
//   protect,
//   adminOnly,
//   upload.single("image"),
//   updatePooja
// );

// router.delete("/:id", protect, adminOnly, deletePooja);

// // ─── Dynamic (SABSE LAST) ───
// router.get("/:id", getPoojaById);
// // ✅ NAYA — Saari Pooja Bookings (Admin)
// router.get("/admin/allbookings", protect, adminOnly, getAllBookings);

// export default router;


import express from "express";
import {
  getallpooja,
  poojaDetailsByName,
  createPooja,
  getPoojaById,
  updatePooja,
  deletePooja,
} from "../controllers/PoojaController.js";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,   // ✅ NAYA ADD
} from "../controllers/BookPoojaController.js";
import {
  createPoojaCheckout,
  verifyPoojaPayment,
} from "../controllers/poojaPaymentController.js";

import { BookPoojaValidation } from "../middleware/validationMiddleware.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ─── Public ───
router.get("/allpooja", getallpooja);
router.get("/name/:PujaName", poojaDetailsByName);

// ─── Protected ───
router.post("/bookpooja", protect, BookPoojaValidation, createBooking);
router.get("/mybookings", protect, getMyBookings);
router.get("/booking/:id", protect, getBookingById);
router.put("/booking/:id/cancel", protect, cancelBooking);
router.post("/create-checkout", protect, createPoojaCheckout);
router.post("/verify-payment", protect, verifyPoojaPayment);

// ─── Admin ───
router.post(
  "/createpooja",
  protect,
  adminOnly,
  upload.single("image"),
  createPooja
);

// ✅ NAYA — Saari Pooja Bookings (Admin)
router.get("/admin/allbookings", protect, adminOnly, getAllBookings);

// ✅ Update aur Delete
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updatePooja
);

router.delete("/:id", protect, adminOnly, deletePooja);

// ─── Dynamic (SABSE LAST) ───
router.get("/:id", getPoojaById);

export default router;