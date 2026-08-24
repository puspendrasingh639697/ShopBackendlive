

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Direct keys dalkar check karo
cloudinary.config({
    cloud_name:'qcqig88l',
    api_key:'578776415224168',
    api_secret:'vPlPanNxP96q4wUjxgBg8h6o408'
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'product_images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });
export default upload;