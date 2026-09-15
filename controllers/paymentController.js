


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