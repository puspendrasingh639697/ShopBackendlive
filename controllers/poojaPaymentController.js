// // import Razorpay from 'razorpay';
// // import crypto from 'crypto';
// // import BookPooja from '../models/BookPoojaModel.js';
// // import sendEmail from '../utils/sendEmail.js';

// // const getRazorpayInstance = () => {
// //     return new Razorpay({
// //         key_id: process.env.RAZORPAY_KEY_ID,
// //         key_secret: process.env.RAZORPAY_KEY_SECRET,
// //     });
// // };

// // // 1. Checkout / Create Order
// // export const createPoojaCheckout = async (req, res) => {
// //     try {
// //         const { bookingId } = req.body;

// //         const booking = await BookPooja.findById(bookingId);
// //         if (!booking) {
// //             return res.status(404).json({ success: false, message: "Booking not found!" });
// //         }

// //         const finalAmount = Math.round(Number(booking.totalAmount) * 100);
// //         const razorpayInstance = getRazorpayInstance();

// //         const options = {
// //             amount: finalAmount,
// //             currency: "INR",
// //             receipt: `receipt_pooja_${booking._id}`
// //         };

// //         const razorpayOrder = await razorpayInstance.orders.create(options);

// //         booking.razorpayOrderId = razorpayOrder.id;
// //         await booking.save();

// //         res.status(200).json({
// //             success: true,
// //             order: razorpayOrder,
// //             key: process.env.RAZORPAY_KEY_ID,
// //             bookingId: booking._id
// //         });

// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };

// // // 2. Payment Verification
// // export const verifyPoojaPayment = async (req, res) => {
// //     try {
// //         const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

// //         const body = razorpay_order_id + "|" + razorpay_payment_id;
// //         const expectedSignature = crypto
// //             .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
// //             .update(body.toString())
// //             .digest('hex');

// //         if (expectedSignature === razorpay_signature) {
// //             const booking = await BookPooja.findById(bookingId).populate('userId', 'name email');

// //             if (!booking) {
// //                 return res.status(404).json({ success: false, message: "Booking not found!" });
// //             }

// //             booking.paymentStatus = 'paid';
// //             booking.status = 'confirmed';
// //             booking.razorpayPaymentId = razorpay_payment_id;
// //             await booking.save();

// //             try {
// //                 await sendEmail({
// //                     email: booking.userId.email,
// //                     subject: "✅ Pooja Booking Confirmed! - Mandir App",
// //                     message: `Hello ${booking.userId.name},\n\nYour Pooja has been successfully booked!\n\nGotra: ${booking.gotra}\nNames: ${booking.names.join(', ')}\nDate: ${new Date(booking.dateOfPooja).toLocaleDateString()}\nAmount Paid: ₹${booking.totalAmount}\nPayment ID: ${razorpay_payment_id}\n\nMay God bless you! 🙏`
// //                 });
// //             } catch (mailError) {
// //                 console.log("Email notification failed");
// //             }

// //             return res.status(200).json({
// //                 success: true,
// //                 message: "Payment verified and Pooja confirmed successfully!",
// //                 booking
// //             });
// //         } else {
// //             await BookPooja.findByIdAndUpdate(bookingId, { paymentStatus: 'failed' });
// //             return res.status(400).json({ success: false, message: "Invalid payment signature!" });
// //         }
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };

// // // 3. Webhook Handler
// // export const poojaRazorpayWebhook = async (req, res) => {
// //     try {
// //         const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
// //         const signature = req.headers['x-razorpay-signature'];

// //         const shasum = crypto.createHmac('sha256', webhookSecret);
// //         shasum.update(req.body);
// //         const digest = shasum.digest('hex');

// //         if (digest !== signature) {
// //             return res.status(400).json({ success: false, message: 'Invalid signature' });
// //         }

// //         const event = JSON.parse(req.body.toString());

// //         if (event.event === 'payment.captured') {
// //             const payment = event.payload.payment.entity;
// //             const razorpayOrderId = payment.order_id;
// //             const razorpayPaymentId = payment.id;

// //             const booking = await BookPooja.findOne({ razorpayOrderId }).populate('userId', 'name email');

// //             if (booking && booking.paymentStatus !== 'paid') {
// //                 booking.paymentStatus = 'paid';
// //                 booking.status = 'confirmed';
// //                 booking.razorpayPaymentId = razorpayPaymentId;
// //                 await booking.save();
// //             }
// //         }

// //         res.status(200).json({ success: true });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };

