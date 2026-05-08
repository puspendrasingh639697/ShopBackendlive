// // backend/server.js
// import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';

// // Routes
// import authRoutes from './routes/authRoutes.js';
// import productRoutes from './routes/productRoutes.js';
// import cartRoutes from './routes/cartRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';
// import couponRoutes from './routes/couponRoutes.js';
// import userRoutes from "./routes/userRoutes.js";
// import adminRoutes from './routes/adminRoutes.js';
// import contentRoutes from './routes/contentRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';

// // ✅ Security Middleware Imports
// import {
//     securityHeaders,
//     noSqlSanitize,
//     globalLimiter,
//     authLimiter,
//     adminLimiter,
//     sanitizeQueryParams,
//     sanitizeBody,
//     preventParameterPollution,
//     requestSizeLimiter,
//     preventSqlInjection
// } from './middleware/securityMiddleware.js';

// // Configuration
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config();

// // App initialize
// const app = express();

// // ✅ Trust proxy for Render.com rate limiting
// app.set('trust proxy', 1);

// // =======================
// //   🔒 SECURITY MIDDLEWARE (Order Matters!)
// // =======================

// // 1. Security Headers (Helmet) - MUST BE FIRST
// app.use(securityHeaders);

// // 2. CORS setup with strict options
// app.use(cors({
//     origin: function(origin, callback) {
//        const allowedOrigins = [
//     'http://localhost:5173',
//     'http://localhost:5174',
//     'https://piyush-products.vercel.app',    // ← ये लाइन
//     'https://yourdomain.com',
//     'https://admin.yourdomain.com'
// ];
        
//         if (!origin) return callback(null, true);
        
//         if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//     exposedHeaders: ['Content-Range', 'X-Content-Range'],
//     maxAge: 600
// }));

// // 3. Request Size Limiter (10MB limit)
// app.use(requestSizeLimiter);

// // 4. Global Rate Limiting (500 requests per 15 minutes)
// app.use(globalLimiter);

// // 5. NoSQL Injection Protection
// app.use(noSqlSanitize);

// // 6. XSS Protection - DISABLED (causes issues on Render)
// // app.use(xssProtection);

// // 7. SQL Injection Prevention
// app.use(preventSqlInjection);

// // 8. Query Parameter Sanitizer
// app.use(sanitizeQueryParams);

// // 9. Body Parser
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // 10. Body Data Sanitizer (After body parser)
// app.use(sanitizeBody);

// // 11. Prevent Parameter Pollution
// app.use(preventParameterPollution);

// // =======================
// //   STATIC FILES
// // =======================
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // =======================
// //   DATABASE CONNECTION
// // =======================
// connectDB();

// // =======================
// //   ROUTES with Additional Rate Limiting
// // =======================

// // Apply strict rate limit to auth routes (5 attempts per 15 min)
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);
// app.use('/api/user/login', authLimiter);
// app.use('/api/user/register', authLimiter);

// // Apply admin rate limit to admin routes (2000 requests per hour)
// app.use('/api/admin', adminLimiter);
// app.use('/api/products/add', adminLimiter);
// app.use('/api/products/update', adminLimiter);
// app.use('/api/products/delete', adminLimiter);

// // Public Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/coupon', couponRoutes);
// app.use("/api/user", userRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/content', contentRoutes);
// app.use('/api/notifications', notificationRoutes);

// // =======================
// //   HEALTH CHECK
// // =======================
// app.get('/', (req, res) => {
//     res.json({
//         success: true,
//         status: 'OK',
//         message: '🚀 Backend is running with full security!',
//         timestamp: new Date().toISOString(),
//         security: {
//             headers: '✅ Helmet',
//             nosql: '✅ mongoSanitize',
//             rateLimit: '✅ Enabled',
//             cors: '✅ Strict',
//             sqlInjection: '✅ Protected'
//         }
//     });
// });

// // =======================
// //   404 Handler
// // =======================
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: `Route ${req.originalUrl} not found`,
//         timestamp: new Date().toISOString()
//     });
// });

// // =======================
// //   Global Error Handler
// // =======================
// app.use((err, req, res, next) => {
//     console.error('❌ Error:', err.message);
//     console.error('Stack:', err.stack);
    
//     const message = process.env.NODE_ENV === 'production' 
//         ? 'Internal server error. Please try again later.' 
//         : err.message;
    
