// // import Razorpay from 'razorpay';
// // import crypto from 'crypto';
// // import Order from '../models/Order.js';
// // import Coupon from '../models/Coupon.js';

// // const instance = new Razorpay({
// //     key_id: process.env.RAZORPAY_KEY_ID,
// //     key_secret: process.env.RAZORPAY_KEY_SECRET,
// // });

// // // 1. Checkout (Order ID generate karna + Coupon apply karna)
// // export const checkout = async (req, res) => {
// //     try {
// //         let { amount, couponCode, orderId } = req.body; 
// //         let discountApplied = 0;

// //         // 🔥 Coupon Logic (e.g., 60% off for First Order)
// //         if (couponCode) {
// //             const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
// //             if (!coupon) {
// //                 return res.status(400).json({ message: "Invalid Coupon!" });
// //             }

// //             if (coupon.isFirstOrderOnly) {
// //                 const pastOrders = await Order.countDocuments({ user: req.user._id, isPaid: true });
// //                 if (pastOrders > 0) {
// //                     return res.status(400).json({ message: "Only for first order!" });
// //                 }
// //             }

// //             discountApplied = (amount * coupon.discountPercent) / 100;
// //             amount = amount - discountApplied;
// //         }

// //         const options = {
// //             amount: Math.round(amount * 100), // Amount in paise
// //             currency: "INR",
// //             receipt: `rcpt_${orderId}`
// //         };

// //         const razorpayOrder = await instance.orders.create(options);

// //         // 🔗 ZAROORI: Apne Order model mein Razorpay Order ID update karo
// //         await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });

// //         res.status(200).json({ 
// //             success: true, 
// //             order: razorpayOrder, 
// //             discount: discountApplied, 
// //             finalAmount: amount 
// //         });
// //     } catch (error) {
// //         res.status(500).json({ message: error.message });
// //     }
// // };

// // // 2. Verification (Payment confirm karna)
// // export const paymentVerification = async (req, res) => {
// //     try {
// //         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

// //         const body = razorpay_order_id + "|" + razorpay_payment_id;
// //         const expectedSignature = crypto
// //             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
// //             .update(body.toString())
// //             .digest("hex");

// //         if (expectedSignature === razorpay_signature) {
// //             // ✅ Payment successful, update database
// //             await Order.findOneAndUpdate(
// //                 { razorpayOrderId: razorpay_order_id },
// //                 { 
// //                     isPaid: true, 
// //                     paidAt: Date.now(),
// //                     paymentMethod: 'Razorpay', // Multiple methods support (UPI/Card handled by Razorpay)
// //                     status: 'Processing' // Order confirm ho gaya
// //                 }
// //             );

// //             res.status(200).json({ success: true, message: "Payment Verified!" });
// //         } else {
// //             res.status(400).json({ success: false, message: "Fraud detected! Signature mismatch." });
// //         }
// //     } catch (error) {
// //         res.status(500).json({ message: error.message });
// //     }
// // };


// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import Order from '../models/Order.js';
// import Coupon from '../models/Coupon.js';
// import sendEmail from '../utils/sendEmail.js'; // 👈 Notification ke liye import

// const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // 1. Checkout (Order ID generate karna + Coupon apply karna)
// export const checkout = async (req, res) => {
//     try {
//         let { amount, couponCode, orderId } = req.body; 
//         let discountApplied = 0;

//         // 🔥 Coupon Logic
//         if (couponCode) {
//             const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
//             if (!coupon) {
//                 return res.status(400).json({ message: "Invalid Coupon!" });
//             }

//             // First Order Check logic
//             if (coupon.isFirstOrderOnly) {
//                 const pastOrders = await Order.countDocuments({ user: req.user._id, isPaid: true });
//                 if (pastOrders > 0) {
//                     return res.status(400).json({ message: "Only for first order!" });
//                 }
//             }

//             discountApplied = (amount * coupon.discountPercent) / 100;
//             amount = amount - discountApplied;
//         }

//         const options = {
//             amount: Math.round(amount * 100), // Amount in paise
//             currency: "INR",
//             receipt: `rcpt_${orderId}`
//         };

//         const razorpayOrder = await instance.orders.create(options);

//         // ZAROORI: Razorpay Order ID ko DB mein save karo
//         await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });

//         res.status(200).json({ 
//             success: true, 
//             order: razorpayOrder, 
//             discount: discountApplied, 
//             finalAmount: amount 
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // 2. Verification (Payment confirm karna + Notification bhejna)
// export const paymentVerification = async (req, res) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest("hex");

//         if (expectedSignature === razorpay_signature) {
//             // ✅ Database update karo aur user details populate karo email ke liye
//             const order = await Order.findOneAndUpdate(
//                 { razorpayOrderId: razorpay_order_id },
//                 { 
//                     isPaid: true, 
//                     paidAt: Date.now(),
//                     paymentMethod: 'Razorpay',
//                     status: 'Processing' 
//                 },
//                 { new: true }
//             ).populate('user', 'name email');

//             // 📧 3.11 Notification System: Payment Status Alert
//             try {
//                 await sendEmail({
//                     email: order.user.email,
//                     subject: "Payment Confirmed! 💳 - Noida E-Shop",
//                     message: `Hello ${order.user.name}, humein aapki ₹${order.totalPrice} ki payment mil gayi hai. \n\nTransaction ID: ${razorpay_payment_id} \nStatus: Order Processing mein hai.`
//                 });
//             } catch (mailError) {
//                 console.log("Email notification failed but payment updated.");
//             }