// import Razorpay from "razorpay";
// import crypto from "crypto";
// import BookPooja from "../models/BookPoojaModel.js";
// import sendEmail from "../utils/sendEmail.js";

// const getRazorpayInstance = () => {
//   return new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });
// };

// // ═══════════════════════════════════════
// //  1. CREATE CHECKOUT / ORDER
// //  POST /api/create-checkout
// // ═══════════════════════════════════════
// export const createPoojaCheckout = async (req, res) => {
//   try {
//     console.log("\n🚀 ===== createPoojaCheckout START =====");
//     console.log("  Body:", JSON.stringify(req.body));
//     console.log("  User:", req.user?._id);
//     console.log("  Razorpay key:", process.env.RAZORPAY_KEY_ID ? "✅" : "❌");

//     const { bookingId } = req.body;

//     if (!bookingId) {
//       console.log("❌ Missing bookingId");
//       return res.status(400).json({
//         success: false,
//         message: "bookingId is required",
//       });
//     }

//     console.log("  Finding booking:", bookingId);
//     const booking = await BookPooja.findById(bookingId);

//     if (!booking) {
//       console.log("❌ Booking not found");
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found!",
//       });
//     }

//     console.log("  ✅ Booking found:", booking._id);
//     console.log("  Amount:", booking.totalAmount);
//     console.log("  Payment status:", booking.paymentStatus);

//     if (booking.paymentStatus === "paid") {
//       return res.status(400).json({
//         success: false,
//         message: "Booking already paid",
//       });
//     }

//     if (!booking.totalAmount || booking.totalAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid booking amount",
//       });
//     }

//     const finalAmount = Math.round(Number(booking.totalAmount) * 100);
//     console.log("  Amount (paise):", finalAmount);

//     const razorpayInstance = getRazorpayInstance();
//     console.log("  ✅ Razorpay instance created");

//     const options = {
//       amount: finalAmount,
//       currency: "INR",
//       receipt: `receipt_pooja_${booking._id}`,
//       notes: {
//         bookingId: booking._id.toString(),
//         userId: booking.userId.toString(),
//         poojaName: booking.poojaName || "",
//       },
//     };

//     console.log("  Creating Razorpay order...");
//     const razorpayOrder = await razorpayInstance.orders.create(options);
//     console.log("  ✅ Order created:", razorpayOrder.id);

//     booking.razorpayOrderId = razorpayOrder.id;
//     await booking.save();

//     console.log("🚀 ===== createPoojaCheckout SUCCESS =====\n");

//     return res.status(200).json({
//       success: true,
//       order: {
//         id: razorpayOrder.id,
//         amount: razorpayOrder.amount,
//         currency: razorpayOrder.currency,
//         status: razorpayOrder.status,
//       },
//       key: process.env.RAZORPAY_KEY_ID,
//       bookingId: booking._id,
//     });
//   } catch (error) {
//     console.error("\n❌ ===== createPoojaCheckout ERROR =====");
//     console.error("  Message:", error.message);
//     console.error("  Stack:", error.stack);
//     console.error("  Full:", JSON.stringify(error, null, 2));
//     console.error("=====================================\n");

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };

// // ═══════════════════════════════════════
// //  2. VERIFY PAYMENT
// //  POST /api/verify-payment
// // ═══════════════════════════════════════
// export const verifyPoojaPayment = async (req, res) => {
//   try {
//     console.log("\n🚀 ===== verifyPoojaPayment START =====");
//     console.log("  Body:", JSON.stringify(req.body));

//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingId,
//     } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       console.log("❌ Missing payment details");
//       return res.status(400).json({
//         success: false,
//         message: "Payment details missing",
//       });
//     }

//     if (!bookingId) {
//       return res.status(400).json({
//         success: false,
//         message: "bookingId is required",
//       });
//     }

//     // Verify signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       console.log("❌ Invalid signature");
//       await BookPooja.findByIdAndUpdate(bookingId, {
//         paymentStatus: "failed",
//       });
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature!",
//       });
//     }

//     console.log("  ✅ Signature verified");

//     const booking = await BookPooja.findById(bookingId).populate(
//       "userId",
//       "name email"
//     );

//     if (!booking) {
//       console.log("❌ Booking not found");
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found!",
//       });
//     }

//     booking.paymentStatus = "paid";
//     booking.status = "confirmed";
//     booking.razorpayPaymentId = razorpay_payment_id;
//     booking.razorpaySignature = razorpay_signature;
//     booking.paidAt = new Date();
//     await booking.save();

