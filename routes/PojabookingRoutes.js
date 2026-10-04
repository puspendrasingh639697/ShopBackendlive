// // // // import express from "express";
// // // // import {
// // // //   getallpooja,
// // // //   poojaDetailsByName,
// // // //   createPooja,
// // // //   getPoojaById,
// // // // } from "../controllers/PoojaController.js";
// // // // import { createBooking } from "../controllers/BookPoojaController.js";
// // // // import { GetBookPooja } from "../controllers/GetBookPoojaController.js";
// // // // import {
// // // //   createPoojaCheckout,
// // // //   verifyPoojaPayment,
// // // // } from "../controllers/poojaPaymentController.js";

// // // // import { BookPoojaValidation } from "../middleware/validationMiddleware.js";
// // // // import { protect, adminOnly } from "../middleware/authMiddleware.js";   // ⭐ CHANGE
// // // // import upload from "../middleware/uploadMiddleware.js";

// // // // const router = express.Router();

// // // // // ─── Public ───
// // // // router.get("/allpooja", getallpooja);
// // // // router.get("/name/:PujaName", poojaDetailsByName);

// // // // // ─── Protected (login zaroori) ───
// // // // router.post("/bookpooja", protect, BookPoojaValidation, createBooking);
// // // // router.get("/mybookings", protect, GetBookPooja);
// // // // router.post("/create-checkout", protect, createPoojaCheckout);
// // // // router.post("/verify-payment", protect, verifyPoojaPayment);

// // // // // ─── Admin ───
// // // // router.post("/createpooja", protect, adminOnly, upload.single("image"), createPooja);

// // // // // ─── Dynamic (SABSE LAST) ───
// // // // router.get("/:id", getPoojaById);

// // // // export default router;


// // // import express from "express";
// // // import {
// // //   getallpooja,
// // //   poojaDetailsByName,
// // //   createPooja,
// // //   getPoojaById,
// // // } from "../controllers/PoojaController.js";
// // // import {
// // //   createBooking,
// // //   getMyBookings,
// // //   getBookingById,
// // //   cancelBooking,
// // // } from "../controllers/BookPoojaController.js";
// // // import { GetBookPooja } from "../controllers/GetBookPoojaController.js";
// // // import {
// // //   createPoojaCheckout,
// // //   verifyPoojaPayment,
// // // } from "../controllers/poojaPaymentController.js";

// // // import { BookPoojaValidation } from "../middleware/validationMiddleware.js";
// // // import { protect, adminOnly } from "../middleware/authMiddleware.js";
// // // import upload from "../middleware/uploadMiddleware.js";

// // // const router = express.Router();

// // // // ─── Public ───
// // // router.get("/allpooja", getallpooja);
// // // router.get("/name/:PujaName", poojaDetailsByName);

// // // // ─── Protected (login zaroori) ───
// // // router.post("/bookpooja", protect, BookPoojaValidation, createBooking);
// // // router.get("/mybookings", protect, getMyBookings);

// // // // ⭐ Booking specific routes
// // // router.get("/booking/:id", protect, getBookingById);
// // // router.put("/booking/:id/cancel", protect, cancelBooking);

// // // router.post("/create-checkout", protect, createPoojaCheckout);
// // // router.post("/verify-payment", protect, verifyPoojaPayment);

// // // // ─── Admin ───
// // // router.post(
// // //   "/createpooja",
// // //   protect,
// // //   adminOnly,
// // //   upload.single("image"),
// // //   createPooja
// // // );

// // // // ─── Dynamic (SABSE LAST) ───
// // // router.get("/:id", getPoojaById);

// // // export default router;


// // import express from "express";
// // import {
// //   getallpooja,
// //   poojaDetailsByName,
// //   createPooja,
// //   getPoojaById,
// // } from "../controllers/PoojaController.js";
// // import { createBooking } from "../controllers/BookPoojaController.js";
// // import { GetBookPooja } from "../controllers/GetBookPoojaController.js";
// // import {
// //   createPoojaCheckout,
// //   verifyPoojaPayment,
// // } from "../controllers/poojaPaymentController.js";

// // import { BookPoojaValidation } from "../middleware/validationMiddleware.js";
// // import { protect, adminOnly } from "../middleware/authMiddleware.js";
// // import upload from "../middleware/uploadMiddleware.js";

// // const router = express.Router();

// // router.get("/allpooja", getallpooja);
// // router.get("/name/:PujaName", poojaDetailsByName);

// // router.post("/bookpooja", protect, BookPoojaValidation, createBooking);
// // router.get("/mybookings", protect, GetBookPooja);
// // router.post("/create-checkout", protect, createPoojaCheckout);
// // router.post("/verify-payment", protect, verifyPoojaPayment);

// // router.post(
// //   "/createpooja",
// //   protect,
// //   adminOnly,
// //   upload.single("image"),
// //   createPooja
// // );

// // router.get("/:id", getPoojaById);

// // export default router;


// import express from "express";
// import {
//   getallpooja,
//   poojaDetailsByName,
//   createPooja,
//   getPoojaById,
// } from "../controllers/PoojaController.js";
// import {
//   createBooking,
//   getBookingById,       // ⭐ ye
//   cancelBooking,        // ⭐ ye
// } from "../controllers/BookPoojaController.js";
// import { GetBookPooja } from "../controllers/GetBookPoojaController.js";
// import {
//   createPoojaCheckout,
//   verifyPoojaPayment,
// } from "../controllers/poojaPaymentController.js";

// import { BookPoojaValidation } from "../middleware/validationMiddleware.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js";
// import upload from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// router.get("/allpooja", getallpooja);
// router.get("/name/:PujaName", poojaDetailsByName);

// router.post("/bookpooja", protect, BookPoojaValidation, createBooking);
// router.get("/mybookings", protect, GetBookPooja);

// // ⭐ Ye 2 lines ZAROORI hain
// router.get("/booking/:id", protect, getBookingById);
// router.put("/booking/:id/cancel", protect, cancelBooking);

// router.post("/create-checkout", protect, createPoojaCheckout);
// router.post("/verify-payment", protect, verifyPoojaPayment);

// router.post(
//   "/createpooja",
//   protect,
//   adminOnly,
//   upload.single("image"),
//   createPooja
// );

// router.get("/:id", getPoojaById);

// export default router;


import express from "express";
import {
  getallpooja,
  poojaDetailsByName,
  createPooja,
  getPoojaById,
} from "../controllers/PoojaController.js";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
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
router.get("/mybookings", protect, getMyBookings);           // ⭐ ye
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

// ─── Dynamic (SABSE LAST) ───
router.get("/:id", getPoojaById);

export default router;