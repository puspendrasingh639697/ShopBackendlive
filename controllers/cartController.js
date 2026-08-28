// import Cart from '../models/Cart.js';

// // 1. Cart mein saaman daalne ke liye
// export const addToCart = async (req, res) => {
//     const { userId, productId, quantity } = req.body;
//     const qty = Number(quantity) || 1; // Ensure quantity is a number

//     try {
//         let cart = await Cart.findOne({ userId });

//         if (cart) {
//             // Safe comparison using .toString()
//             const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
            
//             if (itemIndex > -1) {
//                 // Number addition fix
//                 cart.items[itemIndex].quantity += qty;
//             } else {
//                 cart.items.push({ productId, quantity: qty });
//             }
//             cart = await cart.save();
//         } else {
//             cart = await Cart.create({ userId, items: [{ productId, quantity: qty }] });
//         }
//         res.status(200).json({ message: "Cart Updated!", cart });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // 2. User ki puri cart dekhne ke liye
// export const getCart = async (req, res) => {
//     try {
//         const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');

//         if (!cart) return res.status(200).json({ items: [], totalAmount: 0 });

//         // Filter Logic: Sirf wo items rakho jinka productId null NAHI hai
//         const validItems = cart.items.filter(item => item.productId !== null);

//         let totalAmount = 0;
//         validItems.forEach(item => {
//             totalAmount += item.productId.price * item.quantity;
//         });

//         res.status(200).json({
//             cartId: cart._id,
//             items: validItems,
//             totalAmount: totalAmount,
//             totalItems: validItems.length
//         });

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // cartController.js ke andar ye code hona chahiye:
// export const removeFromCart = async (req, res) => {
//     try {
//         // ✅ Yahan req.body ki jagah req.params use karein kyunki URL se data aa raha hai
//         const { userId, productId } = req.params;

//         if (!userId || !productId) {
//             return res.status(400).json({ success: false, message: "UserId aur ProductId zaroori hai!" });
//         }

//         // Cart find karke item remove karne ka logic
//         const cart = await Cart.findOne({ userId });
//         if (!cart) {
//             return res.status(404).json({ success: false, message: "Cart nahi mila!" });
//         }

//         // Item ko array se filter out karein
//         cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        
//         // Total amount recalculate karein agar zaroori ho, fir save karein
//         await cart.save();

//         // Updated cart populate karke bhein
//         const updatedCart = await Cart.findOne({ userId }).populate('items.productId');

//         return res.status(200).json({ 
//             success: true, 
//             message: "Product hat gaya!", 
//             cart: updatedCart 
//         });

//     } catch (error) {
//         console.error("Remove from cart error:", error);
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };

// // 4. Quantity kam ya zyada karne ke liye (Update Quantity)
// export const updateCartQuantity = async (req, res) => {
//     const { userId, productId, quantity } = req.body;
//     const qty = Number(quantity);

//     try {
//         let cart = await Cart.findOne({ userId });

//         if (cart) {
//             const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
            
//             if (itemIndex > -1) {
//                 if (qty <= 0) {
//                     // Agar quantity 0 ya negative ho jaye, toh item remove kar do
//                     cart.items.splice(itemIndex, 1);
//                 } else {
//                     cart.items[itemIndex].quantity = qty;
//                 }
//                 cart = await cart.save();
//                 return res.status(200).json({ message: "Quantity update ho gayi!", cart });
//             }
//         }
//         res.status(404).json({ message: "Product cart mein nahi hai!" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';

// Helper function to check valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. Cart mein saaman daalne ke liye
export const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    // Strict Validations
    if (!userId || !isValidId(userId)) {
        return res.status(400).json({ success: false, message: "Valid User ID required!" });
    }

    if (!productId || !isValidId(productId)) {
        return res.status(400).json({ success: false, message: "Valid Product ID required!" });
    }

    try {
        let cart = await Cart.findOne({ userId });

        if (cart) {
            // Clean up corrupted null/undefined product references
            cart.items = cart.items.filter(item => item && item.productId);

            // Safe string comparison
            const itemIndex = cart.items.findIndex(p => p.productId?.toString() === productId.toString());
            
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += qty;
            } else {
                cart.items.push({ productId, quantity: qty });
            }
            cart = await cart.save();
        } else {
            cart = await Cart.create({ userId, items: [{ productId, quantity: qty }] });
        }

        // Return populated cart to keep frontend in sync
        const populatedCart = await Cart.findById(cart._id).populate('items.productId');

        return res.status(200).json({ 
            success: true, 
            message: "Cart Updated!", 
            cart: populatedCart 
        });
    } catch (error) {
        console.error("addToCart error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. User ki puri cart dekhne ke liye
export const getCart = async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidId(userId)) {
        return res.status(400).json({ success: false, message: "Valid User ID required!" });
    }

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(200).json({ success: true, items: [], totalAmount: 0, totalItems: 0 });
        }

        // Filter valid populated products
        const validItems = cart.items.filter(item => item && item.productId !== null);

        let totalAmount = 0;
        validItems.forEach(item => {
            if (item.productId && typeof item.productId.price === 'number') {
                totalAmount += item.productId.price * item.quantity;
            }
        });

        return res.status(200).json({
            success: true,
            cartId: cart._id,
            items: validItems,
            totalAmount: totalAmount,
            totalItems: validItems.length
        });

    } catch (error) {
        console.error("getCart error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Item ko Cart se hatane ke liye
export const removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (!userId || !isValidId(userId) || !productId || !isValidId(productId)) {
            return res.status(400).json({ success: false, message: "Valid User ID and Product ID required!" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart nahi mila!" });
        }

        // Filter out selected product and corrupted null items
        cart.items = cart.items.filter(item => item && item.productId && item.productId.toString() !== productId.toString());
        
        await cart.save();

        const updatedCart = await Cart.findOne({ userId }).populate('items.productId');

        return res.status(200).json({ 
            success: true, 
            message: "Product hat gaya!", 
            cart: updatedCart 
        });

    } catch (error) {
        console.error("removeFromCart error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Quantity update karne ke liye
export const updateCartQuantity = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const qty = Number(quantity);

    if (!userId || !isValidId(userId) || !productId || !isValidId(productId)) {
        return res.status(400).json({ success: false, message: "Valid User ID and Product ID required!" });
    }

    try {
        let cart = await Cart.findOne({ userId });

        if (cart) {
            cart.items = cart.items.filter(item => item && item.productId);

            const itemIndex = cart.items.findIndex(p => p.productId?.toString() === productId.toString());
            
            if (itemIndex > -1) {
                if (qty <= 0) {
                    cart.items.splice(itemIndex, 1);
                } else {
                    cart.items[itemIndex].quantity = qty;
                }
                await cart.save();
                
                const updatedCart = await Cart.findOne({ userId }).populate('items.productId');
                return res.status(200).json({ success: true, message: "Quantity update ho gayi!", cart: updatedCart });
            }
        }
        return res.status(404).json({ success: false, message: "Product cart mein nahi hai!" });
    } catch (error) {
        console.error("updateCartQuantity error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};