// // backend/controllers/userController.js
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";

// // =======================
// //   TOKEN GENERATION
// // =======================

// // ✅ Access Token (Short lived - 1 hour)
// const generateAccessToken = (id) => {
//     return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
//         expiresIn: "1h",
//     });
// };

// // ✅ Refresh Token (Long lived - 7 days)
// const generateRefreshToken = (id) => {
//     return jwt.sign({ id, type: 'refresh', tokenId: crypto.randomBytes(16).toString('hex') }, 
//         process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, {
//         expiresIn: "7d",
//     });
// };

// // ✅ Store refresh tokens (for invalidation on logout)
// const refreshTokens = new Set();

// // ✅ Track failed login attempts
// const loginAttempts = new Map();

// // =======================
// //   AUTH ROUTES
// // =======================
// export const registerUser = async (req, res) => {
//     const { name, email, password, phone } = req.body;

//     try {
//         const userExists = await User.findOne({ email: email.toLowerCase() });
//         if (userExists) {
//             return res.status(400).json({ message: "User already exists" });
//         }

//         const user = await User.create({
//             name: name.trim(),
//             email: email.toLowerCase().trim(),
//             password: password,
//             phone: phone || null  // ✅ Phone optional
//         });

//         if (user) {
//             const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//                 expiresIn: "30d",
//             });
            
//             res.status(201).json({
//                 success: true,
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 token: token
//             });
//         }
//     } catch (error) {
//         console.error("Register error:", error);
//         res.status(500).json({ message: error.message });
//     }
// };
// export const loginUser = async (req, res) => {
//     const { email, password } = req.body;
//     const ip = req.ip || req.connection.remoteAddress;

//     // ✅ Check brute force attempts
//     const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
    
//     if (Date.now() - attempts.lastAttempt > 15 * 60 * 1000) {
//         attempts.count = 0;
//     }
    
//     if (attempts.count >= 5) {
//         return res.status(429).json({ 
//             success: false, 
//             message: 'Too many login attempts. Please try again after 15 minutes.' 
//         });
//     }

//     try {
//         if (!email || !password) {
//             return res.status(400).json({ message: "Please provide email and password" });
//         }

//         const user = await User.findOne({ email: email.toLowerCase() });

//         if (!user) {
//             attempts.count++;
//             attempts.lastAttempt = Date.now();
//             loginAttempts.set(ip, attempts);
//             return res.status(401).json({ message: "Invalid email or password" });
//         }

//         if (user.isLocked && user.lockUntil > Date.now()) {
//             return res.status(423).json({ 
//                 success: false, 
//                 message: `Account locked. Try again after ${new Date(user.lockUntil).toLocaleTimeString()}` 
//             });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);

//         if (isMatch) {
//             loginAttempts.delete(ip);
//             user.lastLogin = new Date();
//             user.failedLoginAttempts = 0;
//             await user.save();
            
//             const accessToken = generateAccessToken(user._id);
//             const refreshToken = generateRefreshToken(user._id);
//             refreshTokens.add(refreshToken);
            
//             const isAdmin = user.role === 'admin' || user.role === 'super_admin';
            
//             res.json({
//                 success: true,
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone,
//                 role: user.role,
//                 isAdmin: isAdmin,
//                 accessToken: accessToken,
//                 refreshToken: refreshToken
//             });
//         } else {
//             attempts.count++;
//             attempts.lastAttempt = Date.now();
//             loginAttempts.set(ip, attempts);
            
//             if (attempts.count >= 10) {
//                 await User.updateOne(
//                     { email: user.email },
//                     { isLocked: true, lockUntil: Date.now() + 30 * 60 * 1000, failedLoginAttempts: attempts.count }
//                 );
//                 return res.status(423).json({ 
//                     success: false, 
//                     message: 'Account locked due to too many failed attempts. Try after 30 minutes.' 
//                 });
//             }
            
//             user.failedLoginAttempts = attempts.count;
//             await user.save();
//             res.status(401).json({ message: "Invalid email or password" });
//         }
//     } catch (error) {
//         console.error("Login error:", error);
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };

// export const refreshAccessToken = async (req, res) => {
//     const { refreshToken } = req.body;
    
//     if (!refreshToken) {
//         return res.status(401).json({ success: false, message: 'Refresh token required' });
//     }
    
