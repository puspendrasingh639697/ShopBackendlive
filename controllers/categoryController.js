import Category from '../models/Category.js';

// ✅ Create Category (Admin Only)
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation agar name na mile
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required!" });
        }

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists!" });
        }

        // 👈 Yahan humne req.file.path use kiya hai jo ki Cloudinary ka direct URL deta hai
        const imagePath = req.file ? req.file.path : "";

        const category = await Category.create({
            name,
            slug,
            description,
            image: imagePath // Ab yahan Cloudinary ka poora URL save hoga
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully!",
            category
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get All Categories (Public)
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).lean();
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};