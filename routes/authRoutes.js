// import express from 'express';
// import { 
//     register, 
//     login, 
//     sendOtp, 
//     verifyOtp, 
//     forgotPassword, 
//     resetPassword 
// } from '../controllers/authController.js';

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.post("/send-otp", sendOtp);
// router.post("/verify-otp", verifyOtp);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);

// export default router;
import express from 'express';
import { 
    register, 
    login, 
    sendOtp, 
    verifyOtp, 
    forgotPassword, 
    resetPassword,
    refreshToken // <-- Ye import hona chahiye
} from '../controllers/authController.js';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh-token", refreshToken); // <-- Ye line add karein

export default router;