// import mongoose from "mongoose";

// const BookPoojaSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//         index: true
//     },
//     poojaId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "PoojaDetails",
//         required: true,
//         index: true
//     },
//     templeID: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "TempleDetails",
//     },
//     names: {
//     type: [String],
//     required: true
// },
//     phoneNumber: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     gotra: {
//         type: String,
//         default: "Gotra not specified"
//     },
//     pujaType: {
//         type: String,
//         required: true,
//         enum: ['live_virtual_puja', 'sankalp_prasad_puja', 'at_home_pandit'],
//         default: 'sankalp_prasad_puja'
//     },
//     packageType: {
//         type: String,
//         required: true
//     },
//     totalAmount: {
//         type: Number,
//         required: true
//     },
//     dateOfPooja: {
//         type: Date,
//         required: true
//     },
//     address: {
//         type: String,
//     },
//     status: {
//         type: String,
//         enum: ["booked", "pending", "cancelled", "completed"],
//         default: "pending",
//         index: true
//     },
//     paymentStatus: {
//         type: String,
//         enum: ['pending', 'success', 'failed', 'refunded'],
//         default: "pending"
//     },
//     razorpayOrderId: {
//         type: String
//     },
//     razorpayPaymentId: {
//         type: String
//     }
// }, { timestamps: true });

// const Bookpooja = mongoose.models.Bookpooja || mongoose.model("Bookpooja", BookPoojaSchema);

// export default Bookpooja;
import mongoose from "mongoose";

const BookPoojaSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    poojaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PoojaDetails",
        required: true,
        index: true
    },
    templeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TempleDetails",
    },
    names: {
        type: [String],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    gotra: {
        type: String,
        default: "Gotra not specified"
    },
    pujaType: {
        type: String,
        required: true,
        enum: ['live_virtual_puja', 'sankalp_prasad_puja', 'at_home_pandit'],
        default: 'sankalp_prasad_puja'
    },
    packageType: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    dateOfPooja: {
        type: Date,
        required: true
    },
    address: {
        type: String,
    },
    status: {
        type: String,
        // 'confirmed' add kiya hai taaki payment ke baad error na aaye
        enum: ["booked", "pending", "confirmed", "cancelled", "completed"],
        default: "pending",
        index: true
    },
    paymentStatus: {
        type: String,
        // 'paid' aur 'success' dono allow kar diye hain
        enum: ['pending', 'paid', 'success', 'failed', 'refunded'],
        default: "pending"
    },
    razorpayOrderId: {
        type: String,
        index: true // Webhook ke liye fast lookup ke zaroori hai
    },
    razorpayPaymentId: {
        type: String
    }
}, { timestamps: true });

// 1M Users scale ke liye Compound Index (User ki history fast load karne ke liye)
BookPoojaSchema.index({ userId: 1, createdAt: -1 });

const Bookpooja = mongoose.models.Bookpooja || mongoose.model("Bookpooja", BookPoojaSchema);

export default Bookpooja;