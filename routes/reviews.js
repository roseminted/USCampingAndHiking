const express = require('express');
// use {mergeParams: true} bc express router keeps params separate so need to merge params with app.js file
const router = express.Router({ mergeParams: true });
// import middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
// campground model
const Campground = require('../models/campground');
// review model
const Review = require('../models/review');
// require reviews controllers
const reviews = require('../controllers/reviews');
// require error handeling utility packages
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');


// create review route
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete review route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;