//     console.log("  ✅ Booking updated:", booking._id);

//     // Send email (production mein skip hoga)
//     try {
//       await sendEmail({
//         email: booking.userId?.email,
//         subject: "✅ Pooja Booking Confirmed! - Mandir App",
//         message: `Hello ${booking.userId?.name},\n\nYour Pooja has been successfully booked!\n\nGotra: ${booking.gotra}\nNames: ${booking.names.join(", ")}\nDate: ${new Date(booking.dateOfPooja).toLocaleDateString()}\nAmount Paid: ₹${booking.totalAmount}\nPayment ID: ${razorpay_payment_id}\n\nMay God bless you! 🙏`,
//       });
//     } catch (mailError) {
//       console.log("Email notification failed:", mailError.message);
//     }

//     console.log("🚀 ===== verifyPoojaPayment SUCCESS =====\n");

//     return res.status(200).json({
//       success: true,
//       message: "Payment verified and Pooja confirmed successfully!",
//       booking,
//     });
//   } catch (error) {
//     console.error("\n❌ ===== verifyPoojaPayment ERROR =====");
//     console.error("  Message:", error.message);
//     console.error("  Stack:", error.stack);
//     console.error("=====================================\n");

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };

// // ═══════════════════════════════════════
// //  3. WEBHOOK HANDLER
// //  POST /api/webhook/razorpay
// // ═══════════════════════════════════════
// export const poojaRazorpayWebhook = async (req, res) => {
//   try {
//     console.log("\n🔔 ===== Webhook received =====");

//     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
//     const signature = req.headers["x-razorpay-signature"];

//     if (!webhookSecret) {
//       console.log("❌ Webhook secret not configured");
//       return res.status(500).json({ success: false });
//     }

//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     shasum.update(req.body);
//     const digest = shasum.digest("hex");

//     if (digest !== signature) {
//       console.log("❌ Invalid webhook signature");
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }

//     const event = JSON.parse(req.body.toString());
//     console.log("  Event:", event.event);

//     if (event.event === "payment.captured") {
//       const payment = event.payload.payment.entity;
//       const razorpayOrderId = payment.order_id;
//       const razorpayPaymentId = payment.id;

//       const booking = await BookPooja.findOne({ razorpayOrderId }).populate(
//         "userId",
//         "name email"
//       );

//       if (booking && booking.paymentStatus !== "paid") {
//         booking.paymentStatus = "paid";
//         booking.status = "confirmed";
//         booking.razorpayPaymentId = razorpayPaymentId;
//         booking.paidAt = new Date();
//         await booking.save();
//         console.log("  ✅ Booking updated via webhook:", booking._id);
//       }
//     }

//     res.status(200).json({ success: true });
//   } catch (error) {
//     console.error("❌ Webhook error:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


import Razorpay from "razorpay";
import crypto from "crypto";
import BookPooja from "../models/BookPoojaModel.js";
import sendEmail from "../utils/sendEmail.js";

