// controllers/navigationController.js
import mongoose from 'mongoose';
import Bookpooja from '../models/BookPoojaModel.js';
import ChadhavaBooking from '../models/ChadhavaBookingModel.js';
import PoojaInfo from '../models/PoojaListModel.js';
import Chadhava from '../models/ChadhavaModel.js';
import Temple from '../models/Temple.js';

// ═══════════════════════════════════════════════════════════
//   HELPER: Format response
// ═══════════════════════════════════════════════════════════
const formatNavigationResponse = (itemName, itemType, temple) => ({
  success: true,
  itemName,
  itemType,
  temple: {
    id: temple._id,
    name: temple.name,
    address: temple.address || null,
    city: temple.city || null,
    state: temple.state || null,
  },
  destination: {
    latitude: temple.latitude,
    longitude: temple.longitude,
  },
});

// ═══════════════════════════════════════════════════════════
//   1. GET /api/navigation/booking/:bookingId
//   Booking ke baad mandir ka lat/lng
// ═══════════════════════════════════════════════════════════
export const getNavigationForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    // ── Try Puja booking first ──
    let booking = await Bookpooja.findById(bookingId).lean();
    let bookingType = 'puja';
    let itemId = null;
    let itemName = null;

    if (booking) {
      itemId = booking.poojaId;
      itemName = booking.poojaName;
    } else {
      // ── Try Chadhava booking ──
      booking = await ChadhavaBooking.findById(bookingId).lean();
      bookingType = 'chadhava';
      if (booking) {
        itemId = booking.chadhavaId;
        itemName = booking.chadhavaName;
      }
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // ── Ownership check ──
    if (booking.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this booking',
      });
    }

    // ── Payment status check ──
    const isPaid =
      booking.paymentStatus === 'paid' ||
      booking.paymentStatus === 'success';

    if (!isPaid) {
      return res.status(422).json({
        success: false,
        message: 'Navigation is only available for paid bookings',
        paymentStatus: booking.paymentStatus,
      });
    }

    // ── Fetch item with temple populated ──
    let item;
    if (bookingType === 'puja') {
      item = await PoojaInfo.findById(itemId)
        .populate('templeId', 'name address city state latitude longitude isActive')
        .lean();
    } else {
      item = await Chadhava.findById(itemId)
        .populate('templeId', 'name address city state latitude longitude isActive')
        .lean();
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Booked item no longer exists',
      });
    }

    if (!item.templeId) {
      return res.status(422).json({
        success: false,
        message: 'Temple information not available for this booking',
        itemName,
      });
    }

    const temple = item.templeId;

    if (temple.isActive === false) {
      return res.status(422).json({
        success: false,
        message: 'Temple is currently unavailable',
        templeName: temple.name,
      });
    }

    if (
      typeof temple.latitude !== 'number' ||
      typeof temple.longitude !== 'number' ||
      isNaN(temple.latitude) ||
      isNaN(temple.longitude)
    ) {
      return res.status(422).json({
        success: false,
        message: 'Temple coordinates missing',
        templeName: temple.name,
      });
    }

    res.json({
      ...formatNavigationResponse(itemName, bookingType, temple),
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('[navigation/booking] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════
//   2. GET /api/navigation/puja/:pujaId
// ═══════════════════════════════════════════════════════════
export const getNavigationForPuja = async (req, res) => {
  try {
    const { pujaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pujaId)) {
      return res.status(400).json({ success: false, message: 'Invalid puja ID' });
    }

    const puja = await PoojaInfo.findById(pujaId)
      .populate('templeId', 'name address city state latitude longitude isActive')
      .lean();

    if (!puja) {
      return res.status(404).json({ success: false, message: 'Puja not found' });
    }

    if (!puja.templeId) {
      return res.status(422).json({
        success: false,
        message: 'Temple not linked to this puja',
        itemName: puja.PujaName,
      });
    }

    const temple = puja.templeId;

    if (typeof temple.latitude !== 'number' || typeof temple.longitude !== 'number') {
      return res.status(422).json({
        success: false,
        message: 'Temple coordinates missing',
        templeName: temple.name,
      });
    }

    res.json(formatNavigationResponse(puja.PujaName, 'puja', temple));
  } catch (error) {
    console.error('[navigation/puja] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════
//   3. GET /api/navigation/chadhava/:chadhavaId
// ═══════════════════════════════════════════════════════════
export const getNavigationForChadhava = async (req, res) => {
  try {
    const { chadhavaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chadhavaId)) {
      return res.status(400).json({ success: false, message: 'Invalid chadhava ID' });
    }

    const chadhava = await Chadhava.findById(chadhavaId)
      .populate('templeId', 'name address city state latitude longitude isActive')
      .lean();

    if (!chadhava) {
      return res.status(404).json({ success: false, message: 'Chadhava not found' });
    }

    if (!chadhava.templeId) {
      return res.status(422).json({
        success: false,
        message: 'Temple not linked to this chadhava',
        itemName: chadhava.name,
      });
    }

    const temple = chadhava.templeId;

    if (typeof temple.latitude !== 'number' || typeof temple.longitude !== 'number') {
      return res.status(422).json({
        success: false,
        message: 'Temple coordinates missing',
        templeName: temple.name,
      });
    }

    res.json(formatNavigationResponse(chadhava.name, 'chadhava', temple));
  } catch (error) {
    console.error('[navigation/chadhava] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════
//   4. GET /api/navigation/temple/:templeId
// ═══════════════════════════════════════════════════════════
export const getNavigationForTemple = async (req, res) => {
  try {
    const { templeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(templeId)) {
      return res.status(400).json({ success: false, message: 'Invalid temple ID' });
    }

    const temple = await Temple.findById(templeId).lean();

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    if (typeof temple.latitude !== 'number' || typeof temple.longitude !== 'number') {
      return res.status(422).json({
        success: false,
        message: 'Temple coordinates missing',
        templeName: temple.name,
      });
    }

    res.json(formatNavigationResponse(temple.name, 'temple', temple));
  } catch (error) {
    console.error('[navigation/temple] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};