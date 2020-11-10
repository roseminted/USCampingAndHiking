// require campground model
const Campground = require('../models/campground');
// require review model
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    //find the campground using the id and save to campground variable
    const campground = await Campground.findById(req.params.id);
    // instantiate new review and pass in req.body.review object
    const review = new Review(req.body.review);
    // save userId to review
    review.author = req.user._id;
    // push onto the campground.reviews proprty of the campground model
    campground.reviews.push(review);
    // save review
    await review.save();
    // save campground
    await campground.save();
    req.flash('success', 'Successfully added a review!');
    // redirect back to the campground show page using (``)string template literal
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    // find campground and then review id
    const { id, reviewId } = req.params;
    // use mongo $pull operator to pull the reviewid from the reviews Id array within the campground Id {pull from the reviews array, the review Id}
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // find review id in the array within the campground and delete
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    // redirect back to show page
    res.redirect(`/campgrounds/${id}`);
}