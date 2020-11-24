// process.env.NODE_ENV is an environment variable that is usually just "development" or "production"
// if we are running in development mode 
if (process.env.NODE_ENV !== "production") {
    // require the dotenv module and call the config function
    require('dotenv').config();
}
// print env
// console.log(process.env.SECRET);

const express = require('express');
// help with path manipulation, comes with node.js
const path = require('path');
const mongoose = require('mongoose');
// require ejs-mate
const ejsMate = require('ejs-mate');
// express-session used for f  lash messages and authentication
const session = require('express-session');
// require flash
const flash = require('connect-flash');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
// passport allows us to plugin multiple stratagies for authentication 
const passport = require('passport');
const LocalStrategy = require('passport-local');
// require User model
const User = require('./models/user');
// require helmet for security help
const helmet = require('helmet');
// require express-mongo-sanitize to sanitize user's input, no $ or .
const mongoSanitize = require('express-mongo-sanitize');
// require users routes
const usersRoutes = require('./routes/users');
// insert campground model
const Campground = require('./models/campground');
// review model
const Review = require('./models/review');
// require campgrounds route
const campgroundRoutes = require('./routes/campgrounds');
// require reviews route
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require("connect-mongo")(session);
// connect cluster info for mongoatlas database from DB_URL in .env file and save to dbURL
// const dbURL = process.env.DB_URL;
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// local mongo database
// 'mongodb://localhost:27017/yelp-camp' 
// connect to mongoatlas database
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    // Make Mongoose use `findOneAndUpdate()`. Note that this option is `true` by default, you need to set it to false.
    useFindAndModify: false
});

// logic to check if db opened
// save mongoose.connection to variable db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// use ejsMate (which is used to run, parse, and make sense of ejs)
app.engine('ejs', ejsMate);
// set to view ejs files without .ejs tag
app.set('view engine', 'ejs');
// to view views directory note: 2 underscores
app.set('views', path.join(__dirname, 'views'));

// use bodyParser
app.use(express.urlencoded({ extended: true }));
// use methodOverride for PUT and DELETE requests
app.use(methodOverride('_method'));
// use custom css/js sheets
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' }));

const secret = process.env.SECRET || 'thisissecret';
// make storage
const store = new MongoDBStore({
    url: dbURL,
    secret,
    // total in seconds, NOT miliseconds
    touchAfter: 24 * 60 * 60
})
// session store error handler
store.on("error", function (e) {
    console.log("Session Store Error", e)
})

//configure express session
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // this says that our cookies that are set through this session are only accessible through http and not through javascript
        httpOnly: true,
        // this says that this cookie will only work over https
        secure: true,
        // expires a week from now (in miliseconds) + 1000 milisecs in 1 sec * 60 secs in 1 min * 60 min in an hour...etc
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
// use express session
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
// contentSecutiryPolicy from helmet
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    // configure helmet
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbwrcpfja/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// initialize passport
app.use(passport.initialize());
// middleware to stay logged in until and not have to log in on every request (persistent login sessions) must be after express sessions
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// tells passport how to serialize/deserialize user (get user in and out of a session) 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// global middleware for every template
// on res.local.success, the position where .success is, we will have access to automatically in every template
app.use((req, res, next) => {
    // taking a look at the query string for express-mongo-sanitize
    // console.log(req.query);
    // print entire passport session to help see what is store in the session
    // console.log(req.session);
    // once logged in, all templates will have access to current user 
    res.locals.currentUser = req.user;
    // middleware for every request to have a flash message but will not show if no message inside
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
// fake user to show what user will look like
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'yasmin@gmail.com', username: 'yasmin' });
//     //register static method helper from mongoose to register a new user instance with a given password & checks if password is unique
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);
// })

// set up route handelers to each route template and to 'dry' up code
app.use('/', usersRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

// landing page route route
app.get('/', (req, res) => {
    res.render('home');
});

// EXPRESS ERROR handeler
// for every request (this will only run if no other path has matched first so needs to be a end of routes) 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});
// generic/default error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', { err });
});
// save heroku port (80) OR localhost 3000 port to port
const port = process.env.PORT || 3000;
// start server port
app.listen(port, () => {
    console.log(`Service on port ${port}`);
});