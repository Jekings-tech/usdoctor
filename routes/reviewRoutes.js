const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// IMPORTANT: Admin route MUST come before the /:productId route
router.get('/admin/all', reviewController.getAllReviews);

// Customer routes
router.get('/:productId', reviewController.getReviews);
router.post('/', reviewController.addReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;