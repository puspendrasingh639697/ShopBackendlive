// // import crypto from 'crypto';
// // import Order from '../models/Order.js';
// // import Coupon from '../models/Coupon.js';
// // import sendEmail from '../utils/sendEmail.js'; 
// // import axios from 'axios';

// // export const checkout = async (req, res) => {
// //     try {
// //         let { amount, couponCode, orderId, name, email, phone, txnid } = req.body;
// //         let discountApplied = 0;

// //         console.log('📦 Easebuzz Request:', { amount, couponCode, orderId });

// //         // Coupon Logic
// //         if (couponCode) {
// //             const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
// //             if (!coupon) {
// //                 return res.status(400).json({ 
// //                     success: false,
// //                     message: "Invalid Coupon!" 
// //                 });
// //             }

// //             if (coupon.isFirstOrderOnly) {
// //                 const pastOrders = await Order.countDocuments({ 
// //                     user: req.user._id, 
// //                     isPaid: true 
// //                 });
// //                 if (pastOrders > 0) {
// //                     return res.status(400).json({ 
// //                         success: false,
// //                         message: "Only for first order!" 
// //                     });
// //                 }
// //             }
// //             discountApplied = (amount * coupon.discountPercent) / 100;
// //             amount = amount - discountApplied;
// //         }

// //         const finalAmount = parseFloat(amount).toFixed(2);

// //         // Hash generate
// //         const hashString = `${process.env.EASEBUZZ_KEY}|${txnid}|${finalAmount}|ProductInfo|${name}|${email}|||||||||||${process.env.EASEBUZZ_SALT}`;
// //         const hash = crypto.createHash('sha512').update(hashString).digest('hex');

// //         const params = new URLSearchParams();
// //         params.append('key', process.env.EASEBUZZ_KEY);
// //         params.append('txnid', txnid);
// //         params.append('amount', finalAmount);
// //         params.append('productinfo', "ProductInfo");
// //         params.append('firstname', name);
// //         params.append('email', email);
// //         params.append('phone', phone);
// //         params.append('hash', hash);

// //         const baseUrl = process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com';
// //         params.append('surl', `${baseUrl}/api/payment/easebuzz/callback`);
// //         params.append('furl', `${baseUrl}/api/payment/easebuzz/failure`);

// //         console.log('🚀 Sending to Easebuzz...');

// //         // ✅ FIX: Timeout increase + better error handling
// //         let response;
// //         try {
// //             response = await axios.post('https://pay.easebuzz.in/payment/initiateLink', params, {
// //                 headers: {
// //                     'Content-Type': 'application/x-www-form-urlencoded'
// //                 },
// //                  timeout: 180000  // ✅ 120 seconds (2 minutes)
// //             });
// //         } catch (axiosError) {
// //             console.error('❌ Easebuzz API Error:', axiosError.message);
            
// //             // ✅ Fallback to COD
// //             return res.status(200).json({
// //                 success: false,
// //                 message: 'Payment gateway timeout. Please use COD.',
// //                 fallback: 'cod',
// //                 orderId: orderId
// //             });
// //         }

// //         // Update Order
// //         await Order.findByIdAndUpdate(orderId, {
// //             txnid: txnid,
// //             paymentMethod: 'Easebuzz'
// //         });

// //         console.log('✅ Easebuzz Response:', response.data?.data?.substring(0, 100));

// //         res.status(200).json({
// //             success: true,
// //             payment_url: response.data.data,
// //             txnid: txnid,
// //             orderId: orderId
// //         });

// //     } catch (error) {
// //         console.error('❌ Easebuzz Error:', error.message);
        
// //         res.status(500).json({
// //             success: false,
// //             message: error.message || 'Payment initiation failed'
// //         });
// //     }
// // };

// // // ✅ 2. Payment Verification - Easebuzz Callback
// // // backend/controllers/paymentController.js

// // export const paymentVerification = async (req, res) => {
// //     try {
// //         const { status, txnid, amount, hash, email, firstname, productinfo } = req.body;

// //         console.log('🔔 Easebuzz Callback:', req.body);

// //         // ✅ FIX: Agar data missing hai toh error bhejo
// //         if (!status || !txnid || !hash) {
// //             console.log('❌ Missing callback data:', req.body);
// //             const baseUrl = process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com';
// //             return res.redirect(`${baseUrl}/payment-failure?error=Invalid%20callback%20data`);
// //         }

