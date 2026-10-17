


// import express from 'express';
// import { 
//     getProducts,
//     getProductById,
//     addProduct,
//     updateProduct,
//     deleteProduct,
//     createProductReview,
//     getProductReviews,
//     searchProducts,
//     getPopularProducts,
//     getRelatedProducts
// } from '../controllers/productController.js';
// import { protect, restrictTo } from '../middleware/authMiddleware.js';
// import upload from '../middleware/uploadMiddleware.js';
// import {  validateId } from '../middleware/validationMiddleware.js';

// const router = express.Router();

// // =======================
// //   PUBLIC ROUTES
// // =======================
// router.get('/all', getProducts);           // List all products
// router.get('/search', searchProducts);      // Search products by keyword/category
// router.get('/popular', getPopularProducts); // Popular products for Home page
// router.get('/:id', validateId, getProductById); // Get single product details
// router.get('/:id/related', validateId, getRelatedProducts); // Related products
// router.get('/:id/reviews', validateId, getProductReviews);   // Get all reviews

// // =======================
// //   REVIEWS ROUTES (PROTECTED)
// // =======================
// // Add a review (User must be logged in)
// router.post('/:id/reviews', protect, validateId, createProductReview);

// // =======================
// //   PROTECTED ADMIN ROUTES (RBAC)
// // =======================

// // Add Product
// router.post(
//     '/add', 
//     protect, 
//     restrictTo('super_admin', 'admin', 'manager', 'editor'), 
//     upload.single('image'), 
//     // validateProduct,
//     addProduct
// );

// // Update Product
// router.put(
//     '/:id', 
//     protect, 
//     restrictTo('super_admin', 'admin', 'manager', 'editor'), 
//     upload.single('image'), 
//     validateId,
//     // validateProduct,
//     updateProduct
// );

// // Delete Product
// router.delete(
//     '/:id', 
//     protect, 
//     restrictTo('super_admin', 'admin'), 
//     validateId,
//     deleteProduct
// );

// export default router;

import express from 'express';
import { 
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    searchProducts,
    getPopularProducts,
    getRelatedProducts,
    uploadImage,     // ✅ NAYA
    deleteImage      // ✅ NAYA
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { validateId } from '../middleware/validationMiddleware.js';

const router = express.Router();

// =======================
//   PUBLIC ROUTES
// =======================
router.get('/all', getProducts);
router.get('/search', searchProducts);
router.get('/popular', getPopularProducts);
router.get('/:id', validateId, getProductById);
router.get('/:id/related', validateId, getRelatedProducts);
router.get('/:id/reviews', validateId, getProductReviews);

// =======================
//   REVIEWS ROUTES (PROTECTED)
// =======================
router.post('/:id/reviews', protect, validateId, createProductReview);

// =======================
//   PROTECTED ADMIN ROUTES (RBAC)
// =======================

// Add Product
router.post(
    '/add', 
    protect, 
    restrictTo('super_admin', 'admin', 'manager', 'editor'), 
    upload.single('image'), 
    addProduct
);

// Update Product
router.put(
    '/:id', 
    protect, 
    restrictTo('super_admin', 'admin', 'manager', 'editor'), 
    upload.single('image'), 
    validateId,
    updateProduct
);

// Delete Product
router.delete(
    '/:id', 
    protect, 
    restrictTo('super_admin', 'admin'), 
    validateId,
    deleteProduct
);

// ═══════════════════════════════════════
//   ✅ NAYE ROUTES — IMAGE UPLOAD / DELETE
// ═══════════════════════════════════════

// ✅ POST /api/products/admin/upload
router.post(
    '/admin/upload',
    protect,
    restrictTo('super_admin', 'admin', 'manager', 'editor'),
    upload.single('image'),
    uploadImage
);

// ✅ DELETE /api/products/admin/upload/:publicId
router.delete(
    '/admin/upload/:publicId',
    protect,
    restrictTo('super_admin', 'admin'),
    deleteImage
);

export default router;