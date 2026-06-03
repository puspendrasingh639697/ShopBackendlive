


// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import nodemailer from 'nodemailer';
// import dotenv from "dotenv";
// dotenv.config();

// // --- NODEMAILER CONFIG ---
// // Isse function ke bahar rakha hai taaki forgotPassword use kar sake


// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465, // Port 465 SSL ke liye best hai
//   secure: true, // Port 465 ke saath true zaroori hai
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     // Ye line certificates errors ko bypass karegi
//     rejectUnauthorized: false
//   }
// });

// // Transporter verify karne ke liye ye code add kar lo (Temporary)
// transporter.verify(function (error, success) {
//   if (error) {
//     console.log("Transporter Error:", error);
//   } else {
//     console.log("Server is ready to take our messages");
//   }
// });
// // --- REGISTER (Naya Account Banana) ---
// export const register = async (req, res) => {
//     try {
//         const { name, email, password, phone } = req.body;

//         const userExists = await User.findOne({ email });
//         if (userExists) return res.status(400).json({ message: "User already exists" });

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await User.create({ 
//             name, 
//             email, 
//             password: hashedPassword, 
//             phone 
//         });

//         res.status(201).json({ message: "User Registered Successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // --- LOGIN (Account kholna) ---
// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ message: "User not found" });

//         const isMatch = await bcrypt.compare(password, user.password); 
//         if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//             expiresIn: '90d',
//         });

//         res.status(200).json({
//             message: "Login Successful!",
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone,
//                 isAdmin: user.isAdmin || false
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // --- FORGOT PASSWORD (Link Bhejna) ---
// export const forgotPassword = async (req, res) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) return res.status(404).json({ message: "User not found!" });

//         // Token jo 15 min mein expire ho jayega
//         const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
//         const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: user.email,
//             subject: "Password Reset Request - Ram Cosmetic",
//             html: `
//                 <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
//                     <h3>Password Reset Request</h3>
//                     <p>Aapne password reset ke liye request kiya hai. Niche diye gaye button par click karein:</p>
//                     <a href="${resetLink}" style="background: #ef4444; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
//                     <p style="margin-top: 20px; color: #666; font-size: 12px;">Ye link 15 minute mein expire ho jayega. Agar aapne ye request nahi ki, toh isse ignore karein.</p>
//                 </div>
//             `,
//         };

//         await transporter.sendMail(mailOptions);
//         res.status(200).json({ message: "Reset link sent to your email!" });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Email sending failed!" });
//     }
// };

// // --- RESET PASSWORD (Naya Password Save Karna) ---
// export const resetPassword = async (req, res) => {
//     const { token } = req.params;
//     const { password } = req.body;

//     try {
//         // 1. Token verify karo
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
//         // 2. User dhundo
//         const user = await User.findById(decoded.id);
//         if (!user) return res.status(404).json({ message: "User not found!" });

//         // 3. Naye password ko hash karo
//         const hashedPassword = await bcrypt.hash(password, 10);
//         user.password = hashedPassword;
//         await user.save();

//         res.status(200).json({ message: "Password updated successfully!" });
//     } catch (error) {
//         res.status(400).json({ message: "Invalid or expired token!" });
//     }
// };


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

// ✅ REGISTER
export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hashedPassword, phone });

        res.status(201).json({ message: "User Registered Successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ LOGIN — FIXED (generateAccessToken use kiya)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // ✅ Yahi fix hai — type: 'access' automatically add hoga
        const token = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            message: "Login Successful!",
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin || false
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const resetToken = generateAccessToken(user._id);
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request - Ram Cosmetic",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h3>Password Reset Request</h3>
                    <p>Aapne password reset ke liye request kiya hai. Niche diye gaye button par click karein:</p>
                    <a href="${resetLink}" style="background: #ef4444; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">Ye link 1 ghante mein expire ho jayega. Agar aapne ye request nahi ki, toh isse ignore karein.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Reset link sent to your email!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Email sending failed!" });
    }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token!" });
    }
};