//     if (!refreshTokens.has(refreshToken)) {
//         return res.status(401).json({ success: false, message: 'Invalid refresh token' });
//     }
    
//     try {
//         const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
        
//         if (decoded.type !== 'refresh') {
//             return res.status(401).json({ success: false, message: 'Invalid token type' });
//         }
        
//         const user = await User.findById(decoded.id);
//         if (!user) {
//             return res.status(401).json({ success: false, message: 'User not found' });
//         }
        
//         const newAccessToken = generateAccessToken(user._id);
//         const newRefreshToken = generateRefreshToken(user._id);
        
//         refreshTokens.delete(refreshToken);
//         refreshTokens.add(newRefreshToken);
        
//         res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
//     } catch (error) {
//         refreshTokens.delete(refreshToken);
//         res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
//     }
// };

// export const logoutUser = async (req, res) => {
//     const refreshToken = req.body.refreshToken;
//     if (refreshToken) refreshTokens.delete(refreshToken);
//     res.json({ success: true, message: 'Logged out successfully' });
// };

// // =======================
// //   PROFILE ROUTES
// // =======================

// export const getUserProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id).select("-password");
//         if (user) {
//             res.json(user);
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };

// export const updateUserProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         if (user) {
//             user.name = req.body.name || user.name;
//             user.phone = req.body.phone || user.phone;
            
//             if (req.body.password) {
//                 if (req.body.password.length < 6) {
//                     return res.status(400).json({ message: "Password must be at least 6 characters" });
//                 }
//                 const salt = await bcrypt.genSalt(12);
//                 user.password = await bcrypt.hash(req.body.password, salt);
//                 user.passwordChangedAt = new Date();
//             }
//             const updatedUser = await user.save();
//             res.json({
//                 success: true,
//                 message: "Profile updated!",
//                 user: {
//                     _id: updatedUser._id,
//                     name: updatedUser.name,
//                     email: updatedUser.email,
//                     phone: updatedUser.phone,
//                     role: updatedUser.role
//                 }
//             });
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: "Update failed", error: error.message });
//     }
// };

// // =======================
// //   ADDRESS ROUTES
// // =======================

// export const getAddresses = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ message: "User not found" });
//         res.status(200).json(user.addresses);
//     } catch (err) {
//         res.status(500).json({ message: "Server Error", error: err.message });
//     }
// };

// export const addAddress = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ message: "User not found" });
//         const { street, city, state, zipCode } = req.body;
//         if (!street || !city || !state || !zipCode) {
//             return res.status(400).json({ message: "All address fields are required" });
//         }
//         const zipRegex = /^[0-9]{6}$/;
//         if (!zipRegex.test(zipCode)) {
//             return res.status(400).json({ message: "Zip code must be 6 digits" });
//         }
//         user.addresses.push(req.body);
//         await user.save({ validateBeforeSave: false });
//         res.status(201).json(user.addresses);
//     } catch (err) {
//         res.status(500).json({ message: "Server Error", error: err.message });
//     }
// };

// export const updateAddress = async (req, res) => {
//     try {
//         const { addressId } = req.params;
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ message: "User not found" });
//         const address = user.addresses.id(addressId);
//         if (!address) return res.status(404).json({ message: "Address not found" });
//         address.street = req.body.street || address.street;
//         address.city = req.body.city || address.city;
//         address.state = req.body.state || address.state;
//         address.zipCode = req.body.zipCode || address.zipCode;
//         await user.save({ validateBeforeSave: false });
//         res.json({ message: "Address updated successfully", addresses: user.addresses });
//     } catch (err) {
//         res.status(500).json({ message: "Update failed", error: err.message });
//     }
// };

// export const deleteAddress = async (req, res) => {
//     try {
//         const { addressId } = req.params;
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ message: "User not found" });
//         user.addresses.pull(addressId);
//         await user.save({ validateBeforeSave: false });
//         res.json({ message: "Address deleted successfully", addresses: user.addresses });
//     } catch (err) {
//         res.status(500).json({ message: "Delete failed", error: err.message });
//     }
// };

// // =======================
// //   CART ROUTES
// // =======================

