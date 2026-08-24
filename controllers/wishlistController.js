import Wishlist from '../models/wishlistModel.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products.productId');
    
    if (!wishlist) {
      // Agar wishlist nahi bani hai abhi tak, toh empty return kar do
      return res.status(200).json({ products: [] });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or Remove product from wishlist (Toggle)
// @route   POST /api/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Agar wishlist nahi hai, toh nayi banao aur product add kar do
      wishlist = new Wishlist({
        user: req.user._id,
        products: [{ productId }]
      });
      await wishlist.save();
      return res.status(201).json({ message: 'Product added to wishlist', wishlist });
    }

    // Check karo ki product pehle se wishlist mein hai ya nahi
    const productIndex = wishlist.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      // Agar hai, toh remove kar do (Toggle Off)
      wishlist.products.splice(productIndex, 1);
      await wishlist.save();
      return res.status(200).json({ message: 'Product removed from wishlist', wishlist });
    } else {
      // Agar nahi hai, toh add kar do (Toggle On)
      wishlist.products.push({ productId });
      await wishlist.save();
      return res.status(200).json({ message: 'Product added to wishlist', wishlist });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Remove product from wishlist using DELETE
// @route   DELETE /api/wishlist/:id
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Wishlist items se us product ko filter karke hata do
    wishlist.products = wishlist.products.filter(
      (item) => item.productId.toString() !== req.params.id
    );

    await wishlist.save();
    
    // Updated wishlist return karo
    res.status(200).json({ message: 'Product removed from wishlist', products: wishlist.products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};