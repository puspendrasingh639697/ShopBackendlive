


// import Bookpooja from "../models/BookPoojaModel.js";
// import PoojaDetails from "../models/PoojaListModel.js";

// // ═══════════════════════════════════════
// //  CREATE BOOKING
// //  POST /api/bookpooja
// // ═══════════════════════════════════════
// export const createBooking = async (req, res) => {
//   try {
//     const {
//       poojaId,
//       templeID,
//       names,
//       phoneNumber,
//       gotra,
//       pujaType,
//       packageType,
//       dateOfPooja,
//       address,
//       notes,
//       slot = "morning",       // ⭐ NEW
//     } = req.body;

//     const userId = req.user?._id;

//     // ─── Auth check ───
//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: Please login first",
//       });
//     }

//     // ─── Basic validation ───
//     if (!poojaId || !names || !phoneNumber || !dateOfPooja) {
//       return res.status(400).json({
//         success: false,
//         message: "poojaId, names, phoneNumber, and dateOfPooja are required",
//       });
//     }

//     if (!Array.isArray(names) || names.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one devotee name is required",
//       });
//     }

//     if (!["morning", "afternoon", "evening"].includes(slot)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid slot. Choose from morning, afternoon, or evening",
//       });
//     }

//     // ─── Pooja check ───
//     const pooja = await PoojaDetails.findById(poojaId);
//     if (!pooja) {
//       return res.status(404).json({
//         success: false,
//         message: "Pooja not found",
//       });
//     }

//     const bookingDate = new Date(dateOfPooja);
//     bookingDate.setHours(0, 0, 0, 0);

//     // ⭐ 1. CUTOFF CHECK
//     const cutoffHours = pooja.bookingCutoffHours || 24;
//     const hoursDiff = (bookingDate - new Date()) / (1000 * 60 * 60);
//     if (hoursDiff < cutoffHours) {
//       return res.status(400).json({
//         success: false,
//         message: `Booking must be done at least ${cutoffHours} hours before the pooja date`,
//       });
//     }

//     // ⭐ 2. DOUBLE BOOKING PREVENTION
//     const existingBooking = await Bookpooja.findOne({
//       userId,
//       poojaId,
//       dateOfPooja: bookingDate,
//       slot,
//       status: { $ne: "cancelled" },
//     });

//     if (existingBooking) {
//       return res.status(409).json({
//         success: false,
//         message: `You have already booked this pooja for ${dateOfPooja} (${slot} slot)`,
//       });
//     }

//     // ⭐ 3. SLOT CAPACITY CHECK
//     const slotConfig = pooja.slots?.find((s) => s.name === slot);

//     if (slotConfig) {
//       const slotBookings = await Bookpooja.countDocuments({
//         poojaId,
//         dateOfPooja: bookingDate,
//         slot,
//         status: { $ne: "cancelled" },
//       });

//       if (slotBookings >= slotConfig.maxBookings) {
//         return res.status(400).json({
//           success: false,
//           message: `"${slot}" slot is full for ${dateOfPooja}. Please choose another slot.`,
//         });
//       }
//     }

//     // ⭐ 4. PER DAY CAPACITY CHECK
//     const maxPerDay = pooja.maxBookingsPerDay || 50;
//     const dayBookings = await Bookpooja.countDocuments({
//       poojaId,
//       dateOfPooja: bookingDate,
//       status: { $ne: "cancelled" },
//     });

//     if (dayBookings >= maxPerDay) {
//       return res.status(400).json({
//         success: false,
//         message: `This pooja is fully booked for ${dateOfPooja}. Please choose another date.`,
//       });
//     }

//     // ─── Price calculation ───
//     let totalAmount = 0;
//     const selectedPackage = packageType || "single";

//     if (pooja.pricing && typeof pooja.pricing === "object") {
//       totalAmount =
//         pooja.pricing[selectedPackage] ||
//         pooja.pricing.single ||
//         pooja.price ||
//         0;
//     } else if (pooja.price) {
//       totalAmount = pooja.price;
//     }

//     if (!totalAmount || totalAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Pricing configuration missing for this pooja",
//       });
//     }

//     // ─── Address validation for physical poojas ───
//     const physicalTypes = ["at_home_pandit", "sankalp_prasad_puja", "Physical"];
//     const actualPujaType = pujaType || pooja.pujaType || "live_virtual_puja";

//     if (physicalTypes.includes(actualPujaType) && !address) {
//       return res.status(400).json({
//         success: false,
//         message: "Address is mandatory for home/physical delivery poojas",
//       });
//     }

