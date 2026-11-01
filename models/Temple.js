// const mongoose = require('mongoose');

// const templeSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   normalizedName: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   city: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   state: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   country: {
//     type: String,
//     default: 'India'
//   },
//   address: {
//     type: String,
//     default: null
//   },
//   latitude: {
//     type: Number,
//     required: true
//   },
//   longitude: {
//     type: Number,
//     required: true
//   },
//   deity: {
//     type: String,
//     default: 'other'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, { timestamps: true });

// // ── Indexes (production ke liye zaroori) ──
// templeSchema.index({ normalizedName: 1 }, { unique: true });
// templeSchema.index({ isActive: 1 });
// templeSchema.index({ latitude: 1, longitude: 1 });

// module.exports = mongoose.model('Temple', templeSchema);


import mongoose from "mongoose";

const templeSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───
    name: {
      type: String,
      required: [true, "Temple name is required"],
      trim: true,
      index: true,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    // ─── Location ───
    address: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
      index: true,
    },
    state: {
      type: String,
      default: null,
      index: true,
    },
    country: {
      type: String,
      default: "India",
    },

    // ─── GeoJSON (nearby search ke liye) ───
    // ⚠️ ORDER: [longitude, latitude] — ULTA hota hai
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: "coordinates must be [longitude, latitude]",
        },
      },
    },

    // ─── Convenience fields (seedha access) ───
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },

    // ─── Temple details ───
    deity: {
      type: String,
      default: "other",
      index: true,
    },
    image: {
      type: String,
      default: "",
    },
    aartiTimings: [
      {
        name: { type: String },
        time: { type: String },
      },
    ],

    // ─── Status ───
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

templeSchema.index({ normalizedName: 1 }, { unique: true });
templeSchema.index({ isActive: 1 });
templeSchema.index({ "location": "2dsphere" }); // nearby search ke liye
templeSchema.index({ name: "text", city: "text", state: "text" });

// ═══════════════════════════════════════
//   MIDDLEWARES
// ═══════════════════════════════════════

// Auto-fill: name → normalizedName, lat/lng → location
templeSchema.pre("save", function (next) {
  // Auto-generate normalizedName
  if (this.isModified("name") || !this.normalizedName) {
    this.normalizedName = this.name.toLowerCase().trim().replace(/\s+/g, " ");
  }

  // Auto-fill location from lat/lng
  if (
    this.isModified("latitude") ||
    this.isModified("longitude") ||
    !this.location?.coordinates
  ) {
    if (
      typeof this.latitude === "number" &&
      typeof this.longitude === "number"
    ) {
      this.location = {
        type: "Point",
        coordinates: [this.longitude, this.latitude], // ⚠️ [lng, lat]
      };
    }
  }

  // Auto-fill lat/lng from location (reverse)
  if (this.isModified("location") && this.location?.coordinates?.length === 2) {
    this.longitude = this.location.coordinates[0];
    this.latitude = this.location.coordinates[1];
  }

  next();
});

// ═══════════════════════════════════════
//   EXPORT
// ═══════════════════════════════════════

const Temple = mongoose.models.Temple || mongoose.model("Temple", templeSchema);

export default Temple;