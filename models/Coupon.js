import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true 
    },
    discountPercent: { 
        type: Number, 
        min: 1, 
        max: 100 
    },
    description: { 
        type: String, 
        default: '' 
    },
    isFirstOrderOnly: { 
        type: Boolean, 
        default: false 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    // ✅ One-time use per user
    usedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }],
    // ✅ Total usage limit
    maxUsage: { type: Number, default: 1 },
    // ✅ Total times used
    usedCount: { type: Number, default: 0 },
    // ✅ Minimum order amount
    minOrderAmount: { type: Number, default: 0 },
    // ✅ Expiry date
    expiresAt: { type: Date },
    // ✅ Voucher type
    voucherType: { 
        type: String, 
        enum: ['discount', 'free_shipping', 'fixed_amount'], 
        default: 'discount' 
    },
    // ✅ Fixed amount discount (if voucherType = 'fixed_amount')
    fixedAmount: { type: Number, default: 0 },
    
    // ✅ Track kaunsa Admin/Super Admin yeh coupon bana raha hai
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);