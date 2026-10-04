


// import PoojaInfo from '../models/PoojaListModel.js';
// import { v2 as cloudinary } from 'cloudinary';

// // 1. Get all poojas (with Physical / Virtual filter support)
// export const getallpooja = async (req, res) => {
//     try {
//         const { pujaType } = req.query; // e.g., /api/allpooja?pujaType=Virtual
//         let filter = {};
//         if (pujaType) {
//             filter.pujaType = pujaType;
//         }

//         const poojas = await PoojaInfo.find(filter);
//         return res.status(200).json({
//             success: true,
//             count: poojas.length,
//             data: poojas
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Error: " + error.message
//         });
//     }
// };

// // 2. Get single pooja details by name
// export const poojaDetailsByName = async (req, res) => {
//     try {
//         const { PujaName } = req.params;
//         const pooja = await PoojaInfo.findOne({ PujaName: { $regex: new RegExp(PujaName, 'i') } });

//         if (!pooja) {
//             return res.status(404).json({ success: false, message: "Pooja not found" });
//         }

//         return res.status(200).json({
//             success: true,
//             data: pooja
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Error: " + error.message
//         });
//     }
// };

// // 3. Create new pooja with Cloudinary image upload
// // export const createPooja = async (req, res) => {
// //     try {
// //         const { PujaName, templeName, location, pujaType, price, description } = req.body;

// //         let imageUrl = "";
// //         if (req.file) {
// //             // CloudinaryStorage automatically path/url de deta hai
// //         }
// //         if (req.file) {


// //              imageUrl = req.file.path;
// //             const uploadResult = await new Promise((resolve, reject) => {
// //                 const stream = cloudinary.uploader.upload_stream(
// //                     { folder: "poojas" },
// //                     (error, result) => {
// //                         if (error) reject(error);
// //                         else resolve(result);
// //                     }
// //                 );
// //                 stream.end(req.file.buffer);
// //             });
// //             imageUrl = uploadResult.secure_url;
// //         }

// //         const newPooja = new PoojaInfo({
// //             PujaName,
// //             templeName,
// //             location,
// //             pujaType,
// //             price,
// //             image: imageUrl,
// //             description
// //         });

// //         await newPooja.save();

// //         return res.status(201).json({
// //             success: true,
// //             message: "Pooja created successfully",
// //             data: newPooja
// //         });
// //     } catch (error) {
// //         return res.status(500).json({
// //             success: false,
// //             message: "Error: " + error.message
// //         });
// //     }
// // // };


// export const createPooja = async (req, res) => {
//     try {
//         console.log("--- DEBUGGING REQUEST ---");
//         console.log("req.body:", req.body);
//         console.log("req.file:", req.file); // Yahan pata chal jayega ki file aa rahi hai ya khali hai

//         const { PujaName, templeName, location, pujaType, price, description } = req.body;

//         let imageUrl = "";
//         if (req.file) {
//             imageUrl = req.file.path;
//         }

//         const newPooja = new PoojaInfo({
//             PujaName,
//             templeName,
//             location,
//             pujaType,
//             price,
//             image: imageUrl,
//             description
//         });

//         await newPooja.save();

//         return res.status(201).json({
//             success: true,
//             message: "Pooja created successfully",
//             data: newPooja
//         });
//     } catch (error) {
//         console.error("Error caught:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Error: " + error.message
//         });
//     }
// };


// // Get single pooja by ID (Detail page ke liye)
// export const getPoojaById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const pooja = await PoojaInfo.findById(id);

//         if (!pooja) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Pooja not found"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             data: pooja
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Error: " + error.message
//         });
//     }
// };

import mongoose from "mongoose";
import PoojaInfo from "../models/PoojaListModel.js";
import { v2 as cloudinary } from "cloudinary";

