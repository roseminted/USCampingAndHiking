// this is where we go to look at the routes, set up middleware, and pass in the contoller methods
const express = require('express');
const router = express.Router();
// require campgrounds controllers
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync');
// import middleware
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
// require multer
const multer = require('multer');
// require our cloudinary storage
const { storage } = require('../cloudinary');
// initialize multer and tell it where to save images
const upload = multer({ storage });

// campground model
const Campground = require('../models/campground');

router.route('/')
    // index route
    .get(catchAsync(campgrounds.index))
    // post route to create new campground with uploaded images and all fields required, plus async error handeling
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

// create new campground form route
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// this route will take :id and look up the corresponding campground in the database
router.route('/:id')
    // show page route (must be after other /campground/... pages as :id will read /... as /:id)
    .get(catchAsync(campgrounds.showCampground))
    // route to add update to db and show update on page
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    // route to delete campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// route to edit form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;