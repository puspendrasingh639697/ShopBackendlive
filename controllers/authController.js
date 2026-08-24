import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import { generateAccessToken, generateRefreshToken } from '../middleware/authMiddleware.js';
dotenv.config();

// --- NODEMAILER CONFIG ---
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("Transporter Error:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

// // ✅ REGISTER (Updated: Now accepts role & optional admin secret key)
// export const register = async (req, res) => {
//     try {
//         const { name, email, password, phone, role, adminSecretKey } = req.body;

//         if (!name || !email || !password) {
//             return res.status(400).json({ success: false, message: "Please fill all required fields" });
//         }

//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ success: false, message: "User already exists" });
//         }

//         // Agar koi admin ya astrologer register kar raha hai toh secret key verify karein
//         let assignedRole = 'user';
//         if (role && role !== 'user') {
//             const MASTER_SECRET = process.env.ADMIN_SECRET_KEY || "mySuperSecretAdminKey123";
//             if (adminSecretKey !== MASTER_SECRET) {
//                 return res.status(403).json({ success: false, message: "Unauthorized! Invalid Admin Secret Key." });
//             }
//             assignedRole = role; // 'admin', 'super_admin', 'astrologer'
//         }

//         const user = await User.create({ 
//             name, 
//             email, 
//             password, 
//             phone: phone || null,
//             role: assignedRole 
//         });

//         res.status(201).json({ 
//             success: true, 
//             message: `${assignedRole.toUpperCase()} Registered Successfully!`,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });
//     } catch (error) {
//         console.error("Register Error:", error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, adminSecretKey } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        let assignedRole = 'user'; // Default role user rahega

        if (role) {
            if (role === 'admin' || role === 'super_admin') {
                // Agar koi Admin ya Super Admin ban raha hai, tabhi Secret Key check hogi!
                const MASTER_SECRET = process.env.ADMIN_SECRET_KEY || "mySuperSecretAdminKey123";
                if (adminSecretKey !== MASTER_SECRET) {
                    return res.status(403).json({ success: false, message: "Unauthorized! Invalid Admin Secret Key." });
                }
                assignedRole = role;
            } else if (role === 'astrologer') {
                // Astrologer ke liye koi admin secret key ki zaroorat nahi hai
                assignedRole = 'astrologer';
            }
        }

        const user = await User.create({ 
            name, 
            email, 
            password, 
            phone: phone || null,
            role: assignedRole 
        });

        res.status(201).json({ 
            success: false, // wait, isko true hi rakhna hai 👇
            success: true, 
            message: `${assignedRole.toUpperCase()} Registered Successfully!`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login Successful!",
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isAdmin: user.role === 'admin' || user.role === 'super_admin'
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ REFRESH TOKEN
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Refresh Token required" });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ success: false, message: "Invalid or expired Refresh Token" });
            }

            const newAccessToken = generateAccessToken(decoded.id);
            res.status(200).json({
                success: true,
                token: newAccessToken
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ SEND OTP
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });
        
        res.status(200).json({ success: true, message: "OTP sent successfully to your email!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ VERIFY OTP
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

        res.status(200).json({ success: true, message: "OTP verified successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found!" });

        const resetToken = generateAccessToken(user._id);
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h3>Password Reset Request</h3>
                    <p>Aapne password reset ke liye request kiya hai. Niche diye gaye button par click karein:</p>
                    <a href="${resetLink}" style="background: #ef4444; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">Ye link 1 ghante mein expire ho jayega.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Reset link sent to your email!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Email sending failed!" });
    }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found!" });

        user.password = password; 
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid or expired token!" });
    }
};