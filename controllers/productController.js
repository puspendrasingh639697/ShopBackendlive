


// import Product from '../models/Product.js';
// import Category from '../models/Category.js';

// // =======================
// //   ADD PRODUCT
// // =======================
// export const addProduct = async (req, res) => {
//     console.log("--- Add Product Request Aayi Hai ---");
//     console.log("Body Data:", req.body);
//     console.log("File Data:", req.file);

//     try {
//         const { name, description, price, category, stock, isFeatured } = req.body;

//         if (!name || !price || !description || !category || stock === undefined) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "All required fields (name, price, description, category, stock) must be provided!" 
//             });
//         }

//         if (!req.file) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Product image is required!" 
//             });
//         }

//         // ✅ Verify if category exists in database
//         const categoryExists = await Category.findById(category);
//         if (!categoryExists) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Invalid Category ID provided!" 
//             });
//         }

//         // ✅ Get image URL (Cloudinary or local)
//         let imageUrl = '';
//         if (req.file.path) {
//             imageUrl = req.file.path;
//         } else if (req.file.secure_url) {
//             imageUrl = req.file.secure_url;
//         } else {
//             imageUrl = `/uploads/${req.file.filename}`;
//         }

//         const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

//         const newProduct = new Product({
//             name: name.trim(),
//             slug,
//             description: description.trim(),
//             price: Number(price),
//             category,
//             stock: Number(stock),
//             images: [imageUrl],
//             isFeatured: isFeatured === 'true' || isFeatured === true,
//             reviews: [],
//             numReviews: 0,
//             rating: 0
//         });

//         const savedProduct = await newProduct.save();
        
//         console.log("✅ Product saved!");
//         res.status(201).json({ 
//             success: true,
//             message: "Product Added Successfully!", 
//             product: savedProduct 
//         });

//     } catch (error) {
//         console.log("Error:", error.message);
//         res.status(500).json({ 
//             success: false, 
//             message: "Server Error: " + error.message 
//         });
//     }
// };

// // =======================
// //   GET ALL PRODUCTS (with filtering & sorting)
// // =======================
// export const getProducts = async (req, res) => {
//     try {
//         const { keyword, category, sort, minPrice, maxPrice, minRating, inStock } = req.query;
//         let query = {};
        
//         // ✅ Search by keyword
//         if (keyword && keyword.trim()) {
//             const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//             query.$or = [
//                 { name: { $regex: safeKeyword, $options: 'i' } },
//                 { description: { $regex: safeKeyword, $options: 'i' } }
//             ];
//         }
        
//         // ✅ Category filter (ObjectId or Slug support)
//         if (category) {
//             if (category.match(/^[0-9a-fA-F]{24}$/)) {
//                 query.category = category;
//             } else {
//                 const catDoc = await Category.findOne({ slug: category });
//                 if (catDoc) {
//                     query.category = catDoc._id;
//                 }
//             }
//         }
        
//         // ✅ Price range
//         if (minPrice && !isNaN(minPrice) && Number(minPrice) >= 0) {
//             query.price = { ...query.price, $gte: Number(minPrice) };
//         }
//         if (maxPrice && !isNaN(maxPrice) && Number(maxPrice) > 0) {
//             query.price = { ...query.price, $lte: Number(maxPrice) };
//         }
        
//         // ✅ Rating filter
//         if (minRating && !isNaN(minRating) && Number(minRating) > 0) {
//             query.rating = { $gte: Number(minRating) };
//         }
        
//         // ✅ Stock filter
//         if (inStock === 'true') {
//             query.stock = { $gt: 0 };
//         }
        
//         // ✅ Sorting
//         let sortOption = { createdAt: -1 };
//         const validSorts = {
//             'price-low': { price: 1 },
//             'price-high': { price: -1 },
//             'newest': { createdAt: -1 },
//             'oldest': { createdAt: 1 },
//             'name-asc': { name: 1 },
//             'name-desc': { name: -1 },
//             'rating-desc': { rating: -1, numReviews: -1 },
//             'popular': { purchaseCount: -1, viewCount: -1 }
//         };
        
//         if (sort && validSorts[sort]) {
//             sortOption = validSorts[sort];
//         }
        
//         const products = await Product.find(query)
//             .populate('category', 'name slug')
//             .sort(sortOption);
        
//         res.status(200).json({
//             success: true,
//             count: products.length,
//             products
//         });
        
//     } catch (error) {
//         console.error("Get products error:", error);
//         res.status(500).json({ 
//             success: false, 
//             message: "Failed to fetch products: " + error.message 
//         });
//     }
// };

