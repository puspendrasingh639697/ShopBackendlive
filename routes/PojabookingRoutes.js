


// // // import express from "express";
// // // import { getallpooja, poojaDetailsByName, createPooja, getPoojaById } from "../controllers/PoojaController.js";
// // // import { GetBookPooja } from '../controllers/GetBookPoojaController.js';
// // // import { BookPoojaValidation } from '../middleware/validationMiddleware.js';
// // // import upload from '../middleware/uploadMiddleware.js';

// // // const router = express.Router();

// // // router.get('/allpooja', getallpooja);

// // // // ID wala route pehle rakhein
// // // router.get('/pooja/:id', getPoojaById);

// // // // Name wala route baad mein
// // // router.get('/pooja/name/:PujaName', poojaDetailsByName);

// // // router.post('/createpooja', upload.single('image'), createPooja);
// // // router.post('/bookpooja', BookPoojaValidation, GetBookPooja);

// // // export default router;


// // import express from "express";
// // import { getallpooja, poojaDetailsByName, createPooja, getPoojaById } from "../controllers/PoojaController.js";
// // // Yahan GetBookPooja ki jagah createBooking import karo jo BookPoojaController mein hai
// // import { createBooking } from '../controllers/BookPoojaController.js'; 
// // import { GetBookPooja } from '../controllers/GetBookPoojaController.js';
// // import { BookPoojaValidation } from '../middleware/validationMiddleware.js';
// // import upload from '../middleware/uploadMiddleware.js';

// // const router = express.Router();

// // router.get('/allpooja', getallpooja);

// // // ID wala route pehle rakhein
// // router.get('/pooja/:id', getPoojaById);

// // // Name wala route baad mein
// // router.get('/pooja/name/:PujaName', poojaDetailsByName);

// // router.post('/createpooja', upload.single('image'), createPooja);

// // // Booking ke liye createBooking controller use karo
// // router.post('/bookpooja', BookPoojaValidation, createBooking);

// // // Agar saari bookings dekhne ke liye GetBookPooja route chahiye toh alag se GET bana lo:
// // router.get('/mybookings', GetBookPooja);

// // export default router;


// import express from "express";
// import { getallpooja, poojaDetailsByName, createPooja, getPoojaById } from "../controllers/PoojaController.js";
// import { createBooking } from '../controllers/BookPoojaController.js'; 
// import { GetBookPooja } from '../controllers/GetBookPoojaController.js';
// // Payment controllers import karein
// import { createPoojaCheckout, verifyPoojaPayment } from '../controllers/poojaPaymentController.js';

// import { BookPoojaValidation } from '../middleware/validationMiddleware.js';
// import upload from '../middleware/uploadMiddleware.js';

// const router = express.Router();

// router.get('/allpooja', getallpooja);

// // ID wala route pehle rakhein
// router.get('/pooja/:id', getPoojaById);

// // Name wala route baad mein
// router.get('/pooja/name/:PujaName', poojaDetailsByName);

// router.post('/createpooja', upload.single('image'), createPooja);

// // 1. Booking initialize karne ke liye
// router.post('/bookpooja', BookPoojaValidation, createBooking);

// // 2. User ki bookings dekhne ke liye
// router.get('/mybookings', GetBookPooja);

// // 3. Razorpay Order Create karne ke liye (Checkout)
// router.post('/create-checkout', createPoojaCheckout);

// // 4. Payment verify aur booking confirm karne ke liye
// router.post('/verify-payment', verifyPoojaPayment);

// export default router;


import express from "express";
import { getallpooja, poojaDetailsByName, createPooja, getPoojaById } from "../controllers/PoojaController.js";
import { createBooking } from '../controllers/BookPoojaController.js'; 
import { GetBookPooja } from '../controllers/GetBookPoojaController.js';
import { createPoojaCheckout, verifyPoojaPayment } from '../controllers/poojaPaymentController.js';

import { BookPoojaValidation } from '../middleware/validationMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// 1. Static routes ko hamesha dynamic (:id) routes se upar rakhein taaki routing conflict na ho
router.get('/allpooja', getallpooja);

// 2. Name wala specific route
router.get('/pooja/name/:PujaName', poojaDetailsByName);

// 3. ID wala dynamic route sabse last mein
router.get('/pooja/:id', getPoojaById);

router.post('/createpooja', upload.single('image'), createPooja);

// 4. Booking aur payment ke routes
router.post('/bookpooja', BookPoojaValidation, createBooking);
router.get('/mybookings', GetBookPooja);
router.post('/create-checkout', createPoojaCheckout);
router.post('/verify-payment', verifyPoojaPayment);

export default router;