//     const statusCode = err.status || 500;
    
//     res.status(statusCode).json({
//         success: false,
//         message: message,
//         ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
//         timestamp: new Date().toISOString()
//     });
// });

// // =======================
// //   PORT SETTINGS
// // =======================
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`\n🔥 Server started on port ${PORT}`);
//     console.log(`🔒 Security Features:`);
//     console.log(`   ✅ Helmet (Security Headers)`);
//     console.log(`   ✅ NoSQL Injection Protection`);
//     console.log(`   ✅ SQL Injection Protection`);
//     console.log(`   ✅ Rate Limiting (Global/Auth/Admin)`);
//     console.log(`   ✅ Request Size Limiter (10MB)`);
//     console.log(`   ✅ Parameter Pollution Prevention`);
//     console.log(`   ✅ Input Sanitization`);
//     console.log(`   ✅ Strict CORS`);
//     console.log(`\n📡 Server is ready to accept requests!\n`);
// });


// backend/server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// ✅ Security Middleware Imports
import {
    securityHeaders,
    noSqlSanitize,
    globalLimiter,
    authLimiter,
    adminLimiter,
    sanitizeQueryParams,
    sanitizeBody,
    preventParameterPollution,
    requestSizeLimiter,
    preventSqlInjection
} from './middleware/securityMiddleware.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// App initialize
const app = express();

// ✅ Trust proxy for Render.com rate limiting
app.set('trust proxy', 1);

// =======================
//   🔒 SECURITY MIDDLEWARE (Order Matters!)
// =======================

// 1. Security Headers (Helmet) - MUST BE FIRST
app.use(securityHeaders);

// 2. CORS setup - TEMPORARY OPEN FOR TESTING
app.use(cors());

// 3. Request Size Limiter (10MB limit)
app.use(requestSizeLimiter);

// 4. Global Rate Limiting (500 requests per 15 minutes)
app.use(globalLimiter);

// 5. NoSQL Injection Protection
app.use(noSqlSanitize);

// 6. XSS Protection - DISABLED (causes issues on Render)
// app.use(xssProtection);

// 7. SQL Injection Prevention
app.use(preventSqlInjection);

// 8. Query Parameter Sanitizer
app.use(sanitizeQueryParams);

// 9. Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 10. Body Data Sanitizer (After body parser)
app.use(sanitizeBody);

// 11. Prevent Parameter Pollution
app.use(preventParameterPollution);

// =======================
//   STATIC FILES
// =======================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
//   DATABASE CONNECTION
// =======================
connectDB();

// =======================
//   ROUTES with Additional Rate Limiting
// =======================

// Apply strict rate limit to auth routes (5 attempts per 15 min)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);

// Apply admin rate limit to admin routes (2000 requests per hour)
app.use('/api/admin', adminLimiter);
app.use('/api/products/add', adminLimiter);
app.use('/api/products/update', adminLimiter);
app.use('/api/products/delete', adminLimiter);

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupon', couponRoutes);
app.use("/api/user", userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/notifications', notificationRoutes);

// =======================
//   HEALTH CHECK
// =======================
app.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: '🚀 Backend is running with full security!',
        timestamp: new Date().toISOString(),
        security: {
            headers: '✅ Helmet',
            nosql: '✅ mongoSanitize',
            rateLimit: '✅ Enabled',
            cors: '✅ OPEN (Testing)',
            sqlInjection: '✅ Protected'
        }
    });
});

// =======================
//   404 Handler
// =======================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// =======================
//   Global Error Handler
// =======================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error. Please try again later.' 
        : err.message;
    
    const statusCode = err.status || 500;
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
});

// =======================
//   PORT SETTINGS
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🔥 Server started on port ${PORT}`);
    console.log(`🔒 Security Features:`);
    console.log(`   ✅ Helmet (Security Headers)`);
    console.log(`   ✅ NoSQL Injection Protection`);
    console.log(`   ✅ SQL Injection Protection`);
    console.log(`   ✅ Rate Limiting (Global/Auth/Admin)`);
    console.log(`   ✅ Request Size Limiter (10MB)`);
    console.log(`   ✅ Parameter Pollution Prevention`);
    console.log(`   ✅ Input Sanitization`);
    console.log(`   ✅ CORS (Testing Mode)`);
    console.log(`\n📡 Server is ready to accept requests!\n`);
});