// // =======================
// //   GET SINGLE PRODUCT BY ID
// // =======================
// export const getProductById = async (req, res) => {
//     console.log("--- Fetching Single Product ID:", req.params.id, "---");
//     try {
//         const product = await Product.findById(req.params.id).populate('category', 'name slug');
//         if (!product) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Product not found" 
//             });
//         }
        
//         // ✅ Increment view count
//         product.viewCount = (product.viewCount || 0) + 1;
//         await product.save();
        
//         res.status(200).json({
//             success: true,
//             product
//         });
//     } catch (error) {
//         console.log("Error fetching product:", error.message);
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// };

// // =======================
// //   UPDATE PRODUCT
// // =======================
// export const updateProduct = async (req, res) => {
//     console.log("--- Updating Product ID:", req.params.id, "---");
//     try {
//         let updateData = { ...req.body };
        
//         if (updateData.price) updateData.price = Number(updateData.price);
//         if (updateData.stock) updateData.stock = Number(updateData.stock);

//         if (req.file) {
//             updateData.images = [req.file.path || `/uploads/${req.file.filename}`];
//         }

//         const product = await Product.findByIdAndUpdate(
//             req.params.id, 
//             updateData, 
//             { new: true, runValidators: true }
//         ).populate('category', 'name slug');

//         if (!product) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Product not found" 
//             });
//         }

//         console.log("✅ Product Updated!");
//         res.status(200).json({ 
//             success: true, 
//             message: "Product Updated!", 
//             product 
//         });
//     } catch (error) {
//         console.log("Update Error:", error.message);
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// };

// // =======================
// //   DELETE PRODUCT
// // =======================
// export const deleteProduct = async (req, res) => {
//     console.log("--- Deleting Product ID:", req.params.id, "---");
//     try {
//         const product = await Product.findByIdAndDelete(req.params.id);
//         if (!product) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Product not found" 
//             });
//         }
//         console.log("✅ Product Deleted Successfully!");
//         res.status(200).json({ 
//             success: true, 
//             message: "Product deleted successfully" 
//         });
//     } catch (error) {
//         console.log("Delete Error:", error.message);
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// };

// // =======================
// //   CREATE PRODUCT REVIEW
// // =======================
// export const createProductReview = async (req, res) => {
//     const { rating, comment, title } = req.body;

//     try {
//         const product = await Product.findById(req.params.id);

//         if (!product) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Product not found!" 
//             });
//         }

//         const alreadyReviewed = product.reviews.find(
//             (r) => r.user.toString() === req.user._id.toString()
//         );

//         if (alreadyReviewed) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "You have already reviewed this product!" 
//             });
//         }

//         const review = {
//             user: req.user._id,
//             name: req.user.name,
//             rating: Number(rating),
//             comment: comment.trim(),
//             title: title || '',
//             createdAt: new Date()
//         };

//         product.reviews.push(review);
//         product.numReviews = product.reviews.length;
        
//         const totalRating = product.reviews.reduce((sum, item) => sum + item.rating, 0);
//         product.rating = totalRating / product.reviews.length;

//         await product.save();
        
//         res.status(201).json({ 
//             success: true, 
//             message: "Review added successfully! ⭐",
//             review,
//             product: {
//                 rating: product.rating,
//                 numReviews: product.numReviews
//             }
//         });

//     } catch (error) {
//         console.error("Add review error:", error);
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// };

// // =======================
// //   GET PRODUCT REVIEWS
// // =======================
// export const getProductReviews = async (req, res) => {
//     try {
//         const product = await Product.findById(req.params.id);
        
//         if (!product) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Product not found" 
//             });
//         }
        
//         const reviews = [...product.reviews].sort((a, b) => 
//             new Date(b.createdAt) - new Date(a.createdAt)
//         );
        
//         const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
//         reviews.forEach(review => {
//             if (review.rating >= 1 && review.rating <= 5) {
//                 ratingDistribution[review.rating]++;
//             }
//         });
        
//         res.json({
//             success: true,
//             reviews,
//             totalReviews: product.numReviews,
//             averageRating: product.rating || 0,
//             ratingDistribution
//         });
//     } catch (error) {
//         console.error("Get product reviews error:", error);
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// };

// // =======================
// //   SEARCH PRODUCTS
// // =======================
// export const searchProducts = async (req, res) => {
//     const query = req.query.q || req.query.name;
//     console.log("--- Searching for:", query, "---");
//     try {
//         if (!query) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Search query is required" 
//             });
//         }
        
