// import ChadhavaBooking from "../models/ChadhavaBookingModel.js";
// import Chadhava from "../models/ChadhavaModel.js";

// const sendError = (res, status, message) =>
//   res.status(status).json({ success: false, message });

// // ═══════════════════════════════════════
// //  CREATE BOOKING
// //  POST /api/chadhava/book
// // ═══════════════════════════════════════
// export const createChadhavaBooking = async (req, res) => {
//   try {
//     const {
//       chadhavaId,
//       names,
//       phoneNumber,
//       gotra,
//       date,
//       slot = "morning",
//       address,
//       specialRequests,
//     } = req.body;

//     const userId = req.user?._id;

//     // ─── Auth ───
//     if (!userId) {
//       return sendError(res, 401, "Unauthorized: Please login first");
//     }

//     // ─── Validation ───
//     if (!chadhavaId || !names || !phoneNumber || !date) {
//       return sendError(res, 400, "chadhavaId, names, phoneNumber, and date are required");
//     }

//     if (!Array.isArray(names) || names.length === 0) {
//       return sendError(res, 400, "At least one devotee name is required");
//     }

//     if (!["morning", "afternoon", "evening"].includes(slot)) {
//       return sendError(res, 400, "Invalid slot");
//     }

//     // ─── Chadhava check ───
//     const chadhava = await Chadhava.findById(chadhavaId);
//     if (!chadhava) return sendError(res, 404, "Chadhava not found");

//     const bookingDate = new Date(date);
//     bookingDate.setHours(0, 0, 0, 0);

//     // ─── Cutoff ───
//     const cutoffHours = chadhava.bookingCutoffHours || 24;
//     const hoursDiff = (bookingDate - new Date()) / (1000 * 60 * 60);
//     if (hoursDiff < cutoffHours) {
//       return sendError(
//         res,
//         400,
//         `Booking must be done at least ${cutoffHours} hours before`
//       );
//     }

//     // ─── Double booking ───
//     const existing = await ChadhavaBooking.findOne({
//       userId,
//       chadhavaId,
//       date: bookingDate,
//       slot,
//       status: { $ne: "cancelled" },
//     });

//     if (existing) {
//       return sendError(
//         res,
//         409,
//         `You have already booked this chadhava for ${date} (${slot} slot)`
//       );
//     }

//     // ─── Slot capacity ───
//     const slotConfig = chadhava.slots?.find((s) => s.name === slot);

//     if (slotConfig) {
//       const slotBookings = await ChadhavaBooking.countDocuments({
//         chadhavaId,
//         date: bookingDate,
//         slot,
//         status: { $ne: "cancelled" },
//       });

//       if (slotBookings >= slotConfig.maxBookings) {
//         return sendError(res, 400, `"${slot}" slot is full for ${date}`);
//       }
//     }

//     // ─── Per day capacity ───
//     const maxPerDay = chadhava.maxBookingsPerDay || 100;
//     const dayBookings = await ChadhavaBooking.countDocuments({
//       chadhavaId,
//       date: bookingDate,
//       status: { $ne: "cancelled" },
//     });

//     if (dayBookings >= maxPerDay) {
//       return sendError(res, 400, `This chadhava is fully booked for ${date}`);
//     }

//     // ─── Create booking ───
//     const newBooking = new ChadhavaBooking({
//       userId,
//       chadhavaId,

//       // Snapshot
//       chadhavaName: chadhava.name,
//       chadhavaType: chadhava.chadhavaType,
//       templeName: chadhava.templeName,
//       image: chadhava.image || "",

//       // Date & slot
//       date: bookingDate,
//       slot,
//       slotTime: slotConfig?.time || "",

//       // Devotee
//       names,
//       phoneNumber,
//       gotra: gotra || "Not Specified",
//       address: address || "",
//       specialRequests: specialRequests || "",

//       // Pricing
//       price: chadhava.price,
//       samagriCharge: chadhava.samagriCharge || 0,
//       serviceCharge: chadhava.serviceCharge || 0,
//       totalAmount: chadhava.totalAmount,

//       // Delivery
//       deliveryType: chadhava.deliveryType || "temple",

//       status: "pending",
//       paymentStatus: "pending",
//     });

//     await newBooking.save();

//     // Increment booking count
//     Chadhava.findByIdAndUpdate(chadhavaId, {
//       $inc: { bookingCount: 1 },
//     }).catch(() => {});

//     return res.status(201).json({
//       success: true,
//       message: "Chadhava booking initialized. Proceed to payment.",
//       data: newBooking,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return sendError(res, 409, "You have already booked this chadhava for this date and slot");
//     }
//     return sendError(res, 500, "Server Error: " + error.message);
//   }
// };

// // ═══════════════════════════════════════
// //  GET MY BOOKINGS
// //  GET /api/chadhava/mybookings
// // ═══════════════════════════════════════
// export const getMyChadhavaBookings = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     if (!userId) return sendError(res, 401, "Unauthorized");

//     const bookings = await ChadhavaBooking.find({ userId })
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: bookings.length,
//       data: bookings,
//     });
//   } catch (error) {
//     return sendError(res, 500, "Error: " + error.message);
//   }
// };

