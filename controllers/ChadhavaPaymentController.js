import Razorpay from "razorpay";
import crypto from "crypto";
import ChadhavaBooking from "../models/ChadhavaBookingModel.js";

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ═══════════════════════════════════════
//  CREATE CHECKOUT
//  POST /api/chadhava/create-checkout
// ═══════════════════════════════════════
export const createChadhavaCheckout = async (req, res) => {
  try {
    console.log("\n🚀 ===== createChadhavaCheckout START =====");

    const { bookingId } = req.body;
    const userId = req.user?._id;

    if (!bookingId) return res.status(400).json({ success: false, message: "bookingId required" });
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const booking = await ChadhavaBooking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found!" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Already paid" });
    }

    if (!booking.totalAmount || booking.totalAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const finalAmount = Math.round(Number(booking.totalAmount) * 100);
    const receipt = `chadhava_${booking._id.toString().slice(-20)}`;

    console.log("  Amount (paise):", finalAmount);
    console.log("  Receipt:", receipt, "| Length:", receipt.length);

    const razorpayInstance = getRazorpayInstance();

    const options = {
      amount: finalAmount,
      currency: "INR",
      receipt: receipt,
      notes: {
        bookingId: booking._id.toString(),
        chadhavaName: booking.chadhavaName,
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    return res.status(200).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status,
      },
      key: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("❌ createChadhavaCheckout ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || error.error?.description || "Something went wrong",
    });
  }
};

// ═══════════════════════════════════════
//  VERIFY PAYMENT
//  POST /api/chadhava/verify-payment
// ═══════════════════════════════════════
export const verifyChadhavaPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment details missing" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await ChadhavaBooking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const booking = await ChadhavaBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};