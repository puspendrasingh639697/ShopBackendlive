import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    // =======================
    //   BASIC INFORMATION
    // =======================
    name: { 
        type: String, 
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true,
        lowercase: true,
        trim: true,
        // match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"]
    },
    password: { 
        type: String, 
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    phone: { 
        type: String, 
        required: false,
        sparse: true,
        default: null,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Phone number must be 10 digits'
        }
    },
    
    // =======================
    //   ROLE & PERMISSIONS
    // =======================
    role: { 
        type: String, 
        default: 'user', 
        enum: ['user', 'admin', 'super_admin', 'astrologer']
    },
    
    // =======================
    //   ADDRESSES
    // =======================
    addresses: [addressSchema],
    
    // =======================
    //   WISHLIST & CART
    // =======================
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product', 
                required: true 
            },
            quantity: { 
                type: Number, 
                default: 1, 
                min: [1, "Quantity cannot be less than 1"],
                max: [99, "Quantity cannot exceed 99"]
            }
        }
    ],
    
    // =======================
    //   🔒 SECURITY FIELDS
    // =======================
    lastLogin: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    passwordChangedAt: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    
    // =======================
    //   EMAIL VERIFICATION
    // =======================
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null }
    
}, { timestamps: true });

// =======================
//   🔒 PASSWORD METHODS & HOOKS
// =======================

userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.passwordChangedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password was changed after token issued
userSchema.methods.isPasswordChangedAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Increment failed login attempts
userSchema.methods.incrementFailedLoginAttempts = async function() {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 10) {
        this.isLocked = true;
        this.lockUntil = Date.now() + 30 * 60 * 1000;
    }
    await this.save();
};

// Reset failed login attempts
userSchema.methods.resetFailedLoginAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.isLocked = false;
    this.lockUntil = null;
    await this.save();
};

// Check if account is locked
userSchema.methods.isAccountLocked = async function() {
    if (this.isLocked && this.lockUntil > Date.now()) {
        return true;
    }
    if (this.isLocked && this.lockUntil <= Date.now()) {
        this.isLocked = false;
        this.lockUntil = null;
        await this.save();
        return false;
    }
    return false;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

// Generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    return verificationToken;
};

export default mongoose.model('User', userSchema);