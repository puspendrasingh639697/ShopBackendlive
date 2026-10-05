
// // import mongoose from "mongoose";

// // const BookPoojaSchema = new mongoose.Schema({
// //     userId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "User",
// //         required: true,
// //         index: true
// //     },
// //     poojaId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "PoojaDetails",
// //         required: true,
// //         index: true
// //     },
// //     templeID: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "TempleDetails",
// //     },
// //     names: {
// //         type: [String],
// //         required: true
// //     },
// //     phoneNumber: {
// //         type: String,
// //         required: true,
// //         trim: true
// //     },
// //     gotra: {
// //         type: String,
// //         default: "Gotra not specified"
// //     },
// //     pujaType: {
// //         type: String,
// //         required: true,
// //         enum: ['live_virtual_puja', 'sankalp_prasad_puja', 'at_home_pandit'],
// //         default: 'sankalp_prasad_puja'
// //     },
// //     packageType: {
// //         type: String,
// //         required: true
// //     },
// //     totalAmount: {
// //         type: Number,
// //         required: true
// //     },
// //     dateOfPooja: {
// //         type: Date,
// //         required: true
// //     },
// //     address: {
// //         type: String,
// //     },
// //     status: {
// //         type: String,
// //         // 'confirmed' add kiya hai taaki payment ke baad error na aaye
// //         enum: ["booked", "pending", "confirmed", "cancelled", "completed"],
// //         default: "pending",
// //         index: true
// //     },
// //     paymentStatus: {
// //         type: String,
// //         // 'paid' aur 'success' dono allow kar diye hain
// //         enum: ['pending', 'paid', 'success', 'failed', 'refunded'],
// //         default: "pending"
// //     },
// //     razorpayOrderId: {
// //         type: String,
// //         index: true // Webhook ke liye fast lookup ke zaroori hai
// //     },
// //     razorpayPaymentId: {
// //         type: String
// //     }
// // }, { timestamps: true });

// // // 1M Users scale ke liye Compound Index (User ki history fast load karne ke liye)
// // BookPoojaSchema.index({ userId: 1, createdAt: -1 });

// // const Bookpooja = mongoose.models.Bookpooja || mongoose.model("Bookpooja", BookPoojaSchema);

// // export default Bookpooja;

// import mongoose from "mongoose";

// const BookPoojaSchema = new mongoose.Schema(
//   {
//     // ─── References ───
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     poojaId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PoojaInfo",        // ⭐ Sahi ref (aapka model PoojaInfo hai)
//       required: true,
//       index: true,
//     },

//     templeID: {
//       type: String,             // ⚠️ Aapke Pooja model mein String hai
//       default: null,
//       index: true,
//     },

//     // ─── SNAPSHOT (booking ke waqt ke details) ───
//     poojaName: {
//       type: String,
//       required: true,
//     },
//     templeName: {
//       type: String,
//       required: true,
//     },
//     poojaImage: {
//       type: String,
//       default: "",
//     },

//     // ─── Devotee Details ───
//     names: {
//       type: [String],
//       required: true,
//       validate: {
//         validator: (arr) => Array.isArray(arr) && arr.length > 0,
//         message: "At least one name required",
//       },
//     },
//     phoneNumber: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     gotra: {
//       type: String,
//       default: "Gotra not specified",
//       trim: true,
//     },

//     // ─── Puja Details ───
//     pujaType: {
//       type: String,
//       required: true,
//       enum: [
//         "live_virtual_puja",
//         "sankalp_prasad_puja",
//         "at_home_pandit",
//         "Virtual",
//         "Physical",
//       ],
//       default: "sankalp_prasad_puja",
//     },
//     packageType: {
//       type: String,
//       required: true,
//       enum: ["single", "family", "group", "premium"],
//       default: "single",
//     },
//     totalAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     dateOfPooja: {
//       type: Date,
//       required: true,
//       index: true,
//     },
//     address: {
//       type: String,
//       default: "N/A (Virtual Pooja)",
//     },
//     notes: {
//       type: String,
//       default: "",
//       maxlength: 1000,
//     },

//     // ─── Status ───
//     status: {
//       type: String,
//       enum: ["booked", "pending", "confirmed", "cancelled", "completed"],
//       default: "pending",
//       index: true,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "paid", "success", "failed", "refunded"],
//       default: "pending",
//       index: true,
//     },

//     // ─── Payment Details ───
//     razorpayOrderId: {
//       type: String,
//       index: true,
//       default: null,
//     },
//     razorpayPaymentId: {
//       type: String,
//       default: null,
//     },
//     razorpaySignature: {
//       type: String,
//       default: null,
//     },
//     paidAt: {
//       type: Date,
//       default: null,
//     },

//     // ─── Delivery ───
//     videoUrl: {
//       type: String,
//       default: null,
//     },
//     prasadTrackingId: {
//       type: String,
//       default: null,
//     },

//     // ─── Cancellation ───
//     cancelledAt: {
//       type: Date,
//       default: null,
//     },
//     cancelReason: {
//       type: String,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // ═══════════════════════════════════════
// //   INDEXES (1M users ke liye)
// // ═══════════════════════════════════════

// // User ki history fast load
// BookPoojaSchema.index({ userId: 1, createdAt: -1 });

// // Admin dashboard queries
// BookPoojaSchema.index({ paymentStatus: 1, createdAt: -1 });
// BookPoojaSchema.index({ status: 1, createdAt: -1 });

