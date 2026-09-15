// import BookPooja from '../models/BookPoojaSchema.js'; 
import Bookpooja from '../models/BookPoojaModel.js';
import User from '../models/User.js';

export const GetBookPooja = async (req, res) => {
    try {
        const {
            templeID,
            UserId,
            PoojaID,
            poojaDate,
            name, 
            Gotra,
            pujaType, 
            packageId,
            address 
        } = req.body;

        // 1. Validate required fields
        if (!UserId || !PoojaID) {
            return res.status(400).json({ 
                success: false, 
                message: "UserId and PoojaID are required." 
            });
        }

        // 2. Check if user exists in DB
        const userexist = await User.findOne({ _id: UserId }, { _id: 1 });
        if (!userexist) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 3. Create a new booking instance
        const newBooking = new BookPooja({
            templeID: templeID || undefined,
            userId: UserId,
            poojaId: PoojaID,
            name: name || [], 
            dateOfPooja: poojaDate,
            gotra: Gotra,
            packageId: packageId,
            pujaType: pujaType || 'sankalp_prasad_puja',
            address: pujaType === 'at_home_pandit' ? address : undefined,
            status: "pending",
            paymentStatus: "pending"
        });

        const savedBooking = await newBooking.save();

        if (savedBooking) {
            // 4. Update User's Pooja Bookings array
            const userUpdate = await User.findByIdAndUpdate(
                UserId,
                {
                    $push: {
                        PoojaBookings: {
                            bookingId: savedBooking._id,
                            date: new Date().toISOString(),
                            time: new Date().toISOString(),
                        },
                    },
                },
                { new: true }
            );

            if (userUpdate) {
                return res.status(200).json({
                    success: true,
                    message: "Pooja booked successfully",
                    data: savedBooking,
                });
            }
        }

        return res.status(400).json({
            success: false,
            message: "Failed to book pooja",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error: " + error.message,
        });
    }
};