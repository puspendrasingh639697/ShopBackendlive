

// import multer from 'multer';
// import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';

// // Direct keys dalkar check karo
// cloudinary.config({
//     cloud_name:'qcqig88l',
//     api_key:'578776415224168',
//     api_secret:'vPlPanNxP96q4wUjxgBg8h6o408'
// });


// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'product_images',
//         allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
//     },
// });

// const upload = multer({ storage: storage });
// export default upload;


import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'qcqig88l',
    api_key: '578776415224168',
    api_secret: 'vPlPanNxP96q4wUjxgBg8h6o408'
});

// Corrected CloudinaryStorage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'product_images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'jfif'],
        public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;