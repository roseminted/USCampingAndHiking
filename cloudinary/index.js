const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// begin by setting config on our cloudinary
// this associating our account with this cloudinary instance
cloudinary.config({
    // specify cloud name
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    // specify api key
    api_key: process.env.CLOUDINARY_KEY,
    // api secret
    api_secret: process.env.CLOUDINARY_SECRET
});

// instantiate an instance of cloudinary storage
const storage = new CloudinaryStorage({
    // pass in the cloudinary object that we just configured above
    cloudinary,
    params: {
        // specify in the folder in cloudinary that we should store things in
        folder: 'YelpCamp',
        // specify allowed formats
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

// export 
module.exports = {
    // export cloudinary instance that we configured
    cloudinary,
    // export the storage
    storage
}