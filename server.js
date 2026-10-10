

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import connectDB from './config/db.js';
import chadhavaRoutes from "./routes/ChadhavaRoutes.js";

// ─── Routes ───
import categoryRoutes from './routes/categoryRoutes.js';
import poojaRoutes from './routes/PojabookingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// ─── Security Middleware ───
import {
    securityHeaders,
    noSqlSanitize,
    globalLimiter,
    sanitizeQueryParams,
    sanitizeBody,
    preventParameterPollution,
    requestSizeLimiter,
    preventSqlInjection
} from './middleware/securityMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ Sirf local pe dotenv load karo (Render pe environment variables already loaded hain)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
app.set('trust proxy', 1);

// ⭐ DEBUG: ENV CHECK (server start hone pe)
console.log('\n🔍 ENV CHECK:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);
console.log('  MONGO_URI:', process.env.MONGO_URI ? '✅' : '❌');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌');
console.log('  RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅' : '❌');
console.log('  RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅' : '❌');
console.log('');

app.use(securityHeaders);
app.use(compression());

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://spritual-shop.vercel.app',
            'https://spiritual-shop.vercel.app',
            'https://piyush-products.vercel.app',
            'https://thelootbazaar.vercel.app',
            'https://admin.yourdomain.com'
        ];
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600
}));

app.use(requestSizeLimiter);
app.use(globalLimiter);

// ⭐ Body parser PEHLE
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ⭐ Sanitizers BAAD MEIN
app.use(noSqlSanitize);
app.use(preventSqlInjection);
app.use(sanitizeQueryParams);
app.use(sanitizeBody);
app.use(preventParameterPollution);

// ⭐ DEBUG: create-checkout aur bookpooja ke liye
app.use((req, res, next) => {
    if (
        req.path === '/api/create-checkout' ||
        req.path === '/api/bookpooja' ||
        req.path === '/api/verify-payment'
    ) {
        console.log(`\n🔍 ${req.method} ${req.path}`);
        console.log('  body:', JSON.stringify(req.body));
        console.log('  razorpay key:', process.env.RAZORPAY_KEY_ID ? '✅' : '❌');
        console.log('  auth header:', req.headers.authorization ? '✅' : '❌');
        console.log('');
    }
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/chadhava", chadhavaRoutes);
app.use('/api', poojaRoutes);
app.use('/api/booking', bookingRoutes);


// ─── Health Check ───
app.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: '🚀 Backend running!',
        timestamp: new Date().toISOString()
    });
});

// ─── 404 ───
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
    console.error('❌ Global Error:', err);
    const errorMessage = err?.message || 'Internal Server Error';
    const statusCode = err?.status || err?.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV !== 'production' && { stack: err?.stack }),
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🔥 Server started on port ${PORT}\n`);
});


