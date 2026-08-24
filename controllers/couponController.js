import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

// ✅ 1. Create Single Coupon (Admin & Super Admin)
export const createCoupon = async (req, res) => {
    try {
        const { 
            code, discountPercent, description, isFirstOrderOnly, 
            maxUsage, minOrderAmount, expiresAt, voucherType, fixedAmount 
        } = req.body;
        
        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }
        
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: "Voucher code already exists!" });
        }
        
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountPercent: discountPercent || 0,
            description: description || '',
            isFirstOrderOnly: isFirstOrderOnly || false,
            maxUsage: maxUsage || 1,
            minOrderAmount: minOrderAmount || 0,
            expiresAt: expiresAt || null,
            voucherType: voucherType || 'discount',
            fixedAmount: fixedAmount || 0,
            usedBy: [],
            usedCount: 0,
            createdBy: req.user?._id
        });
        
        res.status(201).json({ 
            success: true, 
            message: "Voucher Created Successfully!", 
            coupon 
        });
    } catch (error) {
        console.error("Create Coupon Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 2. Bulk Create Coupons (Admin & Super Admin - Supports 50K+ coupons efficiently)
export const bulkCreateCoupons = async (req, res) => {
    try {
        const { 
            prefix = 'SAVE', 
            count = 10, 
            discountPercent, 
            description, 
            isFirstOrderOnly, 
            maxUsage, 
            minOrderAmount, 
            expiresAt, 
            voucherType, 
            fixedAmount 
        } = req.body;

        if (!count || count <= 0) {
            return res.status(400).json({ message: "Valid count is required for bulk generation" });
        }

        const couponsToInsert = [];
        const uniqueCodes = new Set();

        // Generate unique random coupon codes efficiently
        while (uniqueCodes.size < count) {
            const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
            const generatedCode = `${prefix.toUpperCase()}_${randomString}`;
            uniqueCodes.add(generatedCode);
        }

        for (const code of uniqueCodes) {
            couponsToInsert.push({
                code,
                discountPercent: discountPercent || 0,
                description: description || 'Bulk generated voucher',
                isFirstOrderOnly: isFirstOrderOnly || false,
                maxUsage: maxUsage || 1,
                minOrderAmount: minOrderAmount || 0,
                expiresAt: expiresAt || null,
                voucherType: voucherType || 'discount',
                fixedAmount: fixedAmount || 0,
                usedBy: [],
                usedCount: 0,
                createdBy: req.user?._id
            });
        }

        // Fast bulk insertion into MongoDB
        await Coupon.insertMany(couponsToInsert, { ordered: false });

        res.status(201).json({ 
            success: true, 
            message: `${couponsToInsert.length} Vouchers Generated Successfully!`,
            generatedCount: couponsToInsert.length 
        });

    } catch (error) {
        console.error("Bulk Create Coupon Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 3. Apply Voucher/Coupon (Customer)
export const applyCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const userId = req.user?._id;
        
        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }
        
        if (!orderAmount || orderAmount <= 0) {
            return res.status(400).json({ message: "Valid order amount is required" });
        }
        
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(), 
            isActive: true 
        });
        
        if (!coupon) {
            return res.status(400).json({ message: "Invalid voucher code!" });
        }
        
        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({ message: "Voucher has expired!" });
        }
        
        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({ 
                message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this voucher!` 
            });
        }
        
        const alreadyUsed = coupon.usedBy?.some(u => u.userId?.toString() === userId.toString());
        if (alreadyUsed) {
            return res.status(400).json({ message: "You have already used this voucher!" });
        }
        
        if (coupon.usedCount >= coupon.maxUsage) {
            return res.status(400).json({ message: "Voucher has reached its usage limit!" });
        }
        
        if (coupon.isFirstOrderOnly) {
            const userOrders = await Order.countDocuments({ user: userId });
            if (userOrders > 0) {
                return res.status(400).json({ message: "This voucher is only for first order!" });
            }
        }
        
        let discountAmount = 0;
        let finalAmount = orderAmount;
        
        if (coupon.voucherType === 'discount') {
            discountAmount = (orderAmount * coupon.discountPercent) / 100;
            finalAmount = orderAmount - discountAmount;
        } else if (coupon.voucherType === 'fixed_amount') {
            discountAmount = Math.min(coupon.fixedAmount, orderAmount);
            finalAmount = orderAmount - discountAmount;
        } else if (coupon.voucherType === 'free_shipping') {
            discountAmount = 0;
            finalAmount = orderAmount;
        }
        
        discountAmount = Math.round(discountAmount * 100) / 100;
        finalAmount = Math.round(finalAmount * 100) / 100;
        
        coupon.usedCount += 1;
        coupon.usedBy.push({ 
            userId: userId, 
            usedAt: new Date() 
        });
        await coupon.save();
        
        res.json({
            success: true,
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                discountPercent: coupon.discountPercent,
                voucherType: coupon.voucherType,
                fixedAmount: coupon.fixedAmount,
                description: coupon.description
            },
            discountAmount,
            finalAmount: finalAmount > 0 ? finalAmount : 0,
            couponId: coupon._id
        });
        
    } catch (error) {
        console.error("Apply Coupon Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 4. Mark Voucher as Used (After Order)
export const markCouponAsUsed = async (req, res) => {
    try {
        const { couponId, orderId } = req.body;
        const userId = req.user?._id;
        
        if (!couponId || !orderId) {
            return res.status(400).json({ message: "Coupon ID and Order ID are required" });
        }
        
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ message: "Voucher not found!" });
        }
        
        coupon.usedBy.push({ userId, usedAt: new Date(), orderId });
        coupon.usedCount += 1;
        await coupon.save();
        
        res.json({ success: true, message: "Voucher marked as used!" });
        
    } catch (error) {
        console.error("Mark Coupon Used Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 5. Get All Vouchers (Admin & Super Admin)
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .sort({ createdAt: -1 })
            .populate('usedBy.userId', 'name email');
        res.json({ success: true, coupons });
    } catch (error) {
        console.error("Get All Coupons Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 6. Get User's Used Vouchers (Customer)
export const getUserVouchers = async (req, res) => {
    try {
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        
        const coupons = await Coupon.find({
            'usedBy.userId': userId
        }).select('code discountPercent usedBy');
        
        res.json({ success: true, coupons });
    } catch (error) {
        console.error("Get User Vouchers Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 7. Delete Voucher (Admin & Super Admin)
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: "Voucher not found!" });
        }
        res.json({ success: true, message: "Voucher deleted!" });
    } catch (error) {
        console.error("Delete Coupon Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 8. Toggle Coupon Status (Admin & Super Admin)
export const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found!" });
        }
        
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        
        res.json({ 
            success: true, 
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully!`,
            coupon 
        });
    } catch (error) {
        console.error("Toggle Coupon Status Error:", error);
        res.status(500).json({ message: error.message });
    }
};