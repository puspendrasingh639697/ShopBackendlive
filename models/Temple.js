import mongoose from 'mongoose';

const templeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String }, 
  address: { type: String, required: true },
  
  // 🔥 Location (GeoJSON format)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
      required: true
    }
  },
  
  aartiTimings: [{ type: String }], // e.g. ["6:00 AM", "7:00 PM"]
  deity: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

templeSchema.index({ location: "2dsphere" }); // Search ke liye zaroori

export default mongoose.model('Temple', templeSchema);