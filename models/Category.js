import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Category name is required"], 
        unique: true,
        trim: true,
        index: true // ✅ 1M+ Scale: Fast search by category name
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        index: true 
    },
    description: { 
        type: String, 
        default: "" 
    },
    image: { 
        type: String, 
        default: "" 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);