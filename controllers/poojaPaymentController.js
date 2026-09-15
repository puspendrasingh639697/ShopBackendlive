import Razorpay from 'razorpay';
import crypto from 'crypto';
import BookPooja from '../models/BookPoojaModel.js';
import sendEmail from '../utils/sendEmail.js';

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// 1. Checkout / Create Order
export const createPoojaCheckout = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await BookPooja.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found!" });
        }

        const finalAmount = Math.round(Number(booking.totalAmount) * 100);
        const razorpayInstance = getRazorpayInstance();

        const options = {
            amount: finalAmount,
            currency: "INR",
            receipt: `receipt_pooja_${booking._id}`
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        booking.razorpayOrderId = razorpayOrder.id;
        await booking.save();

        res.status(200).json({
            success: true,
            order: razorpayOrder,
            key: process.env.RAZORPAY_KEY_ID,
            bookingId: booking._id
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Payment Verification
export const verifyPoojaPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            const booking = await BookPooja.findById(bookingId).populate('userId', 'name email');

            if (!booking) {
                return res.status(404).json({ success: false, message: "Booking not found!" });
            }

            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            booking.razorpayPaymentId = razorpay_payment_id;
            await booking.save();

            try {
                await sendEmail({
                    email: booking.userId.email,
                    subject: "✅ Pooja Booking Confirmed! - Mandir App",
                    message: `Hello ${booking.userId.name},\n\nYour Pooja has been successfully booked!\n\nGotra: ${booking.gotra}\nNames: ${booking.names.join(', ')}\nDate: ${new Date(booking.dateOfPooja).toLocaleDateString()}\nAmount Paid: ₹${booking.totalAmount}\nPayment ID: ${razorpay_payment_id}\n\nMay God bless you! 🙏`
                });
            } catch (mailError) {
                console.log("Email notification failed");
            }

            return res.status(200).json({
                success: true,
                message: "Payment verified and Pooja confirmed successfully!",
                booking
            });
        } else {
            await BookPooja.findByIdAndUpdate(bookingId, { paymentStatus: 'failed' });
            return res.status(400).json({ success: false, message: "Invalid payment signature!" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Webhook Handler
export const poojaRazorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(req.body);
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const event = JSON.parse(req.body.toString());

        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const razorpayPaymentId = payment.id;

            const booking = await BookPooja.findOne({ razorpayOrderId }).populate('userId', 'name email');

            if (booking && booking.paymentStatus !== 'paid') {
                booking.paymentStatus = 'paid';
                booking.status = 'confirmed';
                booking.razorpayPaymentId = razorpayPaymentId;
                await booking.save();
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};