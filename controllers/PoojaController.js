


import PoojaInfo from '../models/PoojaListModel.js';
import { v2 as cloudinary } from 'cloudinary';

// 1. Get all poojas (with Physical / Virtual filter support)
export const getallpooja = async (req, res) => {
    try {
        const { pujaType } = req.query; // e.g., /api/allpooja?pujaType=Virtual
        let filter = {};
        if (pujaType) {
            filter.pujaType = pujaType;
        }

        const poojas = await PoojaInfo.find(filter);
        return res.status(200).json({
            success: true,
            count: poojas.length,
            data: poojas
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error: " + error.message
        });
    }
};

// 2. Get single pooja details by name
export const poojaDetailsByName = async (req, res) => {
    try {
        const { PujaName } = req.params;
        const pooja = await PoojaInfo.findOne({ PujaName: { $regex: new RegExp(PujaName, 'i') } });

        if (!pooja) {
            return res.status(404).json({ success: false, message: "Pooja not found" });
        }

        return res.status(200).json({
            success: true,
            data: pooja
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error: " + error.message
        });
    }
};

// 3. Create new pooja with Cloudinary image upload
// export const createPooja = async (req, res) => {
//     try {
//         const { PujaName, templeName, location, pujaType, price, description } = req.body;

//         let imageUrl = "";
//         if (req.file) {
//             // CloudinaryStorage automatically path/url de deta hai
//         }
//         if (req.file) {


//              imageUrl = req.file.path;
//             const uploadResult = await new Promise((resolve, reject) => {
//                 const stream = cloudinary.uploader.upload_stream(
//                     { folder: "poojas" },
//                     (error, result) => {
//                         if (error) reject(error);
//                         else resolve(result);
//                     }
//                 );
//                 stream.end(req.file.buffer);
//             });
//             imageUrl = uploadResult.secure_url;
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
//         return res.status(500).json({
//             success: false,
//             message: "Error: " + error.message
//         });
//     }
// // };


export const createPooja = async (req, res) => {
    try {
        console.log("--- DEBUGGING REQUEST ---");
        console.log("req.body:", req.body);
        console.log("req.file:", req.file); // Yahan pata chal jayega ki file aa rahi hai ya khali hai

        const { PujaName, templeName, location, pujaType, price, description } = req.body;

        let imageUrl = "";
        if (req.file) {
            imageUrl = req.file.path;
        }

        const newPooja = new PoojaInfo({
            PujaName,
            templeName,
            location,
            pujaType,
            price,
            image: imageUrl,
            description
        });

        await newPooja.save();

        return res.status(201).json({
            success: true,
            message: "Pooja created successfully",
            data: newPooja
        });
    } catch (error) {
        console.error("Error caught:", error);
        return res.status(500).json({
            success: false,
            message: "Error: " + error.message
        });
    }
};


// Get single pooja by ID (Detail page ke liye)
export const getPoojaById = async (req, res) => {
    try {
        const { id } = req.params;
        const pooja = await PoojaInfo.findById(id);

        if (!pooja) {
            return res.status(404).json({
                success: false,
                message: "Pooja not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: pooja
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error: " + error.message
        });
    }
};