// where we go for the app logic, query calls
// campground model
const Campground = require('../models/campground');
// require mapbox geocoding service
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// pass in our mapbox token from the .env file
const mapBoxToken = process.env.MAPBOX_TOKEN;
// pass the mapBoxToken through when we initialize (aka instantiate) a new mapbox geocoding instance 
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
// require exported cloudinary object
const { cloudinary } = require("../cloudinary");

// index page controller with async function
module.exports.index = async (req, res) => {
    // find all campgrounds and save to campgrounds variable
    const campgrounds = await Campground.find({});
    // console.log all campgrounds
    // console.log(campgrounds);
    // pass campgrounds variable of all campgrounds to the index template and render template
    res.render('campgrounds/index', { campgrounds });
}
// create new campground form controller
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}
// post contoller to create new campground plus async error handeling
module.exports.createCampground = async (req, res, next) => {
    // take our geocoder client we created, and call forwardGeocode on it and save it to the variable geoData
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
        // we have to send the query after calling the function
    }).send()
    // previous express error handling, now not needed
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    // take info from input form and make a new campground
    const campground = new Campground(req.body.campground);
    // get and save coordinates in GeoJSON format and save to geometry variable to be saved to the campground being created
    campground.geometry = geoData.body.features[0].geometry;
    // map over files array, pull out path and filename into an object and save to new array
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    // save userId to campground
    campground.author = req.user._id;
    // save new campground to database
    await campground.save();
    console.log(campground);
    // flash message after newly saved campground
    req.flash('success', 'Successfully added a new campground!');
    // redirect to new campground show page, use string template literal and interpolating
    res.redirect(`/campgrounds/${campground._id}`);
}
// show page controller
module.exports.showCampground = async (req, res) => {
    // find campground ID and save to campground (also, save populated review ids to campground)
    const campground = await Campground.findById(req.params.id).populate({
        // populate reviews
        path: 'reviews',
        populate: {
            // populate review's author
            path: 'author'
        }
        // populate author of campground
    }).populate('author');
    // print contents of campground
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    //if no error, pass in to template the found campground saved under the variable campground
    res.render('campgrounds/show', { campground });
}
// edit form controller
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    // find campground ID from database and save to campground
    const campground = await Campground.findById(req.params.id);
    // if error in finding campground, handle error and display message
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    // take found camprgound and render it to the edit form
    res.render('campgrounds/edit', { campground });
}
// controller to add update to db and show update on page
module.exports.updateCampground = async (req, res) => {
    // get campground id object from req.params with de-structuring {}
    const { id } = req.params;
    // print the campground id body
    console.log(req.body);
    // find campground ID from database and save to campground
    // spread operator (...) to spread id object and req.body.campground object into the campground object
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs)
    await campground.save()
    if (req.body.deleteImages) {
        // for each filename found in the deleteImages[] array
        for (let filename of req.body.deleteImages) {
            // cloudinary method to destroy on the uploader, you pass in the filename that you want deleted
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash('success', 'Successfully updated!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    // get campground id object from req.params with de-structuring {}
    const { id } = req.params;
    // find by id and delete and pass in the id to be deleted
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}

