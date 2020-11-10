const mongoose = require('mongoose');
const Review = require('./review');
// save mongoose.Schema to Schema
const Schema = mongoose.Schema;

// cloudinary url for an image as reference, to transform the cloudinary image into smaller thumbnails
// https://res.cloudinary.com/dbwrcpfja/image/upload/v1604528744/YelpCamp/yebvggic5yttzciaeppj.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
});
// to load popUpMarkUp on clustermap, save virtual property to opts, then save to CampgroundSchema
const opts = { toJSON: { virtuals: true } };

// register the image virtual property: change images on edit form to cloudinary provided thumbnail and update the width in the url
ImageSchema.virtual('thumbnail').get(function () {
    // this refers to the particular image, which can access this.filename or in this case, this.url
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    title: String,
    // images is an array, and each object/document in the array has a url and a filename
    images: [ImageSchema],
    // saves mapbox info for mapping the location point of the campground
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

//register virtual property for popup in cluster map
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`
});

// middleware to delete reviews from database when a campground is deleted
// findOneAndDelete is tied to the campground/:id delete route findByIdAndDelete
// findOneAndDelete is a type of mongo query middleware for documents
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // if a campground = doc is deleted
    if (doc) {
        // delete ids that are in review array
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

//Export function to create "Campgound" model class
module.exports = mongoose.model('Campground', CampgroundSchema);