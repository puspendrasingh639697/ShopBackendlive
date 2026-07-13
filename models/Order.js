// import mongoose from 'mongoose';

// const orderSchema = mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
//     orderItems: [
//       {
//         name: { type: String, required: true },
//         qty: { type: Number, required: true },
//         image: { type: String, required: true },
//         price: { type: Number, required: true },
//         productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
//       },
//     ],
//     shippingAddress: {
//       street: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       zipCode: { type: String, required: true },
//       lat: { type: Number, default: 0 },
//       lng: { type: Number, default: 0 },
//     },
//     paymentMethod: { type: String, required: true, default: 'Razorpay' },
//     totalPrice: { type: Number, required: true, default: 0.0 },
    
//     // --- Tracking & Notification Fields ---
//     isPaid: { type: Boolean, required: true, default: false },
//     paidAt: { type: Date }, // Payment kab hui uska record

//     status: { 
//         type: String, 
//         required: true, 
//         default: 'Processing',
//         enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'] // Inke bahar koi status nahi hona chahiye
//     },

//     isDelivered: { type: Boolean, required: true, default: false },
//     deliveredAt: { type: Date }, // Actual delivery date tracking

//     isCancelled: { type: Boolean, required: true, default: false },
//     cancelledAt: { type: Date }, // Cancellation ka time record karne ke liye
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model('Order', orderSchema);
// export default Order;


import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    
    // Easebuzz ke liye update kiya gaya
    paymentMethod: { type: String, required: true, default: 'Easebuzz' },
    txnid: { type: String }, // Easebuzz Transaction ID store karne ke liye
    totalPrice: { type: Number, required: true, default: 0.0 },
    
    // --- Tracking & Notification Fields ---
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date }, 

    status: { 
        type: String, 
        required: true, 
        default: 'Processing',
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled']
    },

    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date }, 

    isCancelled: { type: Boolean, required: true, default: false },
    cancelledAt: { type: Date }, 
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;