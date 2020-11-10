// access to campground & review JOI schemas
const { campgroundSchema, reviewSchema } = require('./schemas.js');
// require expresserror
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


// middleware function
module.exports.isLoggedIn = (req, res, next) => {
    // show user stored in passport session
    // console.log("REQ.USER...", req.user);
    // use passport helper method isAuthenticated to check if user is logged in the give error and redirect if not (uses the session, is automatically added to the req object itself, has to do with serialize/deserialize user)
    if (!req.isAuthenticated()) {
        // store the url client is trying to request
        // use console.log to print & check which method should be used to get the correct path to the requested URL
        // console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Please login')
        // remember return breaks out of the statement, w/o return, in this app res.render('...') from routes will attempt to run and render a new header+body+etc..
        return res.redirect('/login');
    }
    next();
}

// joi checking for correct inputs for server-side validations for camprounds
module.exports.validateCampground = (req, res, next) => {
    // check with req.body (make sure that all required pieces are correct and in the body object)
    const { error } = campgroundSchema.validate(req.body);
    // if the pieces are not in the body, then handle the error
    if (error) {
        // map over the detials object in the error to turn it into a string save into variable msg
        const msg = error.details.map(el => el.message).join(',')
        // pass through error that is being thrown
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// function to verify that currentUser has the permission (is the owner) to edit/delete campground 
module.exports.isAuthor = async (req, res, next) => {
    // get campground id from the url
    const { id } = req.params;
    // save id to variable
    const campground = await Campground.findById(id);
    // is author equal to userId, if not give error and redirect
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
// function to verify that currentUser has the permission (is the owner) to edit/delete review 
module.exports.isReviewAuthor = async (req, res, next) => {
    // get campground and review Ids from the url
    const { id, reviewId } = req.params;
    // save reviewId to variable
    const review = await Review.findById(reviewId);
    // if review author is not equal to currentuserId, give error and redirect (using pulled campgroundId) back to campground show page
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


// joi checking for correct inputs for server-side validations for reviews with EXPRESS ERROR
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    // console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