// export const addToCart = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         const { productId, quantity = 1 } = req.body;
//         if (!user) return res.status(404).json({ success: false, message: "User not found" });
//         const existingItem = user.cart.find(item => item.productId.toString() === productId);
//         if (existingItem) {
//             existingItem.quantity += quantity;
//         } else {
//             user.cart.push({ productId, quantity });
//         }
//         await user.save();
//         const updatedUser = await User.findById(req.user._id).populate('cart.productId', 'name price image');
//         let totalAmount = 0;
//         const cartItems = updatedUser.cart.map(item => {
//             totalAmount += item.productId.price * item.quantity;
//             return {
//                 productId: item.productId._id,
//                 name: item.productId.name,
//                 price: item.productId.price,
//                 image: item.productId.image,
//                 quantity: item.quantity,
//                 itemTotal: item.productId.price * item.quantity
//             };
//         });
//         res.json({ success: true, message: "Added to cart", cart: { items: cartItems, totalItems: cartItems.length, totalAmount: totalAmount } });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// export const removeFromCart = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         const { productId } = req.params;
//         if (!user) return res.status(404).json({ success: false, message: "User not found" });
//         user.cart = user.cart.filter(item => item.productId.toString() !== productId);
//         await user.save();
//         res.json({ success: true, message: "Removed from cart", cart: user.cart });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// export const updateCartQuantity = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         const { productId, quantity } = req.body;
//         if (!user) return res.status(404).json({ success: false, message: "User not found" });
//         const cartItem = user.cart.find(item => item.productId.toString() === productId);
//         if (cartItem) {
//             cartItem.quantity = quantity;
//             await user.save();
//             res.json({ success: true, message: "Cart updated", cart: user.cart });
//         } else {
//             res.status(404).json({ success: false, message: "Product not in cart" });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// export const clearCart = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         if (!user) return res.status(404).json({ success: false, message: "User not found" });
//         user.cart = [];
//         await user.save();
//         res.json({ success: true, message: "Cart cleared successfully", cart: { items: [], totalItems: 0, totalAmount: 0 } });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// export const getCartWithDetails = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id).populate('cart.productId', 'name price image stock');
//         if (!user) return res.status(404).json({ success: false, message: "User not found" });
//         let totalAmount = 0;
//         const cartItems = user.cart.filter(item => item.productId).map(item => {
//             const itemTotal = item.productId.price * item.quantity;
//             totalAmount += itemTotal;
//             return {
//                 productId: item.productId._id,
//                 name: item.productId.name,
//                 price: item.productId.price,
//                 image: item.productId.image,
//                 quantity: item.quantity,
//                 stock: item.productId.stock,
//                 itemTotal: itemTotal
//             };
//         });
//         res.json({ success: true, cart: { items: cartItems, totalItems: cartItems.length, totalAmount: totalAmount } });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // =======================
// //   WISHLIST ROUTES
// // =======================

// export const toggleWishlist = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         const { productId } = req.body;
//         if (!user) return res.status(404).json({ message: "User not found" });
//         if (!productId) return res.status(400).json({ message: "Product ID is required" });
//         if (user.wishlist.includes(productId)) {
//             user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
//             await user.save();
//             return res.status(200).json({ success: true, message: "Removed from Wishlist", wishlist: user.wishlist });
//         } else {
//             user.wishlist.push(productId);
//             await user.save();
//             return res.status(200).json({ success: true, message: "Added to Wishlist", wishlist: user.wishlist });
//         }
//     } catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };

// export const getWishlist = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id).populate('wishlist', 'name price image stock');
//         res.json({ success: true, wishlist: user.wishlist });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// export const getWishlistWithDetails = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id).populate('wishlist', 'name price image stock');
//         if (!user) return res.status(404).json({ success: false, message: "User not found" });
//         res.json({ success: true, wishlist: user.wishlist, totalItems: user.wishlist.length });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// export const moveWishlistToCart = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         const { productId, quantity = 1 } = req.body;
//         if (!user) return res.status(404).json({ success: false, message: "User not found" });
//         if (!user.wishlist.includes(productId)) {
//             return res.status(400).json({ success: false, message: "Product not in wishlist" });
//         }
//         user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
//         const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
//         if (cartItemIndex > -1) {
//             user.cart[cartItemIndex].quantity += quantity;
//         } else {
//             user.cart.push({ productId, quantity });
//         }
//         await user.save();
//         const updatedUser = await User.findById(user._id).populate('wishlist', 'name price image');
//         res.json({ success: true, message: "Item moved from wishlist to cart", wishlist: updatedUser.wishlist, wishlistCount: updatedUser.wishlist.length });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // =======================
// //   ADMIN ROUTES (RBAC)
// // =======================

