// separate database to seed yelpcamp
const mongoose = require('mongoose');
// impost cities array
const cities = require('./cities');
// connect seedHelpers place & descriptors
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// logic to check if db opened
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// to pick an random element from an array
// array[Math.floor(Math.random() * array.length)]
// will save a random number under the sample variable to choose a title from the seedhelpers
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        // create random price
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // tim user id
            author: '5f92cffef3559c47e423f059',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.Ullam repudiandae quae recusandae sequi quia rem corporis quisquam, repellat alias fugiat veritatis consequuntur dolore tempore saepe quas accusantium tempora id natus.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dbwrcpfja/image/upload/v1604512109/YelpCamp/j63kqur3vugixyg9cdjd.jpg',
                    filename: 'YelpCamp/j63kqur3vugixyg9cdjd'
                },
                {
                    url: 'https://res.cloudinary.com/dbwrcpfja/image/upload/v1604512110/YelpCamp/ombvwy6ubtm0ehxmi9fk.jpg',
                    filename: 'YelpCamp/ombvwy6ubtm0ehxmi9fk'
                },
                {
                    url: 'https://res.cloudinary.com/dbwrcpfja/image/upload/v1604512110/YelpCamp/imbismxcmjxe3uepyti6.jpg',
                    filename: 'YelpCamp/imbismxcmjxe3uepyti6'
                }
            ]
        })
        await camp.save();
    }
}
// close database connection
seedDB().then(() => {
    mongoose.connection.close();
});