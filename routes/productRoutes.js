
// import express from 'express';
// import { 
//     getProducts,
//     getProductById,
//     addProduct,
//     updateProduct,
//     deleteProduct,
//     createProductReview,   // ✅ ADD THIS
//     getProductReviews      // ✅ ADD THIS
// } from '../controllers/productController.js';
// import { protect, restrictTo } from '../middleware/authMiddleware.js';
// import upload from '../middleware/uploadMiddleware.js';
// import { validateProduct, validateId } from '../middleware/validationMiddleware.js';

// const router = express.Router();

// // =======================
// //   PUBLIC ROUTES
// // =======================
// router.get('/all', getProducts);
// router.get('/:id', validateId, getProductById);

// // =======================
// //   REVIEWS ROUTES (PUBLIC + PROTECTED)
// // =======================

// // ✅ Get all reviews for a product (Public)
// router.get('/:id/reviews', validateId, getProductReviews);

// // ✅ Add a review (Protected - User must be logged in)
// router.post('/:id/reviews', protect, validateId, createProductReview);

// // =======================
// //   PROTECTED ADMIN ROUTES (RBAC) with Validation
// // =======================

// // Add Product
// router.post(
//     '/add', 
//     protect, 
//     restrictTo('super_admin', 'admin', 'manager', 'editor'), 
//     upload.single('image'), 
//     validateProduct,
//     addProduct
// );

// // Update Product
// router.put(
//     '/:id', 
//     protect, 
//     restrictTo('super_admin', 'admin', 'manager', 'editor'), 
//     upload.single('image'), 
//     validateId,
//     validateProduct,
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
    getRelatedProducts
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {  validateId } from '../middleware/validationMiddleware.js';

const router = express.Router();

// =======================
//   PUBLIC ROUTES
// =======================
router.get('/all', getProducts);           // List all products
router.get('/search', searchProducts);      // Search products by keyword/category
router.get('/popular', getPopularProducts); // Popular products for Home page
router.get('/:id', validateId, getProductById); // Get single product details
router.get('/:id/related', validateId, getRelatedProducts); // Related products
router.get('/:id/reviews', validateId, getProductReviews);   // Get all reviews

// =======================
//   REVIEWS ROUTES (PROTECTED)
// =======================
// Add a review (User must be logged in)
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
    // validateProduct,
    addProduct
);

// Update Product
router.put(
    '/:id', 
    protect, 
    restrictTo('super_admin', 'admin', 'manager', 'editor'), 
    upload.single('image'), 
    validateId,
    // validateProduct,
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

export default router;