//             res.status(200).json({ success: true, message: "Payment Verified! Notification Sent." });
//         } else {
//             res.status(400).json({ success: false, message: "Fraud detected! Signature mismatch." });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import Order from '../models/Order.js';
// import Coupon from '../models/Coupon.js';

// const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // 1. Checkout (Order ID generate karna + Coupon apply karna)
// export const checkout = async (req, res) => {
//     try {
//         let { amount, couponCode, orderId } = req.body; 
//         let discountApplied = 0;

//         // 🔥 Coupon Logic (e.g., 60% off for First Order)
//         if (couponCode) {
//             const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
//             if (!coupon) {
//                 return res.status(400).json({ message: "Invalid Coupon!" });
//             }

//             if (coupon.isFirstOrderOnly) {
//                 const pastOrders = await Order.countDocuments({ user: req.user._id, isPaid: true });
//                 if (pastOrders > 0) {
//                     return res.status(400).json({ message: "Only for first order!" });
//                 }
//             }

//             discountApplied = (amount * coupon.discountPercent) / 100;
//             amount = amount - discountApplied;
//         }

//         const options = {
//             amount: Math.round(amount * 100), // Amount in paise
//             currency: "INR",
//             receipt: `rcpt_${orderId}`
//         };

//         const razorpayOrder = await instance.orders.create(options);

//         // 🔗 ZAROORI: Apne Order model mein Razorpay Order ID update karo
//         await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });

//         res.status(200).json({ 
//             success: true, 
//             order: razorpayOrder, 
//             discount: discountApplied, 
//             finalAmount: amount 
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // 2. Verification (Payment confirm karna)
// export const paymentVerification = async (req, res) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest("hex");

//         if (expectedSignature === razorpay_signature) {
//             // ✅ Payment successful, update database
//             await Order.findOneAndUpdate(
//                 { razorpayOrderId: razorpay_order_id },
//                 { 
//                     isPaid: true, 
//                     paidAt: Date.now(),
//                     paymentMethod: 'Razorpay', // Multiple methods support (UPI/Card handled by Razorpay)
//                     status: 'Processing' // Order confirm ho gaya
//                 }
//             );

//             res.status(200).json({ success: true, message: "Payment Verified!" });
//         } else {
//             res.status(400).json({ success: false, message: "Fraud detected! Signature mismatch." });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


import crypto from 'crypto';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import sendEmail from '../utils/sendEmail.js'; 
import axios from 'axios';

// 1. Checkout (Payment Initiate karna)
export const checkout = async (req, res) => {
    try {
        let { amount, couponCode, orderId, name, email, phone, txnid } = req.body; 
        let discountApplied = 0;

        // Coupon Logic
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            if (!coupon) return res.status(400).json({ message: "Invalid Coupon!" });

            if (coupon.isFirstOrderOnly) {
                const pastOrders = await Order.countDocuments({ user: req.user._id, isPaid: true });
                if (pastOrders > 0) return res.status(400).json({ message: "Only for first order!" });
            }
            discountApplied = (amount * coupon.discountPercent) / 100;
            amount = amount - discountApplied;
        }

        // Hash generate karne ka logic (Easebuzz requirement)
        const hashString = `${process.env.EASEBUZZ_KEY}|${txnid}|${amount}|ProductInfo|${name}|${email}|||||||||||${process.env.EASEBUZZ_SALT}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        // API Call to Easebuzz
        const response = await axios.post('https://pay.easebuzz.in/payment/initiateLink', {
            key: process.env.EASEBUZZ_KEY,
            txnid: txnid,
            amount: amount,
            productinfo: "ProductInfo",
            firstname: name,
            email: email,
            phone: phone,
            hash: hash,
            surl: "https://piyush-sir.onrender.com/api/payment/verification",
            furl: "https://piyush-sir.onrender.com/api/payment/failure"
        });

        // Order update karo
        await Order.findByIdAndUpdate(orderId, { txnid: txnid });

        res.status(200).json({ success: true, payment_url: response.data.data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Verification (Easebuzz Callback)
export const paymentVerification = async (req, res) => {
    try {
        const { status, txnid, amount, hash, email, firstname, productinfo } = req.body;

        // Easebuzz Hash Verify (sha512)
        const hashString = `${process.env.EASEBUZZ_SALT}|${status}||||||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.EASEBUZZ_KEY}`;
        const checkHash = crypto.createHash('sha512').update(hashString).digest('hex');

        if (checkHash === hash && status === 'success') {
            const order = await Order.findOneAndUpdate(
                { txnid: txnid },
                { isPaid: true, paidAt: Date.now(), paymentMethod: 'Easebuzz', status: 'Processing' },
                { new: true }
            ).populate('user', 'name email');

            // Notification
            try {
                await sendEmail({
                    email: order.user.email,
                    subject: "Payment Confirmed! 💳 - Noida E-Shop",
                    message: `Hello ${order.user.name}, payment mil gayi hai. ID: ${txnid}`
                });
            } catch (mailError) {
                console.log("Email failed");
            }

            res.status(200).json({ success: true, message: "Payment Verified!" });
        } else {
            res.status(400).json({ success: false, message: "Hash mismatch!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};