// //         // Easebuzz Hash Verify
// //         const hashString = `${process.env.EASEBUZZ_SALT}|${status}||||||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.EASEBUZZ_KEY}`;
// //         const checkHash = crypto.createHash('sha512').update(hashString).digest('hex');

// //         console.log('🔐 Hash Check:', { 
// //             received: hash, 
// //             calculated: checkHash,
// //             match: checkHash === hash 
// //         });

// //         if (checkHash === hash && status === 'success') {
// //             // ✅ Payment Success
// //             const order = await Order.findOneAndUpdate(
// //                 { txnid: txnid },
// //                 { 
// //                     isPaid: true, 
// //                     paidAt: Date.now(), 
// //                     paymentMethod: 'Easebuzz',
// //                     paymentStatus: 'Completed',
// //                     status: 'Processing' 
// //                 },
// //                 { new: true }
// //             ).populate('user', 'name email');

// //             if (!order) {
// //                 console.log('❌ Order not found for txnid:', txnid);
// //                 const baseUrl = process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com';
// //                 return res.redirect(`${baseUrl}/payment-failure?error=Order%20not%20found`);
// //             }

// //             // Email Notification
// //             try {
// //                 await sendEmail({
// //                     email: order.user.email,
// //                     subject: "✅ Payment Confirmed! - The Loot Bazaar",
// //                     message: `Hello ${order.user.name},\n\nYour payment of ₹${order.totalPrice} has been confirmed.\nTransaction ID: ${txnid}\n\nThank you for shopping with us! 🎉`
// //                 });
// //             } catch (mailError) {
// //                 console.log("Email failed but payment updated");
// //             }

// //             // Redirect to success page
// //             const baseUrl = process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com';
// //             return res.redirect(`${baseUrl}/payment-success?txnid=${txnid}`);

// //         } else {
// //             // ❌ Payment Failed
// //             console.log('❌ Payment Failed:', { status, hash, checkHash });
// //             const baseUrl = process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com';
// //             return res.redirect(`${baseUrl}/payment-failure?txnid=${txnid}`);
// //         }

// //     } catch (error) {
// //         console.error('Verification Error:', error);
// //         const baseUrl = process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com';
// //         return res.redirect(`${baseUrl}/payment-failure?error=${error.message}`);
// //     }
// // };

// // // ✅ 3. Payment Failure Handler (Optional)
// // export const paymentFailure = async (req, res) => {
// //     try {
// //         const { txnid, status, error } = req.body;
// //         console.log('❌ Payment Failure:', { txnid, status, error });
        
// //         // Update order status
// //         if (txnid) {
// //             await Order.findOneAndUpdate(
// //                 { txnid: txnid },
// //                 { 
// //                     paymentStatus: 'Failed',
// //                     status: 'Pending'
// //                 }
// //             );
// //         }

// //         const baseUrl = process.env.FRONTEND_URL || 'https://piyush-sir.onrender.com';
// //         return res.redirect(`${baseUrl}/payment-failure?txnid=${txnid}`);
// //     } catch (error) {
// //         console.error('Payment Failure Error:', error);
// //         res.status(500).json({ 
// //             success: false,
// //             message: error.message 
// //         });
// //     }
// // };

// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import Order from '../models/Order.js';
// import Coupon from '../models/Coupon.js';
// import sendEmail from '../utils/sendEmail.js';

// // Initialize Razorpay Instance
// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // ✅ 1. Checkout / Create Razorpay Order
// export const checkout = async (req, res) => {
//     try {
//         let { amount, couponCode, orderId } = req.body;
//         let discountApplied = 0;

//         console.log('📦 Razorpay Checkout Request:', { amount, couponCode, orderId });

//         // Coupon Logic (Aapka purana logic bilkul safe hai)
//         if (couponCode) {
//             const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
//             if (!coupon) {
//                 return res.status(400).json({ 
//                     success: false,
//                     message: "Invalid Coupon!" 
//                 });
//             }

//             if (coupon.isFirstOrderOnly) {
//                 const pastOrders = await Order.countDocuments({ 
//                     user: req.user._id, 
//                     isPaid: true 
//                 });
//                 if (pastOrders > 0) {
//                     return res.status(400).json({ 
//                         success: false,
//                         message: "Only for first order!" 
//                     });
//                 }
//             }
//             discountApplied = (amount * coupon.discountPercent) / 100;
//             amount = amount - discountApplied;
//         }

//         const finalAmount = Math.round(Number(amount) * 100); // Razorpay paise mein leta hai

//         // Razorpay Order Options
//         const options = {
//             amount: finalAmount, 
//             currency: "INR",
//             receipt: `receipt_${orderId || Date.now()}`
//         };