// // ═══════════════════════════════════════
// //  GET SINGLE BOOKING
// //  GET /api/chadhava/booking/:id
// // ═══════════════════════════════════════
// export const getChadhavaBookingById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?._id;

//     const booking = await ChadhavaBooking.findOne({ _id: id, userId });
//     if (!booking) return sendError(res, 404, "Booking not found");

//     return res.status(200).json({ success: true, data: booking });
//   } catch (error) {
//     return sendError(res, 500, "Error: " + error.message);
//   }
// };

// // ═══════════════════════════════════════
// //  CANCEL BOOKING
// //  PUT /api/chadhava/booking/:id/cancel
// // ═══════════════════════════════════════
// export const cancelChadhavaBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?._id;
//     const { reason } = req.body;

//     const booking = await ChadhavaBooking.findOne({ _id: id, userId });
//     if (!booking) return sendError(res, 404, "Booking not found");

//     if (booking.status === "cancelled") {
//       return sendError(res, 400, "Booking already cancelled");
//     }

//     if (booking.status === "completed") {
//       return sendError(res, 400, "Completed booking cannot be cancelled");
//     }

//     booking.status = "cancelled";
//     booking.cancelledAt = new Date();
//     booking.cancelReason = reason || "User cancelled";
//     booking.cancelledBy = "user";
//     await booking.save();

//     return res.status(200).json({
//       success: true,
//       message: "Booking cancelled successfully",
//       data: booking,
//     });
//   } catch (error) {
//     return sendError(res, 500, "Error: " + error.message);
//   }
// };


