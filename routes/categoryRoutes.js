// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { createCategory, getCategories } from '../controllers/categoryController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Ensure 'uploads' directory exists
// const uploadDir = 'uploads/';
// if (!fs.existsSync(uploadDir)){
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Multer Storage Setup
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir); 
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });

// router.get('/', getCategories);
// router.post('/add', protect, adminOnly, upload.single('image'), createCategory);

// export default router;


import express from 'express';
import { createCategory, getCategories } from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // 👈 Agar aapka upload middleware kisi aur folder mein hai, toh uska sahi path yahan dein (jaise '../utils/upload.js' ya '../config/cloudinary.js')

const router = express.Router();

router.get('/', getCategories);

// Y সরাসরি aapka existing Cloudinary upload middleware use ho jayega
router.post('/add', protect, adminOnly, upload.single('image'), createCategory);

export default router;