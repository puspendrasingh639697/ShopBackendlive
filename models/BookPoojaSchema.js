// import mongoose from "mongoose";

// const BookPoojaSchema = new mongoose.Schema({
//     templeID: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "TempleDetails",
//     },
//     name: [String], 
//     poojaId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "PoojaDetails",
//         required: true
//     },
//     pujaType: {
//         type: String,
//         required: true,
//         enum: ['live_virtual_puja', 'sankalp_prasad_puja', 'at_home_pandit'],
//         default: 'sankalp_prasad_puja'
//     },
//     dateOfPooja: {
//         type: String,
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     gotra: {
//         type: String,
//     },
//     packageId: {
//         type: String,
//     },
//     address: {
//         type: String,
//     },
//     status: {
//         type: String,
//         enum: ["booked", "pending", "cancelled", "completed"],
//         default: "pending"
//     },
//     paymentStatus: {
//         type: String,
//         enum: ['pending', 'success', 'failed', 'refunded'],
//         default: "pending"
//     },
// }, { timestamps: true });

// export default mongoose.model("Bookpooja", BookPoojaSchema);