//         const safeKeyword = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//         const products = await Product.find({
//             $or: [
//                 { name: { $regex: safeKeyword, $options: 'i' } },
//                 { description: { $regex: safeKeyword, $options: 'i' } }
//             ]
//         }).populate('category', 'name slug');
        
//         res.status(200).json({
//             success: true,
//             count: products.length,
//             products
//         });
//     } catch (error) {
//         console.error("Search error:", error);
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// };

// // =======================
// //   GET POPULAR PRODUCTS
// // =======================
// export const getPopularProducts = async (req, res) => {
//     try {
//         const products = await Product.find({})
//             .populate('category', 'name slug')
//             .sort({ purchaseCount: -1, viewCount: -1, rating: -1 })
//             .limit(10);
        
//         res.status(200).json({
//             success: true,
//             products
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// };

// // =======================
// //   GET RELATED PRODUCTS
// // =======================
// export const getRelatedProducts = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const product = await Product.findById(id);
        
//         if (!product) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Product not found" 
//             });
//         }
        
//         const relatedProducts = await Product.find({
//             category: product.category,
//             _id: { $ne: id }
//         })
//         .populate('category', 'name slug')
//         .sort({ rating: -1, createdAt: -1 })
//         .limit(6);
        
//         res.status(200).json({
//             success: true,
//             products: relatedProducts
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// };


import Product from '../models/Product.js';
import Category from '../models/Category.js';

// =======================
//   ADD PRODUCT
// =======================
// =======================
//   ADD PRODUCT (WITH DEBUGGING)
// =======================
export const addProduct = async (req, res) => {
    console.log("--- 🚀 Add Product Request Start ---");
    console.log("BODY DATA:", req.body);
    console.log("FILE DATA:", req.file);

    try {
        const { name, description, price, category, stock, isFeatured } = req.body;

        console.log("Step 1: Validating fields...");
        if (!name || !price || !description || !category || stock === undefined) {
            console.log("❌ Error: Missing required fields");
            return res.status(400).json({ 
                success: false, 
                message: "All required fields (name, price, description, category, stock) must be provided!" 
            });
        }

        console.log("Step 2: Checking image...");
        if (!req.file) {
            console.log("❌ Error: Image missing");
            return res.status(400).json({ 
                success: false, 
                message: "Product image is required!" 
            });
        }

        console.log("Step 3: Checking category in DB...");
        // Pehle check karein agar ID hai, nahi toh name se dhundhein
        let categoryExists;
        if (category.match(/^[0-9a-fA-F]{24}$/)) {
            categoryExists = await Category.findById(category);
            console.log("Category search by ID:", categoryExists ? "Found ✅" : "Not Found ❌");
        } else {
            categoryExists = await Category.findOne({ name: category });
            console.log("Category search by Name:", categoryExists ? "Found ✅" : "Not Found ❌");
        }

        if (!categoryExists) {
            console.log("❌ Error: Invalid category provided:", category);
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Category ID or Name provided!" 
            });
        }

        console.log("Step 4: Preparing image URL...");
        let imageUrl = req.file.path || req.file.secure_url || `uploads/${req.file.filename}`;
        console.log("Image URL generated:", imageUrl);

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        console.log("Step 5: Creating new Product instance...");
        const newProduct = new Product({
            name: name.trim(),
            slug: slug,
            description: description.trim(),
            price: Number(price),
            category: categoryExists._id, // Database se mili hui sahi ID save hogi
            stock: Number(stock),
            image: imageUrl,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            reviews: [],
            numReviews: 0,
            rating: 0
        });

        console.log("Step 6: Saving to MongoDB...");
        const savedProduct = await newProduct.save();
        
        console.log("✅ SUCCESS: Product saved with ID:", savedProduct._id);
        
        res.status(201).json({ 
            success: true,
            message: "Product Added Successfully!", 
            product: savedProduct 
        });

    } catch (error) {
        console.error("❌ CRITICAL ERROR in Add Product:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
};
// =======================
//   GET ALL PRODUCTS (with filtering & sorting)
// =======================
export const getProducts = async (req, res) => {
    try {
        const { keyword, category, sort, minPrice, maxPrice, minRating, inStock } = req.query;
        let query = {};
        
        // ✅ Search by keyword
        if (keyword && keyword.trim()) {
            const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { name: { $regex: safeKeyword, $options: 'i' } },
                { description: { $regex: safeKeyword, $options: 'i' } }
            ];
        }
        
        // ✅ Category filter (ObjectId or Slug support)
        if (category) {
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                query.category = category;
            } else {
                const catDoc = await Category.findOne({ slug: category });
                if (catDoc) {
                    query.category = catDoc._id;
                }
            }
        }
        
        // ✅ Price range
        if (minPrice && !isNaN(minPrice) && Number(minPrice) >= 0) {
            query.price = { ...query.price, $gte: Number(minPrice) };
        }
        if (maxPrice && !isNaN(maxPrice) && Number(maxPrice) > 0) {
            query.price = { ...query.price, $lte: Number(maxPrice) };
        }
        
        // ✅ Rating filter
        if (minRating && !isNaN(minRating) && Number(minRating) > 0) {
            query.rating = { $gte: Number(minRating) };
        }
        
        // ✅ Stock filter
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }
        
        // ✅ Sorting
        let sortOption = { createdAt: -1 };
        const validSorts = {
            'price-low': { price: 1 },
            'price-high': { price: -1 },
            'newest': { createdAt: -1 },
            'oldest': { createdAt: 1 },
            'name-asc': { name: 1 },
            'name-desc': { name: -1 },
            'rating-desc': { rating: -1, numReviews: -1 },
            'popular': { purchaseCount: -1, viewCount: -1 }
        };
        
        if (sort && validSorts[sort]) {
            sortOption = validSorts[sort];
        }
        
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortOption);
        
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
        
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch products: " + error.message 
        });
    }
};

