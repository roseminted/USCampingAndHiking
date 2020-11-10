const express = require('express');
const router = express.Router();
// note: passport wasnt used for registering, only for login
const passport = require('passport');
// require user model
const User = require('../models/user');
// error handeling
const catchAsync = require('../utilities/catchAsync');
const users = require('../controllers/users');

router.route('/register')
    // REGISTER ROUTES
    // render register form
    .get(users.renderRegister)
    // route to where new users are submitted to
    // take form data and create a new user
    // with error handeling try/catch form from catchAsync and then addition try/catch to send flash message error instead of sending client to an error page
    .post(catchAsync(users.register));

router.route('/login')
    // login form
    .get(users.renderLogin)
    // login route
    // passpost.authenticate = middleware expects us to identify the strategy (get user login info from our 'local' db, google, FB, etc), + error handeling object
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

// logout route
router.get('/logout', users.logout);

module.exports = router;