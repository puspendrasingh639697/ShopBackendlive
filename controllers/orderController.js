import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import { createNotification } from './notificationController.js';
import sendEmail from '../utils/sendEmail.js';

// ✅ Create Order (Simplified - No extra validations)
export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, totalPrice, paymentMethod, couponId } = req.body;

        console.log('📦 Order Received:', { orderItems, shippingAddress, totalPrice, paymentMethod });

        // ✅ Basic Validation
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "Cart is empty!" 
            });
        }

        // ✅ Validate each item
        for (const item of orderItems) {
            if (!item.name || !item.qty || !item.price) {
                return res.status(400).json({
                    success: false,
                    message: `Missing fields in item: ${JSON.stringify(item)}`
                });
            }
        }

        // ✅ Create Order - Direct save
        const order = await Order.create({
            user: req.user._id,
            orderItems: orderItems.map(item => ({
                name: item.name,
                qty: Number(item.qty) || 1,
                image: item.image || '',
                price: Number(item.price) || 0,
                productId: item.productId || item.id || null
            })),
            shippingAddress: {
                street: shippingAddress?.street || '',
                city: shippingAddress?.city || '',
                state: shippingAddress?.state || '',
                zipCode: shippingAddress?.zipCode || ''
            },
            paymentMethod: paymentMethod || 'COD',
            totalPrice: Number(totalPrice) || 0,
            couponUsed: couponId || null,
            isPaid: false,
            paymentStatus: 'Pending',
            status: 'Processing'
        });

        console.log('✅ Order Created:', order._id);

        // ✅ Stock reduction (if product exists)
        for (const item of order.orderItems) {
            if (item.productId) {
                try {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        product.stock -= item.qty;
                        await product.save();
                    }
                } catch (err) {
                    console.log('Stock update error:', err.message);
                }
            }
        }

        // ✅ Coupon marking
        if (couponId) {
            try {
                await Coupon.findByIdAndUpdate(couponId, {
                    $push: { usedBy: { userId: req.user._id, orderId: order._id, usedAt: new Date() } },
                    $inc: { usedCount: 1 }
                });
            } catch (couponErr) {
                console.log("Coupon mark error:", couponErr.message);
            }
        }

        // ✅ Notification
        try {
            await createNotification(
                req.user._id,
                'Order Confirmed! 🎉',
                `Your order #${order._id.toString().slice(-8)} has been placed.`,
                'success',
                order._id
            );
        } catch (notifErr) {
            console.log("Notification error:", notifErr.message);
        }

        // ✅ Email
        try {
            await sendEmail({
                email: req.user.email,
                subject: "Order Placed! 🎉 - The Loot Bazaar",
                message: `Hello ${req.user.name},\n\nYour order of ₹${totalPrice} has been placed.\nOrder ID: ${order._id}\n\nThank you for shopping with us!`
            });
        } catch (err) {
            console.log("Email error:", err.message);
        }

        // ✅ Clear cart
        await Cart.findOneAndDelete({ userId: req.user._id });

        res.status(201).json({
            success: true,
            message: "Order Placed! 🎉",
            order: order
        });

    } catch (error) {
        console.error('❌ Create Order Error:', error);
        
        // ✅ Better error response
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: errors[0] || 'Validation failed',
                errors: errors
            });
        }

        res.status(400).json({
            success: false,
            message: error.message || 'Failed to place order'
        });
    }
};

// ✅ Get My Orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('orderItems.productId', 'name image');
        res.status(200).json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error("Get My Orders Error:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// ✅ Get Order By ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.productId', 'name image');
            
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        }

        // ✅ Check if order belongs to user or admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!"
            });
        }

        res.status(200).json({
            success: true,
            order: order
        });
    } catch (error) {
        console.error("Get Order By ID Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Cancel Order
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        }

        if (order.status === 'Processing' || order.status === 'Pending') {
            order.status = 'Cancelled';
            order.isCancelled = true;
            order.cancelledAt = Date.now();
            await order.save();

            // ✅ Restore stock
            for (const item of order.orderItems) {
                if (item.productId) {
                    try {
                        const product = await Product.findById(item.productId);
                        if (product) {
                            product.stock += item.qty;
                            await product.save();
                        }
                    } catch (err) {
                        console.log('Stock restore error:', err.message);
                    }
                }
            }

            // ✅ Notification
            try {
                await createNotification(
                    req.user._id,
                    'Order Cancelled ❌',
                    `Your order #${order._id.toString().slice(-8)} has been cancelled.`,
                    'warning',
                    order._id
                );
            } catch (notifErr) {
                console.log("Cancel notification error:", notifErr.message);
            }

            res.status(200).json({
                success: true,
                message: "Order Cancelled! ✅"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Order cannot be cancelled!"
            });
        }
    } catch (error) {
        console.error("Cancel Order Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Admin: Get All Orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error("Get All Orders Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Admin: Update Order Status
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        }

        order.status = status;
        
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        await order.save();

        // ✅ Notification for status update
        try {
            await createNotification(
                order.user,
                `Order ${status} 📦`,
                `Your order #${order._id.toString().slice(-8)} is now ${status}.`,
                'info',
                order._id
            );
        } catch (notifErr) {
            console.log("Status notification error:", notifErr.message);
        }

        res.status(200).json({
            success: true,
            message: `Order ${status}!`,
            order: order
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Admin: Process Refund
export const processRefund = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        }

        if (order.status === 'Cancelled' && order.isPaid) {
            order.status = 'Refunded';
            order.refundedAt = Date.now();
            await order.save();

            // ✅ Notification
            try {
                await createNotification(
                    order.user,
                    'Refund Processed 💰',
                    `Your refund for order #${order._id.toString().slice(-8)} has been processed.`,
                    'success',
                    order._id
                );
            } catch (notifErr) {
                console.log("Refund notification error:", notifErr.message);
            }

            res.status(200).json({
                success: true,
                message: "Refund Processed! 💰"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Refund conditions not met!"
            });
        }
    } catch (error) {
        console.error("Process Refund Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Admin: Dashboard Stats
export const getAdminStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        const paidOrders = await Order.find({ isPaid: true });
        const totalRevenue = paidOrders.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

        const pendingOrders = await Order.countDocuments({ status: 'Processing' });
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

        res.status(200).json({
            success: true,
            stats: {
                totalOrders,
                totalUsers,
                totalProducts,
                totalRevenue,
                pendingOrders,
                deliveredOrders,
                cancelledOrders
            }
        });
    } catch (error) {
        console.error("Get Admin Stats Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};