// ═══════════════════════════════════════════
//  HELPER: Standard Response
// ═══════════════════════════════════════════
const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// ═══════════════════════════════════════════
//  1. GET ALL POOJAS (with filter + pagination)
//     GET /api/allpooja?pujaType=Virtual&page=1&limit=20&search=hanuman
// ═══════════════════════════════════════════
export const getallpooja = async (req, res) => {
  try {
    const {
      pujaType,
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

    if (pujaType) filter.pujaType = pujaType;
    if (location) filter.location = { $regex: location, $options: "i" };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    const [poojas, total] = await Promise.all([
      PoojaInfo.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),                        // ⭐ 3-5x faster
      PoojaInfo.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: poojas.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: poojas,
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  2. GET POOJA BY NAME (case-insensitive)
//     GET /api/pooja/name/:PujaName
// ═══════════════════════════════════════════
export const poojaDetailsByName = async (req, res) => {
  try {
    const { PujaName } = req.params;
    const decodedName = decodeURIComponent(PujaName).trim();

    const pooja = await PoojaInfo.findOne({
      PujaName: { $regex: new RegExp(decodedName, "i") },
    }).lean();

    if (!pooja) return sendError(res, 404, "Pooja not found");

    return res.status(200).json({ success: true, data: pooja });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  3. GET POOJA BY SLUG (SEO friendly)
//     GET /api/pooja/slug/:slug
// ═══════════════════════════════════════════
export const getPoojaBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const pooja = await PoojaInfo.findOne({ slug }).lean();

    if (!pooja) return sendError(res, 404, "Pooja not found");

    return res.status(200).json({ success: true, data: pooja });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  4. CREATE POOJA (admin only)
//     POST /api/createpooja
// ═══════════════════════════════════════════
export const createPooja = async (req, res) => {
  try {
    const {
      PujaName,
      templeName,
      templeID,
      location,
      pujaType,
      price,
      description,
      tags,
      duration,
      benefits,
      language,
      pricing,          // JSON string ya object
    } = req.body;

    // ─── Validation ───
    if (!PujaName || !templeName || !pujaType || !price) {
      return sendError(res, 400, "PujaName, templeName, pujaType, and price are required");
    }

    if (Number(price) < 0) {
      return sendError(res, 400, "Price cannot be negative");
    }

    // ─── Duplicate check ───
    const existing = await PoojaInfo.findOne({
      PujaName: { $regex: new RegExp(`^${PujaName.trim()}$`, "i") },
      templeName: { $regex: new RegExp(`^${templeName.trim()}$`, "i") },
    });

    if (existing) {
      return sendError(res, 409, "Pooja with this name already exists at this temple");
    }

    // ─── Image upload (Cloudinary) ───
    let imageUrl = "";
    if (req.file) {
      if (req.file.path) {
        // multer-storage-cloudinary already uploaded
        imageUrl = req.file.path;
      } else if (req.file.buffer) {
        // memory storage → manually upload
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "poojas", resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(req.file.buffer);
        });
        imageUrl = uploadResult.secure_url;
      }
    }

    // ─── Parse pricing ───
    let parsedPricing = {
      single: Number(price) || 0,
      family: 0,
      group: 0,
      premium: 0,
    };

    if (pricing) {
      try {
        const p = typeof pricing === "string" ? JSON.parse(pricing) : pricing;
        parsedPricing = {
          single: Number(p.single) || Number(price) || 0,
          family: Number(p.family) || 0,
          group: Number(p.group) || 0,
          premium: Number(p.premium) || 0,
        };
      } catch {
        // ignore invalid pricing, use defaults
      }
    }

    // ─── Parse tags/benefits ───
    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
    };

    // ─── Create ───
    const newPooja = await PoojaInfo.create({
      PujaName: PujaName.trim(),
      templeName: templeName.trim(),
      templeID: templeID || null,
      location: location?.trim() || "",
      pujaType,
      price: Number(price),
      pricing: parsedPricing,
      image: imageUrl,
      description: description?.trim() || "",
      tags: parseArray(tags),
      duration: duration || "",
      benefits: parseArray(benefits),
      language: language || "Hindi",
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Pooja created successfully",
      data: newPooja,
    });
  } catch (error) {
    // Duplicate key error (unique index)
    if (error.code === 11000) {
      return sendError(res, 409, "Duplicate pooja: same name + temple already exists");
    }
    console.error("createPooja error:", error);
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  5. GET POOJA BY ID
//     GET /api/pooja/:id
// ═══════════════════════════════════════════
export const getPoojaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Pooja ID");
    }

    const pooja = await PoojaInfo.findById(id).lean();

    if (!pooja) return sendError(res, 404, "Pooja not found");

    // ⭐ View count increment (fire & forget)
    PoojaInfo.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(() => {});

    return res.status(200).json({ success: true, data: pooja });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  6. UPDATE POOJA (admin only)
//     PUT /api/pooja/:id
// ═══════════════════════════════════════════
export const updatePooja = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Pooja ID");
    }

    const pooja = await PoojaInfo.findById(id);
    if (!pooja) return sendError(res, 404, "Pooja not found");

    const updatable = [
      "PujaName", "templeName", "templeID", "location",
      "pujaType", "price", "description", "tags",
      "duration", "benefits", "language", "status", "isFeatured",
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) pooja[field] = req.body[field];
    });

    if (req.body.pricing) {
      try {
        const p = typeof req.body.pricing === "string"
          ? JSON.parse(req.body.pricing)
          : req.body.pricing;
        pooja.pricing = { ...pooja.pricing, ...p };
      } catch {}
    }

    if (req.file) {
      pooja.image = req.file.path || pooja.image;
    }

    pooja.updatedBy = req.user?._id || null;
    await pooja.save();

    return res.status(200).json({
      success: true,
      message: "Pooja updated successfully",
      data: pooja,
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};

// ═══════════════════════════════════════════
//  7. SOFT DELETE POOJA (admin only)
//     DELETE /api/pooja/:id
// ═══════════════════════════════════════════
export const deletePooja = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid Pooja ID");
    }

    const pooja = await PoojaInfo.findById(id);
    if (!pooja) return sendError(res, 404, "Pooja not found");

    pooja.isDeleted = true;
    pooja.deletedAt = new Date();
    pooja.status = "archived";
    pooja.updatedBy = req.user?._id || null;
    await pooja.save();

    return res.status(200).json({
      success: true,
      message: "Pooja deleted successfully",
    });
  } catch (error) {
    return sendError(res, 500, "Error: " + error.message);
  }
};