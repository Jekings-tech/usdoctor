const Review = require('../models/Review');

// Get reviews for a specific product
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get ALL reviews (for admin panel)
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a new review
exports.addReview = async (req, res) => {
    try {
        const { productId, reviewerName, rating, comment } = req.body;
        
        const review = new Review({
            productId,
            reviewerName: reviewerName || 'Anonymous',
            rating,
            comment
        });
        
        await review.save();
        res.json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a review (admin only)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        
        await review.deleteOne();
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};