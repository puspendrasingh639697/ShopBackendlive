


// import mongoose from "mongoose";

// const PoojaListSchema = new mongoose.Schema(
//   {
//     // ─── Basic Info ───
//     PujaName: {
//       type: String,
//       required: [true, "Puja name is required"],
//       trim: true,
//       maxlength: [200, "Puja name cannot exceed 200 characters"],
//     },

//     slug: {
//       type: String,
//       unique: true,
//       lowercase: true,
//       index: true,
//       // hanuman-chalisa-sundarkand-path-puja
//     },

//     templeName: {
//       type: String,
//       required: [true, "Temple name is required"],
//       trim: true,
//       index: true,
//     },

//     // ─── Temple Reference (better than storing name) ───
//     templeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Temple",
//       default: null,
//       index: true,
//     },

//     // ─── Location ───
//     location: {
//       city: { type: String, trim: true, index: true },
//       state: { type: String, trim: true, index: true },
//       country: { type: String, default: "India", trim: true },
//     },

//     // ─── Puja Type ───
//     pujaType: {
//       type: String,
//       enum: [
//         "Physical",
//         "Virtual",
//         "live_virtual_puja",
//         "sankalp_prasad_puja",
//         "at_home_pandit",
//       ],
//       required: true,
//       index: true,
//     },

//     // ─── Pricing (multiple packages) ───
//     pricing: {
//       single: { type: Number, default: 0, min: 0 },
//       family: { type: Number, default: 0, min: 0 },
//       group: { type: Number, default: 0, min: 0 },
//       premium: { type: Number, default: 0, min: 0 },
//     },

//     // ─── Base price (fallback) ───
//     price: {
//       type: Number,
//       required: true,
//       min: [0, "Price cannot be negative"],
//       index: true,
//     },

//     // ─── Media ───
//     image: {
//       type: String,
//       default: "",
//     },
//     images: {
//       type: [String],   // multiple images ke liye
//       default: [],
//     },

//     // ─── Description ───
//     description: {
//       type: String,
//       trim: true,
//       maxlength: [5000, "Description too long"],
//     },
//     shortDescription: {
//       type: String,
//       trim: true,
//       maxlength: [300, "Short description too long"],
//     },

//     // ─── SEO / Discoverability ───
//     tags: {
//       type: [String],
//       default: [],
//       index: true,
//     },
//     keywords: {
//       type: [String],
//       default: [],
//     },

//     // ─── Details ───
//     duration: {
//       type: String,   // "2 hours", "45 mins"
//       default: "",
//     },
//     benefits: {
//       type: [String],  // ["Health", "Prosperity"]
//       default: [],
//     },
//     language: {
//       type: String,
//       default: "Hindi",
//     },

//     // ─── Stats (for sorting "popular" poojas) ───
//     bookingCount: {
//       type: Number,
//       default: 0,
//       index: true,
//     },
//     rating: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 5,
//     },
//     ratingCount: {
//       type: Number,
//       default: 0,
//     },
//     viewCount: {
//       type: Number,
//       default: 0,
//     },

//     // ─── Status ───
//     status: {
//       type: String,
//       enum: ["draft", "active", "inactive", "archived"],
//       default: "active",
//       index: true,
//     },

//     isFeatured: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },

//     // ─── Soft delete ───
//     isDeleted: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },
//     deletedAt: {
//       type: Date,
//       default: null,
//     },

//     // ─── Audit ───
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
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
// //   INDEXES (1M users ke liye critical)
// // ═══════════════════════════════════════

// // Text search — "hanuman", "shiv", "health" etc.
// PoojaListSchema.index({
//   PujaName: "text",
//   templeName: "text",
//   description: "text",
//   tags: "text",
// });

// // Compound indexes — common filter combinations
// PoojaListSchema.index({ pujaType: 1, status: 1, isDeleted: 1 });
// PoojaListSchema.index({ "location.city": 1, pujaType: 1, status: 1 });
// PoojaListSchema.index({ price: 1, status: 1 });
// PoojaListSchema.index({ isFeatured: -1, bookingCount: -1, status: 1 });
// PoojaListSchema.index({ createdAt: -1 });

// // Unique constraint — same temple + same puja name duplicate na ho
// PoojaListSchema.index(
//   { PujaName: 1, templeName: 1 },
//   { unique: true, partialFilterExpression: { isDeleted: false } }
// );

// // ═══════════════════════════════════════
// //   VIRTUALS
// // ═══════════════════════════════════════

// PoojaListSchema.virtual("startingPrice").get(function () {
//   const prices = Object.values(this.pricing || {}).filter((p) => p > 0);
//   return prices.length ? Math.min(...prices) : this.price;
// });

// // ═══════════════════════════════════════
// //   MIDDLEWARES
// // ═══════════════════════════════════════

// // Auto-generate slug from PujaName
// PoojaListSchema.pre("save", function (next) {
//   if (this.isModified("PujaName") || !this.slug) {
//     this.slug = this.PujaName
//       .toLowerCase()
//       .replace(/[^a-z0-9\s-]/g, "")
//       .trim()
//       .replace(/\s+/g, "-")
//       .substring(0, 200);
//   }
//   next();
// });

// // Exclude soft-deleted by default
// PoojaListSchema.pre(/^find/, function (next) {
//   if (!this.getOptions().includeDeleted) {
//     this.where({ isDeleted: false });
//   }
//   next();
// });

// // ═══════════════════════════════════════
// //   STATIC METHODS
// // ═══════════════════════════════════════