// export const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.find({}).select("-password");
//         res.json({ users });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// export const updateUserRole = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { role } = req.body;
//         const validRoles = ['user', 'admin', 'super_admin'];
//         if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
//         const user = await User.findById(id);
//         if (!user) return res.status(404).json({ message: 'User not found' });
//         if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
//             return res.status(403).json({ message: 'Cannot modify Super Admin user' });
//         }
//         user.role = role;
//         await user.save();
//         res.json({ success: true, message: 'User role updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// export const deleteUser = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await User.findById(id);
//         if (!user) return res.status(404).json({ message: 'User not found' });
//         if (user.role === 'super_admin') return res.status(403).json({ message: 'Cannot delete Super Admin user' });
//         await user.deleteOne();
//         res.json({ success: true, message: 'User deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// backend/controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// =======================
//   TOKEN GENERATION
// =======================

const generateAccessToken = (id) => {
    return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id, type: 'refresh', tokenId: crypto.randomBytes(16).toString('hex') }, 
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const refreshTokens = new Set();
const loginAttempts = new Map();

// =======================
//   AUTH ROUTES
// =======================

export const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            phone: phone || null
        });

        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });
            
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token
            });
        }
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
    
    if (Date.now() - attempts.lastAttempt > 15 * 60 * 1000) {
        attempts.count = 0;
    }
    
    if (attempts.count >= 5) {
        return res.status(429).json({ 
            success: false, 
            message: 'Too many login attempts. Please try again after 15 minutes.' 
        });
    }

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            attempts.count++;
            attempts.lastAttempt = Date.now();
            loginAttempts.set(ip, attempts);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.isLocked && user.lockUntil > Date.now()) {
            return res.status(423).json({ 
                success: false, 
                message: `Account locked. Try again after ${new Date(user.lockUntil).toLocaleTimeString()}` 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            loginAttempts.delete(ip);
            user.lastLogin = new Date();
            user.failedLoginAttempts = 0;
            await user.save();
            
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            refreshTokens.add(refreshToken);
            
            const isAdmin = user.role === 'admin' || user.role === 'super_admin';
            
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isAdmin: isAdmin,
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } else {
            attempts.count++;
            attempts.lastAttempt = Date.now();
            loginAttempts.set(ip, attempts);
            
            if (attempts.count >= 10) {
                await User.updateOne(
                    { email: user.email },
                    { isLocked: true, lockUntil: Date.now() + 30 * 60 * 1000, failedLoginAttempts: attempts.count }
                );
                return res.status(423).json({ 
                    success: false, 
                    message: 'Account locked due to too many failed attempts. Try after 30 minutes.' 
                });
            }
            
            user.failedLoginAttempts = attempts.count;
            await user.save();
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
    }
    
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
        
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ success: false, message: 'Invalid token type' });
        }
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        
        refreshTokens.delete(refreshToken);
        refreshTokens.add(newRefreshToken);
        
        res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        refreshTokens.delete(refreshToken);
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};

export const logoutUser = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) refreshTokens.delete(refreshToken);
    res.json({ success: true, message: 'Logged out successfully' });
};

