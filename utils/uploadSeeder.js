import { v2 as cloudinary } from 'cloudinary';
import Product from './models/productModel.js';
import Category from './models/Category.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Cloudinary Config (Agar alag se config file hai toh wahan se import kar sakte hain)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadAllImages = async () => {
  try {
    // 1. MongoDB Connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 Connected to MongoDB for Image Upload & Seeding...");

    // Local folder jahan aapne categories ke naam ke folders banaye hain
    const baseDir = './my_images'; 
    
    // Aapki 9 original categories jo database mein hain
    const categories = [
      'Puja Samagri',
      'Puja Kits',
      'Yantra',
      'Rudraksha & Malas',
      'Gemstones',
      'Idols & Murtis',
      'Astrology Remedies',
      'Festival Collections',
      'Spiritual Accessories'
    ];

    for (const catName of categories) {
      const folderPath = path.join(baseDir, catName);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ Folder nahi mila: ${folderPath} (Skip kar rahe hain)`);
        continue;
      }

      // Database se category ki ID dhoondho
      const categoryDoc = await Category.findOne({ name: catName });
      if (!categoryDoc) {
        console.log(`❌ Database mein category nahi mili: ${catName}`);
        continue;
      }

      const files = fs.readdirSync(folderPath);

      for (const file of files) {
        // Sirf image files allow karne ke liye (jpg, png, jfif etc.)
        if (!file.match(/\.(jpg|jpeg|png|jfif|webp)$/i)) continue;

        try {
          const filePath = path.join(folderPath, file);

          // 1. Cloudinary par upload karo
          const result = await cloudinary.uploader.upload(filePath, {
            folder: `Spiritual_Shop/${catName}`
          });

          const productName = file.split('.')[0].replace(/[-_]/g, ' ');
          const slug = productName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

          // 2. Database mein Product entry banao (Proper Category ID ke sath)
          await Product.create({
            name: productName,
            slug: slug,
            description: `Premium quality ${productName} for your spiritual rituals and daily puja.`,
            price: 299, // Dummy price, baad mein change kar sakte hain
            category: categoryDoc._id, // 👈 Database wali Asli Category ID
            image: result.secure_url, // Cloudinary ka secure URL
            stock: 100,
            isFeatured: true,
            reviews: [],
            numReviews: 0,
            rating: 0
          });

          console.log(`✅ Uploaded & Saved: ${file} -> Category: ${catName}`);
        } catch (err) {
          console.error(`❌ Error uploading ${file}:`, err.message);
        }
      }
    }

    console.log("🚀 Sabhi Images aur Products Successfully Taiyar ho gaye hain!");
    process.exit();
  } catch (error) {
    console.error("❌ Critical Error:", error);
    process.exit(1);
  }
};

uploadAllImages();