//     // ⭐ Create booking with slotTime
//     const newBooking = new Bookpooja({
//       userId,
//       poojaId,
//       poojaName: pooja.PujaName,
//       templeName: pooja.templeName,
//       poojaImage: pooja.image || "",
//       templeID: templeID || pooja.templeID || pooja.templeId || null,

//       names,
//       phoneNumber,
//       gotra: gotra || "Not Specified",
//       pujaType: actualPujaType,
//       packageType: selectedPackage,
//       totalAmount,
//       dateOfPooja: bookingDate,

//       // ⭐ SLOT
//       slot,
//       slotTime: slotConfig?.time || "",

//       address: address || "N/A (Virtual Pooja)",
//       notes: notes || "",
//       status: "pending",
//       paymentStatus: "pending",
//     });

//     await newBooking.save();

//     // ─── Increment booking count ───
//     PoojaDetails.findByIdAndUpdate(poojaId, {
//       $inc: { bookingCount: 1 },
//     }).catch(() => {});

//     return res.status(201).json({
//       success: true,
//       message: "Booking initialized successfully. Proceed to payment.",
//       data: newBooking,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "You have already booked this pooja for this date and slot",
//       });
//     }

//     console.error("createBooking error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error: " + error.message,
//     });
//   }
// };

// // ═══════════════════════════════════════
// //  GET SINGLE BOOKING
// //  GET /api/booking/:id
// // ═══════════════════════════════════════
// export const getBookingById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?._id;

//     const booking = await Bookpooja.findOne({ _id: id, userId });

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     return res.status(200).json({ success: true, data: booking });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error: " + error.message,
//     });
//   }
// };

// // ═══════════════════════════════════════
// //  CANCEL BOOKING
// //  PUT /api/booking/:id/cancel
// // ═══════════════════════════════════════
// export const cancelBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?._id;
//     const { reason } = req.body;

//     const booking = await Bookpooja.findOne({ _id: id, userId });

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     if (booking.status === "cancelled") {
//       return res.status(400).json({
//         success: false,
//         message: "Booking already cancelled",
//       });
//     }

//     if (booking.status === "completed") {
//       return res.status(400).json({
//         success: false,
//         message: "Completed booking cannot be cancelled",
//       });
//     }

//     booking.status = "cancelled";
//     booking.cancelledAt = new Date();
//     booking.cancelReason = reason || "User cancelled";
//     await booking.save();

//     return res.status(200).json({
//       success: true,
//       message: "Booking cancelled successfully",
//       data: booking,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error: " + error.message,
//     });
//   }
// };

// // ═══════════════════════════════════════
// //  GET MY BOOKINGS
// //  GET /api/mybookings
// // ═══════════════════════════════════════
// export const getMyBookings = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const bookings = await Bookpooja.find({ userId })
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: bookings.length,
//       data: bookings,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error: " + error.message,
//     });
//   }
// };



// // ═══════════════════════════════════════
// //  GET ALL BOOKINGS (ADMIN)
// //  GET /api/admin/allbookings
// // ═══════════════════════════════════════
// export const getAllBookings = async (req, res) => {
//   try {
//     const { status, paymentStatus, page = 1, limit = 50 } = req.query;

//     const filter = {};
//     if (status) filter.status = status;
//     if (paymentStatus) filter.paymentStatus = paymentStatus;

//     const pageNum = Math.max(1, Number(page));
//     const limitNum = Math.min(100, Math.max(1, Number(limit)));
//     const skip = (pageNum - 1) * limitNum;

//     const [bookings, total] = await Promise.all([
//       Bookpooja.find(filter)
//         .populate('userId', 'name email phone')
//         .populate('poojaId', 'PujaName templeName image price')
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limitNum)
//         .lean(),
//       Bookpooja.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: bookings.length,
//       total,
//       page: pageNum,
//       pages: Math.ceil(total / limitNum),
//       data: bookings,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error: " + error.message,
//     });
//   }
// };


import Bookpooja from "../models/BookPoojaModel.js";
import PoojaDetails from "../models/PoojaListModel.js";

