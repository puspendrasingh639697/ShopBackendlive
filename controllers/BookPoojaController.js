// import Bookpooja from '../models/BookPoojaModel.js';
// import PoojaDetails from '../models/PoojaListModel.js';

// export const createBooking = async (req, res) => {
//     try {
//         const { 
//             poojaId, 
//             templeID, 
//             names, 
//             phoneNumber, 
//             gotra, 
//             pujaType, 
//             packageType, 
//             dateOfPooja, 
//             address 
//         } = req.body;

//         const userId = req.user?._id; 

//         if (!userId) {
//             return res.status(401).json({ success: false, message: "Unauthorized: Please login first" });
//         }

//         // 1. Validate if Pooja exists
//         const pooja = await PoojaDetails.findById(poojaId);
//         if (!pooja) {
//             return res.status(404).json({ success: false, message: "Pooja not found" });
//         }

//         // 2. Foolproof Dynamic Price Calculation
//         let totalAmount = 0;
//         const selectedPackage = packageType || 'single';

//         if (pooja.pricing && typeof pooja.pricing === 'object') {
//             // Agar pricing object hai, toh selected package uthao, warna fallback to single/price
//             totalAmount = pooja.pricing[selectedPackage] || pooja.pricing.single || pooja.price || 0;
//         } else if (pooja.price) {
//             // Agar direct price field hai
//             totalAmount = pooja.price;
//         }

//         if (!totalAmount || totalAmount <= 0) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Pricing configuration missing for this pooja." 
//             });
//         }

//         // 3. Conditional Address Validation for Physical/At-home Poojas
//         if ((pujaType === 'at_home_pandit' || pujaType === 'sankalp_prasad_puja') && !address) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Address is mandatory for home/physical delivery poojas" 
//             });
//         }

//         // 4. Validate Devotee Names array
//         if (!names || !Array.isArray(names) || names.length === 0) {
//             return res.status(400).json({ success: false, message: "At least one devotee name is required for Sankalp" });
//         }

//        // 5. Create New Booking Record with Proper Mapping
//         const newBooking = new Bookpooja({
//             userId,
//             poojaId,
//             templeID: templeID || pooja.templeID || pooja.templeId,
//             names: names || [], // Ensure names array maps correctly
//             phoneNumber,
//             gotra: gotra || "Not Specified",
//             pujaType: pujaType || pooja.pujaType || 'live_virtual_puja',
//             packageType: selectedPackage,
//             totalAmount,
//             dateOfPooja: dateOfPooja ? new Date(dateOfPooja) : new Date(), // Safe Date Parsing
//             address: address || "N/A (Virtual Pooja)",
//             status: "pending",
//             paymentStatus: "pending"
//         });

//         await newBooking.save();

//         return res.status(201).json({
//             success: true,
//             message: "Booking initialized successfully. Proceed to payment.",
//             data: newBooking
//         });

//     } catch (error) {
//         return res.status(500).json({ 
//             success: false, 
//             message: "Server Error: " + error.message 
//         });
//     }
// };

import Bookpooja from '../models/BookPoojaModel.js';
import PoojaDetails from '../models/PoojaListModel.js';

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
        } = req.body;

        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Please login first",
            });
        }

        // 1. Validate pooja exists
        const pooja = await PoojaDetails.findById(poojaId);
        if (!pooja) {
            return res.status(404).json({
                success: false,
                message: "Pooja not found",
            });
        }

        // 2. Dynamic price calculation
        let totalAmount = 0;
        const selectedPackage = packageType || 'single';

        if (pooja.pricing && typeof pooja.pricing === 'object') {
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
                message: "Pricing configuration missing for this pooja.",
            });
        }

        // 3. Address validation for physical poojas
        const physicalTypes = [
            'at_home_pandit',
            'sankalp_prasad_puja',
            'Physical',
        ];
        const actualPujaType = pujaType || pooja.pujaType || 'live_virtual_puja';

        if (physicalTypes.includes(actualPujaType) && !address) {
            return res.status(400).json({
                success: false,
                message: "Address is mandatory for home/physical delivery poojas",
            });
        }

        // 4. Validate names array
        if (!names || !Array.isArray(names) || names.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one devotee name is required for Sankalp",
            });
        }

        // 5. Create booking with SNAPSHOT fields
        const newBooking = new Bookpooja({
            userId,
            poojaId,

            // ⭐ SNAPSHOT — pooja ke details booking ke waqt
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
            dateOfPooja: dateOfPooja ? new Date(dateOfPooja) : new Date(),
            address: address || "N/A (Virtual Pooja)",
            notes: notes || "",

            status: "pending",
            paymentStatus: "pending",
        });

        await newBooking.save();

        // 6. Increment booking count (fire & forget)
        PoojaDetails.findByIdAndUpdate(poojaId, {
            $inc: { bookingCount: 1 },
        }).catch(() => {});

        return res.status(201).json({
            success: true,
            message: "Booking initialized successfully. Proceed to payment.",
            data: newBooking,
        });

    } catch (error) {
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