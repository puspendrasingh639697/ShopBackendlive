// models/ChadhavaModel.js
import mongoose from "mongoose";

const ChadhavaSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    shortDescription: { type: String, maxlength: 300 },
    description: { type: String, maxlength: 5000 },

    // ─── Chadhava Type (30 types) ───
    chadhavaType: {
      type: String,
      enum: [
        "phool",             // 1. Flowers, gajra, mala
        "vastra",            // 2. Chunri, saree, dhoti, patka
        "prasad",            // 3. Mithai, laddoo, peda
        "nariyal",           // 4. Sabut nariyal
        "sindoor",           // 5. Sindoor, kumkum, chandan
        "itra",              // 6. Itra, gulab jal
        "deepak",            // 7. Diya, ghee, tel
        "bhog",              // 8. Kheer, halwa, puri
        "chunri",            // 9. Devi ke liye chunri
        "mala",              // 10. Moti mala, sphatik mala
        "gangajal",          // 11. Ganga jal, kawad
        "belpatra",          // 12. Belpatra, dhatura
        "cow_seva",          // 13. Gaumata seva, chara, ghee
        "ghee",              // 14. Desi ghee, batasha
        "kapoor_aarti",      // 15. Kapoor, aarti thali
        "dhoop_agarbatti",   // 16. Dhoop, agarbatti
        "mishri_batasha",    // 17. Mishri, batasha, makhana
        "fal",               // 18. Fal, sabzi
        "vastra_bhagwan",    // 19. Pitambar, mukut, chhatra
        "chhatra_aasan",     // 20. Chhatra, aasan, gaddi
        "mukut_shringar",    // 21. Mukut, shringar samagri
        "palki_chhappan_bhog", // 22. Palki, chhappan bhog
        "annadaan",          // 23. Bhandara, anna daan
        "deep_daan",         // 24. Deep, jyoti
        "vastra_daan",       // 25. Kapde daan
        "shringar",          // 26. Shringar samagri (Devi)
        "kalash",            // 27. Kalash, jal, nariyal
        "havan",             // 28. Havan samagri
        "pindi_shivling",    // 29. Jal, belpatra, dhatura
        "charanamrit",
            "brahman_bhoj",         // ⭐ Ye add karo (with j)
    "brahman_bhog",         // 30. Charanamrit, tulsi
        "other",             // 31. Other
      ],
      required: true,
      index: true,
    },

    // ─── Temple & Deity ───
    templeName: { type: String, required: true, index: true },
    templeId: { type: String, default: null, index: true },
    deity: {
      type: String,
      enum: [
        "shiva",
        "vishnu",
        "devi",
        "ganesh",
        "hanuman",
        "krishna",
        "ram",
        "durga",
        "lakshmi",
        "saraswati",
        "sai_baba",
        "other",
      ],
      default: "other",
      index: true,
    },

    // ─── Location ───
    location: {
      city: { type: String, index: true },
      state: { type: String, index: true },
      country: { type: String, default: "India" },
    },

    // ─── Pricing ───
    price: { type: Number, required: true, min: 0 },
    samagriCharge: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // ─── What's Included ───
    inclusions: { type: [String], default: [] },
    samagriList: { type: [String], default: [] },
    benefits: { type: [String], default: [] },

    // ─── Media ───
    image: { type: String, default: "" },
    images: { type: [String], default: [] },

    // ─── Delivery Options ───
    deliveryType: {
      type: String,
      enum: ["temple", "home", "video"],
      default: "temple",
    },
    deliveryTime: { type: String, default: "Same day" },
    videoProvided: { type: Boolean, default: true },
    prasadProvided: { type: Boolean, default: false },
    prasadDeliveryCharge: { type: Number, default: 0 },

    // ─── Slots ───
    slots: {
      type: [
        {
          name: { type: String, enum: ["morning", "afternoon", "evening"] },
          time: { type: String },
          maxBookings: { type: Number, default: 50 },
        },
      ],
      default: [
        { name: "morning", time: "06:00 AM - 09:00 AM", maxBookings: 50 },
        { name: "afternoon", time: "12:00 PM - 03:00 PM", maxBookings: 50 },
        { name: "evening", time: "05:00 PM - 08:00 PM", maxBookings: 50 },
      ],
    },

    maxBookingsPerDay: { type: Number, default: 100 },
    bookingCutoffHours: { type: Number, default: 24 },

    // ─── Stats ───
    bookingCount: { type: Number, default: 0, index: true },
    viewCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },

    // ─── Status ───
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"],
      default: "active",
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    // ─── Audit ───
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

ChadhavaSchema.index({
  name: "text",
  description: "text",
  templeName: "text",
});
ChadhavaSchema.index({ chadhavaType: 1, status: 1, isDeleted: 1 });
ChadhavaSchema.index({ templeName: 1, status: 1 });
ChadhavaSchema.index({ deity: 1, status: 1 });
ChadhavaSchema.index({ "location.city": 1, status: 1 });
ChadhavaSchema.index({ price: 1, status: 1 });
ChadhavaSchema.index({ isFeatured: -1, bookingCount: -1, status: 1 });

// ═══════════════════════════════════════
//   VIRTUALS
// ═══════════════════════════════════════

ChadhavaSchema.virtual("totalWithPrasad").get(function () {
  return this.totalAmount + (this.prasadDeliveryCharge || 0);
});

// ═══════════════════════════════════════
//   MIDDLEWARES
// ═══════════════════════════════════════

ChadhavaSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 180);
  }
  next();
});

ChadhavaSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

export default mongoose.models.Chadhava ||
  mongoose.model("Chadhava", ChadhavaSchema);