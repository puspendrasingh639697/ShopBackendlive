import mongoose from "mongoose";

const PoojaListSchema = new mongoose.Schema({
    PujaName: {
        type: String,
        required: true
    },
    templeName: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    pujaType: {
        type: String,
        enum: ['Physical', 'Virtual', 'live_virtual_puja', 'sankalp_prasad_puja'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    description: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model("PoojaInfo", PoojaListSchema);