// // Date-wise poojas
// BookPoojaSchema.index({ dateOfPooja: 1, status: 1 });

// // Razorpay webhook lookup
// BookPoojaSchema.index({ razorpayOrderId: 1 });

// // Pooja-wise bookings (analytics)
// BookPoojaSchema.index({ poojaId: 1, status: 1 });

// // ═══════════════════════════════════════
// //   VIRTUALS
// // ═══════════════════════════════════════

// BookPoojaSchema.virtual("isPaid").get(function () {
//   return this.paymentStatus === "paid" || this.paymentStatus === "success";
// });

// BookPoojaSchema.virtual("isCancellable").get(function () {
//   return this.status === "pending" || this.status === "booked" || this.status === "confirmed";
// });

// // ═══════════════════════════════════════
// //   MIDDLEWARES
// // ═══════════════════════════════════════

// // Auto-set paidAt when paymentStatus becomes paid
// BookPoojaSchema.pre("save", function (next) {
//   if (
//     this.isModified("paymentStatus") &&
//     (this.paymentStatus === "paid" || this.paymentStatus === "success") &&
//     !this.paidAt
//   ) {
//     this.paidAt = new Date();
//   }

//   if (
//     this.isModified("status") &&
//     this.status === "cancelled" &&
//     !this.cancelledAt
//   ) {
//     this.cancelledAt = new Date();
//   }

//   next();
// });

// const Bookpooja =
//   mongoose.models.Bookpooja ||
//   mongoose.model("Bookpooja", BookPoojaSchema);

// export default Bookpooja;


import mongoose from "mongoose";

const BookPoojaSchema = new mongoose.Schema(
  {
    // ─── References ───
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    poojaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoojaInfo",
      required: true,
      index: true,
    },

    templeID: {
      type: String,
      default: null,
      index: true,
    },

    // ─── SNAPSHOT ───
    poojaName: { type: String, required: true },
    templeName: { type: String, required: true },
    poojaImage: { type: String, default: "" },

    // ─── Devotee Details ───
    names: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one name required",
      },
    },
    phoneNumber: { type: String, required: true, trim: true },
    gotra: { type: String, default: "Gotra not specified", trim: true },

    // ─── Puja Details ───
    pujaType: {
      type: String,
      required: true,
      enum: [
        "live_virtual_puja",
        "sankalp_prasad_puja",
        "at_home_pandit",
        "Virtual",
        "Physical",
      ],
      default: "sankalp_prasad_puja",
    },
    packageType: {
      type: String,
      required: true,
      enum: ["single", "family", "group", "premium"],
      default: "single",
    },
    totalAmount: { type: Number, required: true, min: 0 },
    dateOfPooja: { type: Date, required: true, index: true },
    address: { type: String, default: "N/A (Virtual Pooja)" },
    notes: { type: String, default: "", maxlength: 1000 },

    // ═══════════════════════════════════════
    //   ⭐ SLOT (NEW)
    // ═══════════════════════════════════════
    slot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      default: "morning",
      index: true,
    },
    slotTime: {
      type: String,
      default: "",
    },

    // ─── Status ───
    status: {
      type: String,
      enum: ["booked", "pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "success", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    // ─── Payment Details ───
    razorpayOrderId: { type: String, index: true, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paidAt: { type: Date, default: null },

    // ─── Delivery ───
    videoUrl: { type: String, default: null },
    prasadTrackingId: { type: String, default: null },

    // ─── Cancellation ───
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
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

BookPoojaSchema.index({ userId: 1, createdAt: -1 });
BookPoojaSchema.index({ paymentStatus: 1, createdAt: -1 });
BookPoojaSchema.index({ status: 1, createdAt: -1 });
BookPoojaSchema.index({ dateOfPooja: 1, status: 1 });
BookPoojaSchema.index({ razorpayOrderId: 1 });
BookPoojaSchema.index({ poojaId: 1, status: 1 });

// ⭐ SLOT-WISE FAST LOOKUP
BookPoojaSchema.index({ poojaId: 1, dateOfPooja: 1, slot: 1, status: 1 });

// ⭐ DOUBLE BOOKING PREVENTION
// Same user, same pooja, same date, same slot — sirf ek active booking
BookPoojaSchema.index(
  { userId: 1, poojaId: 1, dateOfPooja: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "cancelled" } },
  }
);

// ═══════════════════════════════════════
//   VIRTUALS
// ═══════════════════════════════════════

BookPoojaSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "paid" || this.paymentStatus === "success";
});

BookPoojaSchema.virtual("isCancellable").get(function () {
  return (
    this.status === "pending" ||
    this.status === "booked" ||
    this.status === "confirmed"
  );
});

// ═══════════════════════════════════════
//   MIDDLEWARES
// ═══════════════════════════════════════

BookPoojaSchema.pre("save", function (next) {
  if (
    this.isModified("paymentStatus") &&
    (this.paymentStatus === "paid" || this.paymentStatus === "success") &&
    !this.paidAt
  ) {
    this.paidAt = new Date();
  }

  if (
    this.isModified("status") &&
    this.status === "cancelled" &&
    !this.cancelledAt
  ) {
    this.cancelledAt = new Date();
  }

  next();
});

const Bookpooja =
  mongoose.models.Bookpooja ||
  mongoose.model("Bookpooja", BookPoojaSchema);

export default Bookpooja;