import ChadhavaBooking from "../models/ChadhavaBookingModel.js";
import Chadhava from "../models/ChadhavaModel.js";
import mongoose from "mongoose";

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// ═══════════════════════════════════════
//  CREATE BOOKING
//  POST /api/chadhava/book
// ═══════════════════════════════════════
export const createChadhavaBooking = async (req, res) => {
  try {
    console.log("\n🚀 ===== createChadhavaBooking START =====");
    console.log("  Body:", JSON.stringify(req.body));
    console.log("  User:", req.user?._id);

    const {
      chadhavaId,
      names,
      phoneNumber,
      gotra,
      date,
      slot = "morning",
      address,
      specialRequests,
    } = req.body;

    const userId = req.user?._id;

    // ─── Auth ───
    if (!userId) {
      console.log("❌ No userId");
      return sendError(res, 401, "Unauthorized: Please login first");
    }

    // ─── Validation ───
    if (!chadhavaId || !names || !phoneNumber || !date) {
      console.log("❌ Missing required fields");
      return sendError(
        res,
        400,
        "chadhavaId, names, phoneNumber, and date are required"
      );
    }

    if (!Array.isArray(names) || names.length === 0) {
      console.log("❌ No names");
      return sendError(res, 400, "At least one devotee name is required");
    }

    if (!["morning", "afternoon", "evening"].includes(slot)) {
      console.log("❌ Invalid slot:", slot);
      return sendError(res, 400, "Invalid slot");
    }

    // ⭐ ─── Chadhava check (DEBUG) ───
    console.log("  🔍 Finding chadhava:", chadhavaId);

    // Pehle normal find
    let chadhava = await Chadhava.findById(chadhavaId);

    console.log("  🔍 First attempt (normal):", !!chadhava);
    if (chadhava) {
      console.log("    - name:", chadhava.name);
      console.log("    - isDeleted:", chadhava.isDeleted);
      console.log("    - status:", chadhava.status);
    }

    // Agar nahi mila — bina filter ke try karo
    if (!chadhava) {
      console.log("  🔍 Second attempt (includeDeleted: true)...");
      chadhava = await Chadhava.findById(chadhavaId).setOptions({
        includeDeleted: true,
      });

      console.log("  🔍 Second attempt result:", !!chadhava);
      if (chadhava) {
        console.log("    - name:", chadhava.name);
        console.log("    - isDeleted:", chadhava.isDeleted);
        console.log("    - status:", chadhava.status);
      }
    }

    // Agar phir bhi nahi mila — findOne try karo
    if (!chadhava) {
      console.log("  🔍 Third attempt (findOne, includeDeleted: true)...");
      chadhava = await Chadhava.findOne({ _id: chadhavaId }).setOptions({
        includeDeleted: true,
      });

      console.log("  🔍 Third attempt result:", !!chadhava);
      if (chadhava) {
        console.log("    - name:", chadhava.name);
        console.log("    - isDeleted:", chadhava.isDeleted);
      }
    }

    // Agar phir bhi nahi mila — directly raw collection se try karo
    if (!chadhava) {
     const rawChadhava = await Chadhava.collection.findOne({
  _id: new mongoose.Types.ObjectId(chadhavaId),
});
      

      console.log("  🔍 Raw result:", !!rawChadhava);
      if (rawChadhava) {
        console.log("    - name:", rawChadhava.name);
        console.log("    - isDeleted:", rawChadhava.isDeleted);
      }
    }

    if (!chadhava) {
      console.log("❌ Chadhava NOT FOUND after all attempts");
      return sendError(res, 404, "Chadhava not found");
    }

    console.log("  ✅ Chadhava found:", chadhava._id);
    console.log("  ✅ Name:", chadhava.name);
    console.log("  ✅ Amount:", chadhava.totalAmount);

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // ─── Cutoff ───
    const cutoffHours = chadhava.bookingCutoffHours || 24;
    const hoursDiff = (bookingDate - new Date()) / (1000 * 60 * 60);
    console.log("  Cutoff check — hours diff:", hoursDiff, "| required:", cutoffHours);

    if (hoursDiff < cutoffHours) {
      console.log("❌ Cutoff failed");
      return sendError(
        res,
        400,
        `Booking must be done at least ${cutoffHours} hours before`
      );
    }

    // ─── Double booking ───
    const existing = await ChadhavaBooking.findOne({
      userId,
      chadhavaId,
      date: bookingDate,
      slot,
      status: { $ne: "cancelled" },
    });

    if (existing) {
      console.log("❌ Already booked:", existing._id);
      return sendError(
        res,
        409,
        `You have already booked this chadhava for ${date} (${slot} slot)`
      );
    }

    // ─── Slot capacity ───
    const slotConfig = chadhava.slots?.find((s) => s.name === slot);

    if (slotConfig) {
      const slotBookings = await ChadhavaBooking.countDocuments({
        chadhavaId,
        date: bookingDate,
        slot,
        status: { $ne: "cancelled" },
      });

      console.log("  Slot bookings:", slotBookings, "| Max:", slotConfig.maxBookings);

      if (slotBookings >= slotConfig.maxBookings) {
        return sendError(res, 400, `"${slot}" slot is full for ${date}`);
      }
    }

    // ─── Per day capacity ───
    const maxPerDay = chadhava.maxBookingsPerDay || 100;
    const dayBookings = await ChadhavaBooking.countDocuments({
      chadhavaId,
      date: bookingDate,
      status: { $ne: "cancelled" },
    });

    console.log("  Day bookings:", dayBookings, "| Max:", maxPerDay);

    if (dayBookings >= maxPerDay) {
      return sendError(res, 400, `This chadhava is fully booked for ${date}`);
    }

    // ─── Create booking ───
    console.log("  Creating booking...");
    const newBooking = new ChadhavaBooking({
      userId,
      chadhavaId,

      // Snapshot
      chadhavaName: chadhava.name,
      chadhavaType: chadhava.chadhavaType,
      templeName: chadhava.templeName,
      image: chadhava.image || "",

      // Date & slot
      date: bookingDate,
      slot,
      slotTime: slotConfig?.time || "",

      // Devotee
      names,
      phoneNumber,
      gotra: gotra || "Not Specified",
      address: address || "",
      specialRequests: specialRequests || "",

      // Pricing
      price: chadhava.price,
      samagriCharge: chadhava.samagriCharge || 0,
      serviceCharge: chadhava.serviceCharge || 0,
      totalAmount: chadhava.totalAmount,

      // Delivery
      deliveryType: chadhava.deliveryType || "temple",

      status: "pending",
      paymentStatus: "pending",
    });

    await newBooking.save();
    console.log("  ✅ Booking created:", newBooking._id);

    // Increment booking count
    Chadhava.findByIdAndUpdate(chadhavaId, {
      $inc: { bookingCount: 1 },
    }).catch(() => {});

    console.log("🚀 ===== createChadhavaBooking SUCCESS =====\n");

    return res.status(201).json({
      success: true,
      message: "Chadhava booking initialized. Proceed to payment.",
      data: newBooking,
    });
  } catch (error) {
    console.error("\n❌ ===== createChadhavaBooking ERROR =====");
    console.error("  Message:", error.message);
    console.error("  Stack:", error.stack);
    console.error("=====================================\n");

    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "You have already booked this chadhava for this date and slot"
      );
    }
    return sendError(res, 500, "Server Error: " + error.message);
  }
};

// ═══════════════════════════════════════
//  GET MY BOOKINGS
//  GET /api/chadhava/mybookings
// ═══════════════════════════════════════
export const getMyChadhavaBookings = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const bookings = await ChadhavaBooking.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════
//  GET SINGLE BOOKING
//  GET /api/chadhava/booking/:id
// ═══════════════════════════════════════
export const getChadhavaBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const booking = await ChadhavaBooking.findOne({ _id: id, userId });
    if (!booking) return sendError(res, 404, "Booking not found");

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════
//  CANCEL BOOKING
//  PUT /api/chadhava/booking/:id/cancel
// ═══════════════════════════════════════
export const cancelChadhavaBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { reason } = req.body;

    const booking = await ChadhavaBooking.findOne({ _id: id, userId });
    if (!booking) return sendError(res, 404, "Booking not found");

    if (booking.status === "cancelled") {
      return sendError(res, 400, "Booking already cancelled");
    }

    if (booking.status === "completed") {
      return sendError(res, 400, "Completed booking cannot be cancelled");
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = reason || "User cancelled";
    booking.cancelledBy = "user";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};