// ═══════════════════════════════════════
//  CREATE BOOKING
//  POST /api/bookpooja
// ═══════════════════════════════════════
export const createBooking = async (req, res) => {
  try {
    const {
      poojaId,
      templeID,
      names,
      phoneNumber,
      gotra,
      pujaType,
      packageType,
      dateOfPooja,
      address,
      notes,
      slot = "morning",
    } = req.body;

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login first",
      });
    }

    if (!poojaId || !names || !phoneNumber || !dateOfPooja) {
      return res.status(400).json({
        success: false,
        message: "poojaId, names, phoneNumber, and dateOfPooja are required",
      });
    }

    if (!Array.isArray(names) || names.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one devotee name is required",
      });
    }

    if (!["morning", "afternoon", "evening"].includes(slot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot. Choose from morning, afternoon, or evening",
      });
    }

    const pooja = await PoojaDetails.findById(poojaId);
    if (!pooja) {
      return res.status(404).json({
        success: false,
        message: "Pooja not found",
      });
    }

    const bookingDate = new Date(dateOfPooja);
    bookingDate.setHours(0, 0, 0, 0);

    const cutoffHours = pooja.bookingCutoffHours || 24;
    const hoursDiff = (bookingDate - new Date()) / (1000 * 60 * 60);
    if (hoursDiff < cutoffHours) {
      return res.status(400).json({
        success: false,
        message: `Booking must be done at least ${cutoffHours} hours before the pooja date`,
      });
    }

    const existingBooking = await Bookpooja.findOne({
      userId,
      poojaId,
      dateOfPooja: bookingDate,
      slot,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: `You have already booked this pooja for ${dateOfPooja} (${slot} slot)`,
      });
    }

    const slotConfig = pooja.slots?.find((s) => s.name === slot);

    if (slotConfig) {
      const slotBookings = await Bookpooja.countDocuments({
        poojaId,
        dateOfPooja: bookingDate,
        slot,
        status: { $ne: "cancelled" },
      });

      if (slotBookings >= slotConfig.maxBookings) {
        return res.status(400).json({
          success: false,
          message: `"${slot}" slot is full for ${dateOfPooja}. Please choose another slot.`,
        });
      }
    }

    const maxPerDay = pooja.maxBookingsPerDay || 50;
    const dayBookings = await Bookpooja.countDocuments({
      poojaId,
      dateOfPooja: bookingDate,
      status: { $ne: "cancelled" },
    });

    if (dayBookings >= maxPerDay) {
      return res.status(400).json({
        success: false,
        message: `This pooja is fully booked for ${dateOfPooja}. Please choose another date.`,
      });
    }

    let totalAmount = 0;
    const selectedPackage = packageType || "single";

    if (pooja.pricing && typeof pooja.pricing === "object") {
      totalAmount =
        pooja.pricing[selectedPackage] ||
        pooja.pricing.single ||
        pooja.price ||
        0;
    } else if (pooja.price) {
      totalAmount = pooja.price;
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Pricing configuration missing for this pooja",
      });
    }

    const physicalTypes = ["at_home_pandit", "sankalp_prasad_puja", "Physical"];
    const actualPujaType = pujaType || pooja.pujaType || "live_virtual_puja";

    if (physicalTypes.includes(actualPujaType) && !address) {
      return res.status(400).json({
        success: false,
        message: "Address is mandatory for home/physical delivery poojas",
      });
    }

    const newBooking = new Bookpooja({
      userId,
      poojaId,
      poojaName: pooja.PujaName,
      templeName: pooja.templeName,
      poojaImage: pooja.image || "",
      templeID: templeID || pooja.templeID || pooja.templeId || null,

      names,
      phoneNumber,
      gotra: gotra || "Not Specified",
      pujaType: actualPujaType,
      packageType: selectedPackage,
      totalAmount,
      dateOfPooja: bookingDate,

      slot,
      slotTime: slotConfig?.time || "",

      address: address || "N/A (Virtual Pooja)",
      notes: notes || "",
      status: "pending",
      paymentStatus: "pending",
    });

    await newBooking.save();

    PoojaDetails.findByIdAndUpdate(poojaId, {
      $inc: { bookingCount: 1 },
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Booking initialized successfully. Proceed to payment.",
      data: newBooking,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already booked this pooja for this date and slot",
      });
    }

    console.error("createBooking error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ═══════════════════════════════════════
//  GET SINGLE BOOKING
//  GET /api/booking/:id
// ═══════════════════════════════════════
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const booking = await Bookpooja.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error: " + error.message,
    });
  }
};

// ═══════════════════════════════════════
//  CANCEL BOOKING
//  PUT /api/booking/:id/cancel
// ═══════════════════════════════════════
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { reason } = req.body;

    const booking = await Bookpooja.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be cancelled",
      });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = reason || "User cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error: " + error.message,
    });
  }
};

// ═══════════════════════════════════════
//  GET MY BOOKINGS
//  GET /api/mybookings
// ═══════════════════════════════════════
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const bookings = await Bookpooja.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error: " + error.message,
    });
  }
};

// ═══════════════════════════════════════
//  ✅ NEW — GET ALL BOOKINGS (ADMIN)
//  GET /api/admin/allbookings
// ═══════════════════════════════════════
export const getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Bookpooja.find(filter)
        .populate("userId", "name email phone")
        .populate("poojaId", "PujaName templeName image price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Bookpooja.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error: " + error.message,
    });
  }
};