// models/ChadhavaBookingModel.js
import mongoose from "mongoose";

const ChadhavaBookingSchema = new mongoose.Schema(
  {
    // ─── References ───
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chadhavaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chadhava",
      required: true,
      index: true,
    },

    // ─── SNAPSHOT ───
    chadhavaName: { type: String, required: true },
    chadhavaType: { type: String, required: true },
    templeName: { type: String, required: true },
    image: { type: String, default: "" },

    // ─── Date & Slot ───
    date: { type: Date, required: true, index: true },
    slot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true,
      index: true,
    },
    slotTime: { type: String, default: "" },

    // ─── Devotee Details ───
    names: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one name required",
      },
    },
    gotra: { type: String, default: "Not Specified" },
    phoneNumber: { type: String, required: true },
    address: { type: String, default: "" },
    specialRequests: { type: String, default: "", maxlength: 1000 },

    // ─── Pricing ───
    price: { type: Number, required: true },
    samagriCharge: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // ─── Delivery ───
    deliveryType: { type: String, default: "temple" },
    videoUrl: { type: String, default: null },
    prasadTrackingId: { type: String, default: null },

    // ─── Status ───
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    // ─── Payment ───
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paidAt: { type: Date, default: null },

    // ─── Cancellation ───
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
    cancelledBy: {
      type: String,
      enum: ["user", "admin"],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ═══════════════════════════════════════
//   INDEXES
// ═══════════════════════════════════════

ChadhavaBookingSchema.index({ userId: 1, createdAt: -1 });
ChadhavaBookingSchema.index({ chadhavaId: 1, date: 1, slot: 1, status: 1 });
ChadhavaBookingSchema.index({ paymentStatus: 1, createdAt: -1 });
ChadhavaBookingSchema.index({ status: 1, createdAt: -1 });

// ⭐ DOUBLE BOOKING PREVENTION
ChadhavaBookingSchema.index(
  { userId: 1, chadhavaId: 1, date: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed"] },
    },
  }
);

// ═══════════════════════════════════════
//   VIRTUALS
// ═══════════════════════════════════════

ChadhavaBookingSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "paid";
});

ChadhavaBookingSchema.virtual("isCancellable").get(function () {
  return ["pending", "confirmed"].includes(this.status);
});

export default mongoose.models.ChadhavaBooking ||
  mongoose.model("ChadhavaBooking", ChadhavaBookingSchema);