// =======================
//   GET SINGLE PRODUCT BY ID
// =======================
export const getProductById = async (req, res) => {
    console.log("--- Fetching Single Product ID:", req.params.id, "---");
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }
        
        // ✅ Increment view count
        product.viewCount = (product.viewCount || 0) + 1;
        await product.save();
        
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.log("Error fetching product:", error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// =======================
//   UPDATE PRODUCT
// =======================
export const updateProduct = async (req, res) => {
    console.log("--- Updating Product ID:", req.params.id, "---");
    try {
        let updateData = { ...req.body };
        
        if (updateData.price) updateData.price = Number(updateData.price);
        if (updateData.stock) updateData.stock = Number(updateData.stock);

        if (req.file) {
            updateData.images = [req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`];
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        console.log("✅ Product Updated!");
        res.status(200).json({ 
            success: true, 
            message: "Product Updated!", 
            product 
        });
    } catch (error) {
        console.log("Update Error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// =======================
//   DELETE PRODUCT
// =======================
export const deleteProduct = async (req, res) => {
    console.log("--- Deleting Product ID:", req.params.id, "---");
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }
        console.log("✅ Product Deleted Successfully!");
        res.status(200).json({ 
            success: true, 
            message: "Product deleted successfully" 
        });
    } catch (error) {
        console.log("Delete Error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// =======================
//   CREATE PRODUCT REVIEW
// =======================
export const createProductReview = async (req, res) => {
    const { rating, comment, title } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found!" 
            });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ 
                success: false, 
                message: "You have already reviewed this product!" 
            });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment: comment.trim(),
            title: title || '',
            createdAt: new Date()
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        
        const totalRating = product.reviews.reduce((sum, item) => sum + item.rating, 0);
        product.rating = totalRating / product.reviews.length;

        await product.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Review added successfully! ⭐",
            review,
            product: {
                rating: product.rating,
                numReviews: product.numReviews
            }
        });

    } catch (error) {
        console.error("Add review error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// =======================
//   GET PRODUCT REVIEWS
// =======================
export const getProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }
        
        const reviews = [...product.reviews].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                ratingDistribution[review.rating]++;
            }
        });
        
        res.json({
            success: true,
            reviews,
            totalReviews: product.numReviews,
            averageRating: product.rating || 0,
            ratingDistribution
        });
    } catch (error) {
        console.error("Get product reviews error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// =======================
//   SEARCH PRODUCTS
// =======================
export const searchProducts = async (req, res) => {
    const query = req.query.q || req.query.name;
    console.log("--- Searching for:", query, "---");
    try {
        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: "Search query is required" 
            });
        }
        
        const safeKeyword = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const products = await Product.find({
            $or: [
                { name: { $regex: safeKeyword, $options: 'i' } },
                { description: { $regex: safeKeyword, $options: 'i' } }
            ]
        }).populate('category', 'name slug');
        
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// =======================
//   GET POPULAR PRODUCTS
// =======================
export const getPopularProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('category', 'name slug')
            .sort({ purchaseCount: -1, viewCount: -1, rating: -1 })
            .limit(10);
        
        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// =======================
//   GET RELATED PRODUCTS
// =======================
export const getRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }
        
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: id }
        })
        .populate('category', 'name slug')
        .sort({ rating: -1, createdAt: -1 })
        .limit(6);
        
        res.status(200).json({
            success: true,
            products: relatedProducts
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};