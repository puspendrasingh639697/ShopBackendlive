import Cart from '../models/Cart.js';

// 1. Cart mein saaman daalne ke liye
export const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const qty = Number(quantity) || 1; // Ensure quantity is a number

    try {
        let cart = await Cart.findOne({ userId });

        if (cart) {
            // Safe comparison using .toString()
            const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
            
            if (itemIndex > -1) {
                // Number addition fix
                cart.items[itemIndex].quantity += qty;
            } else {
                cart.items.push({ productId, quantity: qty });
            }
            cart = await cart.save();
        } else {
            cart = await Cart.create({ userId, items: [{ productId, quantity: qty }] });
        }
        res.status(200).json({ message: "Cart Updated!", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. User ki puri cart dekhne ke liye
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');

        if (!cart) return res.status(200).json({ items: [], totalAmount: 0 });

        // Filter Logic: Sirf wo items rakho jinka productId null NAHI hai
        const validItems = cart.items.filter(item => item.productId !== null);

        let totalAmount = 0;
        validItems.forEach(item => {
            totalAmount += item.productId.price * item.quantity;
        });

        res.status(200).json({
            cartId: cart._id,
            items: validItems,
            totalAmount: totalAmount,
            totalItems: validItems.length
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// cartController.js ke andar ye code hona chahiye:
export const removeFromCart = async (req, res) => {
    try {
        // ✅ Yahan req.body ki jagah req.params use karein kyunki URL se data aa raha hai
        const { userId, productId } = req.params;

        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: "UserId aur ProductId zaroori hai!" });
        }

        // Cart find karke item remove karne ka logic
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart nahi mila!" });
        }

        // Item ko array se filter out karein
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        
        // Total amount recalculate karein agar zaroori ho, fir save karein
        await cart.save();

        // Updated cart populate karke bhein
        const updatedCart = await Cart.findOne({ userId }).populate('items.productId');

        return res.status(200).json({ 
            success: true, 
            message: "Product hat gaya!", 
            cart: updatedCart 
        });

    } catch (error) {
        console.error("Remove from cart error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Quantity kam ya zyada karne ke liye (Update Quantity)
export const updateCartQuantity = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const qty = Number(quantity);

    try {
        let cart = await Cart.findOne({ userId });

        if (cart) {
            const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
            
            if (itemIndex > -1) {
                if (qty <= 0) {
                    // Agar quantity 0 ya negative ho jaye, toh item remove kar do
                    cart.items.splice(itemIndex, 1);
                } else {
                    cart.items[itemIndex].quantity = qty;
                }
                cart = await cart.save();
                return res.status(200).json({ message: "Quantity update ho gayi!", cart });
            }
        }
        res.status(404).json({ message: "Product cart mein nahi hai!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};