// PoojaListSchema.statics.findActive = function (filter = {}) {
//   return this.find({ ...filter, status: "active", isDeleted: false });
// };

// PoojaListSchema.statics.searchPoojas = function (query, options = {}) {
//   const { page = 1, limit = 20, sortBy = "bookingCount", order = -1 } = options;
//   const skip = (page - 1) * limit;

//   const filter = {
//     status: "active",
//     isDeleted: false,
//   };

//   if (query) {
//     filter.$text = { $search: query };
//   }

//   return this.find(filter)
//     .sort({ [sortBy]: order })
//     .skip(skip)
//     .limit(limit)
//     .lean();   // ⭐ lean() for performance
// };

// export default mongoose.model("PoojaInfo", PoojaListSchema);



import mongoose from "mongoose";

const PoojaListSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───
    PujaName: {
      type: String,
      required: [true, "Puja name is required"],
      trim: true,
      maxlength: [200, "Puja name cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    templeName: {
      type: String,
      required: [true, "Temple name is required"],
      trim: true,
      index: true,
    },

    templeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Temple",
      default: null,
      index: true,
    },

    // ─── Location ───
    location: {
      city: { type: String, trim: true, index: true },
      state: { type: String, trim: true, index: true },
      country: { type: String, default: "India", trim: true },
    },

    // ─── Puja Type ───
    pujaType: {
      type: String,
      enum: [
        "Physical",
        "Virtual",
        "live_virtual_puja",
        "sankalp_prasad_puja",
        "at_home_pandit",
      ],
      required: true,
      index: true,
    },

    // ─── Pricing (multiple packages) ───
    pricing: {
      single: { type: Number, default: 0, min: 0 },
      family: { type: Number, default: 0, min: 0 },
      group: { type: Number, default: 0, min: 0 },
      premium: { type: Number, default: 0, min: 0 },
    },

    // ─── Base price (fallback) ───
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
      index: true,
    },

    // ─── Media ───
    image: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },

    // ─── Description ───
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description too long"],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Short description too long"],
    },

    // ─── SEO / Discoverability ───
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
    },

    // ─── Details ───
    duration: {
      type: String,
      default: "",
    },
    benefits: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: "Hindi",
    },

    // ═══════════════════════════════════════
    //   ⭐ SLOT MANAGEMENT (NEW)
    // ═══════════════════════════════════════
    slots: {
      type: [
        {
          name: {
            type: String,
            required: true,
            enum: ["morning", "afternoon", "evening"],
          },
          time: { type: String, required: true },
          maxBookings: { type: Number, default: 20, min: 1 },
        },
      ],
      default: [
        { name: "morning", time: "06:00 AM - 09:00 AM", maxBookings: 20 },
        { name: "afternoon", time: "12:00 PM - 03:00 PM", maxBookings: 20 },
        { name: "evening", time: "05:00 PM - 08:00 PM", maxBookings: 20 },
      ],
    },

    // ═══════════════════════════════════════
    //   ⭐ CAPACITY LIMITS (NEW)
    // ═══════════════════════════════════════
    maxBookingsPerDay: {
      type: Number,
      default: 50,
      min: 1,
    },

    bookingCutoffHours: {
      type: Number,
      default: 24,
      min: 0,
    },

    // ─── Stats ───
    bookingCount: {
      type: Number,
      default: 0,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },

    // ─── Status ───
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"],
      default: "active",
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ─── Soft delete ───
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // ─── Audit ───
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

PoojaListSchema.index({
  PujaName: "text",
  templeName: "text",
  description: "text",
  tags: "text",
});

PoojaListSchema.index({ pujaType: 1, status: 1, isDeleted: 1 });
PoojaListSchema.index({ "location.city": 1, pujaType: 1, status: 1 });
PoojaListSchema.index({ price: 1, status: 1 });
PoojaListSchema.index({ isFeatured: -1, bookingCount: -1, status: 1 });
PoojaListSchema.index({ createdAt: -1 });

PoojaListSchema.index(
  { PujaName: 1, templeName: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// ═══════════════════════════════════════
//   VIRTUALS
// ═══════════════════════════════════════

PoojaListSchema.virtual("startingPrice").get(function () {
  const prices = Object.values(this.pricing || {}).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : this.price;
});

// ⭐ Total daily capacity
PoojaListSchema.virtual("totalDailyCapacity").get(function () {
  if (!this.slots || this.slots.length === 0) return this.maxBookingsPerDay;
  const slotSum = this.slots.reduce((sum, s) => sum + (s.maxBookings || 0), 0);
  return Math.min(slotSum, this.maxBookingsPerDay);
});

// ═══════════════════════════════════════
//   MIDDLEWARES
// ═══════════════════════════════════════

PoojaListSchema.pre("save", function (next) {
  if (this.isModified("PujaName") || !this.slug) {
    this.slug = this.PujaName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 200);
  }
  next();
});

PoojaListSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// ═══════════════════════════════════════
//   STATIC METHODS
// ═══════════════════════════════════════

PoojaListSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, status: "active", isDeleted: false });
};

PoojaListSchema.statics.searchPoojas = function (query, options = {}) {
  const { page = 1, limit = 20, sortBy = "bookingCount", order = -1 } = options;
  const skip = (page - 1) * limit;

  const filter = {
    status: "active",
    isDeleted: false,
  };

  if (query) {
    filter.$text = { $search: query };
  }

  return this.find(filter)
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(limit)
    .lean();
};

export default mongoose.model("PoojaInfo", PoojaListSchema);