//         const razorpayOrder = await razorpayInstance.orders.create(options);

//         // Update Order with Razorpay Order ID
//         if (orderId) {
//             await Order.findByIdAndUpdate(orderId, {
//                 razorpayOrderId: razorpayOrder.id,
//                 paymentMethod: 'Razorpay'
//             });
//         }

//         console.log('🚀 Razorpay Order Created:', razorpayOrder.id);

//         res.status(200).json({
//             success: true,
//             order: razorpayOrder,
//             key: process.env.RAZORPAY_KEY_ID,
//             orderId: orderId
//         });

//     } catch (error) {
//         console.error('❌ Razorpay Checkout Error:', error.message);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Payment initiation failed'
//         });
//     }
// };

// // ✅ 2. Payment Verification & Order Update
// export const paymentVerification = async (req, res) => {
//     try {
//         const { 
//             razorpay_order_id, 
//             razorpay_payment_id, 
//             razorpay_signature, 
//             orderId 
//         } = req.body;

//         console.log('🔔 Verifying Razorpay Payment:', { razorpay_order_id, orderId });

//         // Security Signature Check
//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest('hex');

//         const isAuthentic = expectedSignature === razorpay_signature;

//         if (isAuthentic) {
//             // Payment Successful
//             const order = await Order.findById(orderId).populate('user', 'name email');

//             if (!order) {
//                 return res.status(404).json({ 
//                     success: false, 
//                     message: "Order not found!" 
//                 });
//             }

//             order.isPaid = true;
//             order.paidAt = Date.now();
//             order.paymentId = razorpay_payment_id;
//             order.razorpayOrderId = razorpay_order_id;
//             order.paymentStatus = 'Completed';
//             order.status = 'Processing';

//             await order.save();

//             // Email Notification
//             try {
//                 await sendEmail({
//                     email: order.user.email,
//                     subject: "✅ Payment Confirmed! - The Loot Bazaar",
//                     message: `Hello ${order.user.name},\n\nYour payment of ₹${order.totalPrice} has been confirmed.\nPayment ID: ${razorpay_payment_id}\n\nThank you for shopping with us! 🎉`
//                 });
//             } catch (mailError) {
//                 console.log("Email failed but payment updated successfully");
//             }

//             return res.status(200).json({
//                 success: true,
//                 message: "Payment verified successfully!",
//                 order
//             });

//         } else {
//             // Invalid Signature
//             console.log('❌ Invalid payment signature');
//             if (orderId) {
//                 await Order.findByIdAndUpdate(orderId, {
//                     paymentStatus: 'Failed',
//                     status: 'Pending'
//                 });
//             }

//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid payment signature!"
//             });
//         }

//     } catch (error) {
//         console.error('❌ Verification Error:', error);
//         res.status(500).json({ 
//             success: false,
//             message: error.message 
//         });
//     }
// };

// // ✅ 3. Razorpay Webhook Handler (Background mein payment sync karne ke liye)
// export const razorpayWebhook = async (req, res) => {
//     try {
//         const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

//         // Razorpay header se signature lo
//         const shigature = req.headers['x-razorpay-signature'];

//         // Webhook payload ko verify karo (Security ke liye zaroori hai)
//         const shasum = crypto.createHmac('sha256', webhookSecret);
//         shasum.update(JSON.stringify(req.body));
//         const digest = shasum.digest('hex');

//         if (digest !== shigature) {
//             console.log('❌ Invalid Webhook Signature');
//             return res.status(400).json({ success: false, message: 'Invalid signature' });
//         }

//         console.log('🔔 Webhook Event Received:', req.body.event);

//         // Jab payment successfully capture ho jaye
//         if (req.body.event === 'payment.captured') {
//             const payment = req.body.payload.payment.entity;
//             const razorpayOrderId = payment.order_id;
//             const razorpayPaymentId = payment.id;

//             // Order ko database me dhoondo aur update karo
//             const order = await Order.findOne({ razorpayOrderId }).populate('user', 'name email');

//             if (order && !order.isPaid) {
//                 order.isPaid = true;
//                 order.paidAt = Date.now();
//                 order.paymentId = razorpayPaymentId;
//                 order.paymentStatus = 'Completed';
//                 order.status = 'Processing';

//                 await order.save();
//                 console.log(`✅ Webhook: Order ${order._id} marked as Paid!`);

