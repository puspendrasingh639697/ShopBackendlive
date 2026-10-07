import mongoose from "mongoose";
import Chadhava from "../models/ChadhavaModel.js";

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// ═══════════════════════════════════════════
//  1. GET ALL CHADHAVA (with filter + pagination)
//     GET /api/chadhava?type=phool&temple=...&page=1
// ═══════════════════════════════════════════
export const getAllChadhava = async (req, res) => {
  try {
    const {
      chadhavaType,
      templeName,
      deity,
      location,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { status: "active" };

    if (chadhavaType) filter.chadhavaType = chadhavaType;
    if (templeName) filter.templeName = { $regex: templeName, $options: "i" };
    if (deity) filter.deity = deity;
    if (location) filter["location.city"] = { $regex: location, $options: "i" };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    const [chadhavas, total] = await Promise.all([
      Chadhava.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Chadhava.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: chadhavas.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: chadhavas,
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  2. GET BY ID
//     GET /api/chadhava/:id
// ═══════════════════════════════════════════
export const getChadhavaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Chadhava ID");
    }

    const chadhava = await Chadhava.findById(id).lean();
    if (!chadhava) return sendError(res, 404, "Chadhava not found");

    // View count increment (fire & forget)
    Chadhava.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(() => {});

    return res.status(200).json({ success: true, data: chadhava });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  3. GET BY SLUG
//     GET /api/chadhava/slug/:slug
// ═══════════════════════════════════════════
export const getChadhavaBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const chadhava = await Chadhava.findOne({ slug }).lean();
    if (!chadhava) return sendError(res, 404, "Chadhava not found");
    return res.status(200).json({ success: true, data: chadhava });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

export const createChadhava = async (req, res) => {
  try {
    console.log("📥 req.body:", req.body);   // ⭐ Debug
    console.log("📥 req.file:", req.file);   // ⭐ Debug

    const {
      name,
      chadhavaType,
      templeName,
      templeId,
      deity,
      location,
      price,
      samagriCharge,
      serviceCharge,
      shortDescription,
      description,
      inclusions,
      samagriList,
      benefits,
      deliveryType,
      videoProvided,
      prasadProvided,
      prasadDeliveryCharge,
      maxBookingsPerDay,
      bookingCutoffHours,
    } = req.body;

    // ─── Parse location ───
    let locationData = {};
    if (typeof location === "string") {
      try { locationData = JSON.parse(location); } catch { locationData = {}; }
    } else if (location && typeof location === "object") {
      locationData = location;
    }

    // ─── Parse arrays ───
    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [val];
        } catch {
          return val.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
      return [val];
    };

    // ─── Image URL ───
    let imageUrl = "";
    if (req.file) {
      // Agar cloudinary upload hua
      imageUrl = req.file.path || req.file.secure_url || "";
    }

    // ─── Validation ───
    if (!name || !chadhavaType || !templeName || !price) {
      return res.status(400).json({
        success: false,
        message: "name, chadhavaType, templeName, and price are required",
      });
    }

    // ─── Create ───
    const totalAmount =
      Number(price) + Number(samagriCharge || 0) + Number(serviceCharge || 0);

    const newChadhava = await Chadhava.create({
      name: name.trim(),
      chadhavaType,
      templeName: templeName.trim(),
      templeId: templeId || null,
      deity: deity || "other",
      location: locationData,
      price: Number(price),
      samagriCharge: Number(samagriCharge || 0),
      serviceCharge: Number(serviceCharge || 0),
      totalAmount,
      shortDescription: shortDescription || "",
      description: description || "",
      inclusions: parseArray(inclusions),
      samagriList: parseArray(samagriList),
      benefits: parseArray(benefits),
      image: imageUrl,
      images: [],
      deliveryType: deliveryType || "temple",
      videoProvided: videoProvided !== false && videoProvided !== "false",
      prasadProvided: prasadProvided === true || prasadProvided === "true",
      prasadDeliveryCharge: Number(prasadDeliveryCharge || 0),
      maxBookingsPerDay: Number(maxBookingsPerDay || 100),
      bookingCutoffHours: Number(bookingCutoffHours || 24),
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Chadhava created successfully",
      data: newChadhava,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate chadhava" });
    }
    console.error("❌ createChadhava error:", error);
    return res.status(500).json({ success: false, message: "Error: " + error.message });
  }
};

// ═══════════════════════════════════════════
//  5. UPDATE CHADHAVA (admin)
//     PUT /api/chadhava/:id
// ═══════════════════════════════════════════
export const updateChadhava = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Chadhava ID");
    }

    const chadhava = await Chadhava.findById(id);
    if (!chadhava) return sendError(res, 404, "Chadhava not found");

    const updatable = [
      "name", "chadhavaType", "templeName", "templeId", "deity",
      "location", "price", "samagriCharge", "serviceCharge",
      "shortDescription", "description", "inclusions", "samagriList",
      "benefits", "image", "images", "deliveryType", "videoProvided",
      "prasadProvided", "prasadDeliveryCharge", "maxBookingsPerDay",
      "bookingCutoffHours", "status", "isFeatured",
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) chadhava[field] = req.body[field];
    });

    // Recalculate total
    chadhava.totalAmount =
      Number(chadhava.price || 0) +
      Number(chadhava.samagriCharge || 0) +
      Number(chadhava.serviceCharge || 0);

    chadhava.updatedBy = req.user?._id || null;
    await chadhava.save();

    return res.status(200).json({
      success: true,
      message: "Chadhava updated successfully",
      data: chadhava,
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  6. SOFT DELETE (admin)
//     DELETE /api/chadhava/:id
// ═══════════════════════════════════════════
export const deleteChadhava = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Chadhava ID");
    }

    const chadhava = await Chadhava.findById(id);
    if (!chadhava) return sendError(res, 404, "Chadhava not found");

    chadhava.isDeleted = true;
    chadhava.status = "archived";
    chadhava.updatedBy = req.user?._id || null;
    await chadhava.save();

    return res.status(200).json({
      success: true,
      message: "Chadhava deleted successfully",
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  7. GET AVAILABLE SLOTS
//     GET /api/chadhava/:id/slots?date=2026-12-25
// ═══════════════════════════════════════════
export const getChadhavaSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) return sendError(res, 400, "Date is required (YYYY-MM-DD)");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Chadhava ID");
    }

    const chadhava = await Chadhava.findById(id).lean();
    if (!chadhava) return sendError(res, 404, "Chadhava not found");

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const dayBookings = await ChadhavaBooking.countDocuments({
      chadhavaId: id,
      date: bookingDate,
      status: { $ne: "cancelled" },
    });

    const maxPerDay = chadhava.maxBookingsPerDay || 100;
    const dayAvailable = Math.max(0, maxPerDay - dayBookings);

    const slots = await Promise.all(
      (chadhava.slots || []).map(async (slot) => {
        const booked = await ChadhavaBooking.countDocuments({
          chadhavaId: id,
          date: bookingDate,
          slot: slot.name,
          status: { $ne: "cancelled" },
        });

        return {
          name: slot.name,
          time: slot.time,
          maxBookings: slot.maxBookings,
          booked,
          available: Math.max(0, slot.maxBookings - booked),
          isFull: booked >= slot.maxBookings,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        chadhavaId: id,
        date,
        maxBookingsPerDay: maxPerDay,
        dayBooked: dayBookings,
        dayAvailable,
        isDayFull: dayBookings >= maxPerDay,
        slots,
      },
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};