// ═══════════════════════════════════════
//  RAZORPAY INSTANCE (Module-level)
// ═══════════════════════════════════════
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ═══════════════════════════════════════
//  1. CREATE CHECKOUT / RAZORPAY ORDER
//  POST /api/create-checkout
//  Body: { bookingId }
// ═══════════════════════════════════════
export const createPoojaCheckout = async (req, res) => {
  try {
    console.log("\n🚀 ===== createPoojaCheckout START =====");
    console.log("  Body:", JSON.stringify(req.body));
    console.log("  User:", req.user?._id);
    console.log("  Razorpay key:", process.env.RAZORPAY_KEY_ID ? "✅" : "❌");

    const { bookingId } = req.body;
    const userId = req.user?._id;

    // ─── Validate Input ───
    if (!bookingId) {
      console.log("❌ Missing bookingId");
      return res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
    }

    if (!userId) {
      console.log("❌ Missing userId");
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ─── Find Booking ───
    console.log("  Finding booking:", bookingId);
    const booking = await BookPooja.findOne({ _id: bookingId, userId });

    if (!booking) {
      console.log("❌ Booking not found");
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    console.log("  ✅ Booking found:", booking._id);
    console.log("  Amount:", booking.totalAmount);
    console.log("  Payment status:", booking.paymentStatus);

    // ─── Check if Already Paid ───
    if (booking.paymentStatus === "paid") {
      console.log("❌ Already paid");
      return res.status(400).json({
        success: false,
        message: "Booking already paid",
      });
    }

    // ─── Validate Amount ───
    if (!booking.totalAmount || booking.totalAmount <= 0) {
      console.log("❌ Invalid amount:", booking.totalAmount);
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    const finalAmount = Math.round(Number(booking.totalAmount) * 100);
    console.log("  Amount (paise):", finalAmount);

    // ─── Razorpay Order Options ───
    const razorpayInstance = getRazorpayInstance();

    // ⭐ Receipt max 40 chars — safe rakho
    const receipt = `pooja_${booking._id.toString().slice(-20)}`;
    console.log("  Receipt:", receipt, "| Length:", receipt.length);

    const options = {
      amount: finalAmount,
      currency: "INR",
      receipt: receipt,
      notes: {
        bookingId: booking._id.toString(),
        userId: userId.toString(),
        poojaName: booking.poojaName || "",
      },
    };

    console.log("  Creating Razorpay order...");
    const razorpayOrder = await razorpayInstance.orders.create(options);
    console.log("  ✅ Order created:", razorpayOrder.id);

    // ─── Save Order ID in Booking ───
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    console.log("🚀 ===== createPoojaCheckout SUCCESS =====\n");

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
    console.error("\n❌ ===== createPoojaCheckout ERROR =====");
    console.error("  Message:", error.message);
    console.error("  StatusCode:", error.statusCode);
    console.error("  Error:", error.error);
    console.error("  Full:", JSON.stringify(error, null, 2));
    console.error("=====================================\n");

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        error.error?.description ||
        "Something went wrong",
    });
  }
};

// ═══════════════════════════════════════
//  2. VERIFY PAYMENT
//  POST /api/verify-payment
//  Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }
// ═══════════════════════════════════════
export const verifyPoojaPayment = async (req, res) => {
  try {
    console.log("\n🚀 ===== verifyPoojaPayment START =====");
    console.log("  Body:", JSON.stringify(req.body));

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const userId = req.user?._id;

    // ─── Validate Input ───
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log("❌ Missing payment details");
      return res.status(400).json({
        success: false,
        message: "Payment details missing",
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
    }

    // ─── Verify Signature ───
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ Invalid signature");
      await BookPooja.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature!",
      });
    }

    console.log("  ✅ Signature verified");

    // ─── Find & Update Booking ───
    const booking = await BookPooja.findOne({ _id: bookingId, userId }).populate(
      "userId",
      "name email"
    );

    if (!booking) {
      console.log("❌ Booking not found");
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAt = new Date();
    await booking.save();

    console.log("  ✅ Booking updated:", booking._id);

    // ─── Send Email (production mein skip hoga) ───
    try {
      await sendEmail({
        email: booking.userId?.email,
        subject: "✅ Pooja Booking Confirmed!",
        message: `Hello ${booking.userId?.name},\n\nYour Pooja has been successfully booked!\n\nPooja: ${booking.poojaName}\nDate: ${new Date(booking.dateOfPooja).toLocaleDateString()}\nAmount Paid: ₹${booking.totalAmount}\nPayment ID: ${razorpay_payment_id}\n\nMay God bless you! 🙏`,
      });
    } catch (mailError) {
      console.log("Email notification failed:", mailError.message);
    }

    console.log("🚀 ===== verifyPoojaPayment SUCCESS =====\n");

    return res.status(200).json({
      success: true,
      message: "Payment verified and Pooja confirmed successfully!",
      booking,
    });
  } catch (error) {
    console.error("\n❌ ===== verifyPoojaPayment ERROR =====");
    console.error("  Message:", error.message);
    console.error("  Stack:", error.stack);
    console.error("=====================================\n");

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// ═══════════════════════════════════════
//  3. WEBHOOK HANDLER
//  POST /api/webhook/razorpay
// ═══════════════════════════════════════
export const poojaRazorpayWebhook = async (req, res) => {
  try {
    console.log("\n🔔 ===== Webhook Received =====");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      console.log("❌ Webhook secret not configured");
      return res.status(500).json({ success: false });
    }

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(req.body);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      console.log("❌ Invalid webhook signature");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const event = JSON.parse(req.body.toString());
    console.log("  Event:", event.event);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      const booking = await BookPooja.findOne({ razorpayOrderId }).populate(
        "userId",
        "name email"
      );

      if (booking && booking.paymentStatus !== "paid") {
        booking.paymentStatus = "paid";
        booking.status = "confirmed";
        booking.razorpayPaymentId = razorpayPaymentId;
        booking.paidAt = new Date();
        await booking.save();
        console.log("  ✅ Booking updated via webhook:", booking._id);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};