//                 // Email Notification
//                 try {
//                     await sendEmail({
//                         email: order.user.email,
//                         subject: "✅ Payment Confirmed (Webhook) - The Loot Bazaar",
//                         message: `Hello ${order.user.name},\n\nYour payment of ₹${order.totalPrice} has been confirmed.\nPayment ID: ${razorpayPaymentId}\n\nThank you for shopping with us! 🎉`
//                     });
//                 } catch (mailError) {
//                     console.log("Webhook email failed");
//                 }
//             }
//         }

//         // Razorpay ko response dena zaroori hai ki event mil gaya
//         res.status(200).json({ success: true });

//     } catch (error) {
//         console.error('❌ Webhook Error:', error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import sendEmail from '../utils/sendEmail.js';

// Helper function to get Razorpay instance safely
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// ✅ 1. Checkout / Create Razorpay Order
export const checkout = async (req, res) => {
    try {
        let { amount, couponCode, orderId } = req.body;
        let discountApplied = 0;

        console.log('📦 Razorpay Checkout Request:', { amount, couponCode, orderId });

        // Coupon Logic
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            if (!coupon) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid Coupon!" 
                });
            }

            if (coupon.isFirstOrderOnly) {
                const pastOrders = await Order.countDocuments({ 
                    user: req.user._id, 
                    isPaid: true 
                });
                if (pastOrders > 0) {
                    return res.status(400).json({ 
                        success: false,
                        message: "Only for first order!" 
                    });
                }
            }
            discountApplied = (amount * coupon.discountPercent) / 100;
            amount = amount - discountApplied;
        }

        const finalAmount = Math.round(Number(amount) * 100);

        const razorpayInstance = getRazorpayInstance();

        const options = {
            amount: finalAmount, 
            currency: "INR",
            receipt: `receipt_${orderId || Date.now()}`
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                razorpayOrderId: razorpayOrder.id,
                paymentMethod: 'Razorpay'
            });
        }

        console.log('🚀 Razorpay Order Created:', razorpayOrder.id);

        res.status(200).json({
            success: true,
            order: razorpayOrder,
            key: process.env.RAZORPAY_KEY_ID,
            orderId: orderId
        });

    } catch (error) {
        console.error('❌ Razorpay Checkout Detailed Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment initiation failed'
        });
    }
};

// ✅ 2. Payment Verification & Order Update
export const paymentVerification = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            orderId 
        } = req.body;

        console.log('🔔 Verifying Razorpay Payment:', { razorpay_order_id, orderId });

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const order = await Order.findById(orderId).populate('user', 'name email');

            if (!order) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Order not found!" 
                });
            }

            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentId = razorpay_payment_id;
            order.razorpayOrderId = razorpay_order_id;
            order.paymentStatus = 'Completed';
            order.status = 'Processing';

            await order.save();

            try {
                await sendEmail({
                    email: order.user.email,
                    subject: "✅ Payment Confirmed! - The Loot Bazaar",
                    message: `Hello ${order.user.name},\n\nYour payment of ₹${order.totalPrice} has been confirmed.\nPayment ID: ${razorpay_payment_id}\n\nThank you for shopping with us! 🎉`
                });
            } catch (mailError) {
                console.log("Email failed but payment updated successfully");
            }

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully!",
                order
            });

        } else {
            console.log('❌ Invalid payment signature');
            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: 'Failed',
                    status: 'Pending'
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid payment signature!"
            });
        }

    } catch (error) {
        console.error('❌ Verification Error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// ✅ 3. Razorpay Webhook Handler
export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shigature = req.headers['x-razorpay-signature'];

        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== shigature) {
            console.log('❌ Invalid Webhook Signature');
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        console.log('🔔 Webhook Event Received:', req.body.event);

        if (req.body.event === 'payment.captured') {
            const payment = req.body.payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const razorpayPaymentId = payment.id;

            const order = await Order.findOne({ razorpayOrderId }).populate('user', 'name email');

            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentId = razorpayPaymentId;
                order.paymentStatus = 'Completed';
                order.status = 'Processing';

                await order.save();
                console.log(`✅ Webhook: Order ${order._id} marked as Paid!`);

                try {
                    await sendEmail({
                        email: order.user.email,
                        subject: "✅ Payment Confirmed (Webhook) - The Loot Bazaar",
                        message: `Hello ${order.user.name},\n\nYour payment of ₹${order.totalPrice} has been confirmed.\nPayment ID: ${razorpayPaymentId}\n\nThank you for shopping with us! 🎉`
                    });
                } catch (mailError) {
                    console.log("Webhook email failed");
                }
            }
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('❌ Webhook Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};