// =======================
//   PROFILE ROUTES
// =======================

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.email = req.body.email || user.email;
            
            // Agar schema me gender aur dob hain tabhi ye dalein
            if (req.body.gender) user.gender = req.body.gender;
            if (req.body.dob) user.dob = req.body.dob;
            
            if (req.body.password) {
                if (req.body.password.length < 6) {
                    return res.status(400).json({ message: "Password must be at least 6 characters" });
                }
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(req.body.password, salt);
                user.passwordChangedAt = new Date();
            }
            
            const updatedUser = await user.save();
            res.json({
                success: true,
                message: "Profile updated!",
                user: updatedUser
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Backend Update Error:", error); // <-- Yeh terminal me error print karega
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// =======================
//   ADDRESS ROUTES
// =======================

export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const { street, city, state, zipCode } = req.body;
        if (!street || !city || !state || !zipCode) {
            return res.status(400).json({ message: "All address fields are required" });
        }
        const zipRegex = /^[0-9]{6}$/;
        if (!zipRegex.test(zipCode)) {
            return res.status(400).json({ message: "Zip code must be 6 digits" });
        }
        user.addresses.push(req.body);
        await user.save({ validateBeforeSave: false });
        res.status(201).json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const address = user.addresses.id(addressId);
        if (!address) return res.status(404).json({ message: "Address not found" });
        address.street = req.body.street || address.street;
        address.city = req.body.city || address.city;
        address.state = req.body.state || address.state;
        address.zipCode = req.body.zipCode || address.zipCode;
        await user.save({ validateBeforeSave: false });
        res.json({ message: "Address updated successfully", addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.addresses.pull(addressId);
        await user.save({ validateBeforeSave: false });
        res.json({ message: "Address deleted successfully", addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
};

// =======================
//   CART ROUTES
// =======================

export const addToCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { productId, quantity = 1 } = req.body;
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const existingItem = user.cart.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.push({ productId, quantity });
        }
        await user.save();
        const updatedUser = await User.findById(req.user._id).populate('cart.productId', 'name price image');
        let totalAmount = 0;
        const cartItems = updatedUser.cart.map(item => {
            totalAmount += item.productId.price * item.quantity;
            return {
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                image: item.productId.image,
                quantity: item.quantity,
                itemTotal: item.productId.price * item.quantity
            };
        });
        res.json({ success: true, message: "Added to cart", cart: { items: cartItems, totalItems: cartItems.length, totalAmount: totalAmount } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { productId } = req.params;
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        user.cart = user.cart.filter(item => item.productId.toString() !== productId);
        await user.save();
        res.json({ success: true, message: "Removed from cart", cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { productId, quantity } = req.body;
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const cartItem = user.cart.find(item => item.productId.toString() === productId);
        if (cartItem) {
            cartItem.quantity = quantity;
            await user.save();
            res.json({ success: true, message: "Cart updated", cart: user.cart });
        } else {
            res.status(404).json({ success: false, message: "Product not in cart" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        user.cart = [];
        await user.save();
        res.json({ success: true, message: "Cart cleared successfully", cart: { items: [], totalItems: 0, totalAmount: 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCartWithDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.productId', 'name price image stock');
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        let totalAmount = 0;
        const cartItems = user.cart.filter(item => item.productId).map(item => {
            const itemTotal = item.productId.price * item.quantity;
            totalAmount += itemTotal;
            return {
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                image: item.productId.image,
                quantity: item.quantity,
                stock: item.productId.stock,
                itemTotal: itemTotal
            };
        });
        res.json({ success: true, cart: { items: cartItems, totalItems: cartItems.length, totalAmount: totalAmount } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =======================
//   ✅ WISHLIST ROUTES (ADD THESE)
// =======================

export const toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { productId } = req.body;
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!productId) return res.status(400).json({ message: "Product ID is required" });
        if (user.wishlist.includes(productId)) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
            await user.save();
            return res.status(200).json({ success: true, message: "Removed from Wishlist", wishlist: user.wishlist });
        } else {
            user.wishlist.push(productId);
            await user.save();
            return res.status(200).json({ success: true, message: "Added to Wishlist", wishlist: user.wishlist });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist', 'name price image stock');
        res.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWishlistWithDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist', 'name price image stock');
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, wishlist: user.wishlist, totalItems: user.wishlist.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const moveWishlistToCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { productId, quantity = 1 } = req.body;
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (!user.wishlist.includes(productId)) {
            return res.status(400).json({ success: false, message: "Product not in wishlist" });
        }
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
        if (cartItemIndex > -1) {
            user.cart[cartItemIndex].quantity += quantity;
        } else {
            user.cart.push({ productId, quantity });
        }
        await user.save();
        const updatedUser = await User.findById(user._id).populate('wishlist', 'name price image');
        res.json({ success: true, message: "Item moved from wishlist to cart", wishlist: updatedUser.wishlist, wishlistCount: updatedUser.wishlist.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =======================
//   ADMIN ROUTES (RBAC)
// =======================

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const validRoles = ['user', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Cannot modify Super Admin user' });
        }
        user.role = role;
        await user.save();
        res.json({ success: true, message: 'User role updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'super_admin') return res.status(403).json({ message: 'Cannot delete Super Admin user' });
        await user.deleteOne();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};