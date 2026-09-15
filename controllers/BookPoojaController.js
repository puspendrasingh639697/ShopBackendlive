import Bookpooja from '../models/BookPoojaModel.js';
import PoojaDetails from '../models/PoojaListModel.js';

export const createBooking = async (req, res) => {
    try {
        const { 
            poojaId, 
            templeID, 
            names, 
            phoneNumber, 
            gotra, 
            pujaType, 
            packageType, 
            dateOfPooja, 
            address 
        } = req.body;

        const userId = req.user?._id; 

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Please login first" });
        }

        // 1. Validate if Pooja exists
        const pooja = await PoojaDetails.findById(poojaId);
        if (!pooja) {
            return res.status(404).json({ success: false, message: "Pooja not found" });
        }

        // 2. Foolproof Dynamic Price Calculation
        let totalAmount = 0;
        const selectedPackage = packageType || 'single';

        if (pooja.pricing && typeof pooja.pricing === 'object') {
            // Agar pricing object hai, toh selected package uthao, warna fallback to single/price
            totalAmount = pooja.pricing[selectedPackage] || pooja.pricing.single || pooja.price || 0;
        } else if (pooja.price) {
            // Agar direct price field hai
            totalAmount = pooja.price;
        }

        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Pricing configuration missing for this pooja." 
            });
        }

        // 3. Conditional Address Validation for Physical/At-home Poojas
        if ((pujaType === 'at_home_pandit' || pujaType === 'sankalp_prasad_puja') && !address) {
            return res.status(400).json({ 
                success: false, 
                message: "Address is mandatory for home/physical delivery poojas" 
            });
        }

        // 4. Validate Devotee Names array
        if (!names || !Array.isArray(names) || names.length === 0) {
            return res.status(400).json({ success: false, message: "At least one devotee name is required for Sankalp" });
        }

       // 5. Create New Booking Record with Proper Mapping
        const newBooking = new Bookpooja({
            userId,
            poojaId,
            templeID: templeID || pooja.templeID || pooja.templeId,
            names: names || [], // Ensure names array maps correctly
            phoneNumber,
            gotra: gotra || "Not Specified",
            pujaType: pujaType || pooja.pujaType || 'live_virtual_puja',
            packageType: selectedPackage,
            totalAmount,
            dateOfPooja: dateOfPooja ? new Date(dateOfPooja) : new Date(), // Safe Date Parsing
            address: address || "N/A (Virtual Pooja)",
            status: "pending",
            paymentStatus: "pending"
        });

        await newBooking.save();

        return res.status(201).json({
            success: true,
            message: "Booking initialized successfully. Proceed to payment.",
            data: newBooking
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
};