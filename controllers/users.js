// require user model
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        // info we want from req.body
        const { email, username, password } = req.body;
        // create user model instance and pass in email and username
        const user = new User({ email, username });
        // takes new user instance we just made and takes the password the user entered, and hashes & salts the password to store it 
        const registeredUser = await User.register(user, password);
        // login newly registered user and if errors handle
        req.login(registeredUser, err => {
            if (err) return next(err);
            // check user in console
            // console.log(registeredUser)
            // if user is created, send flash message and redirect to campgrounds page
            req.flash('success', 'Welcome to US Camping &amp; Hiking!');
            res.redirect('/campgrounds');
        })
        // if an error occurs, catch the error
    } catch (e) {
        // flash caught error message to client & redirect to register page
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    // return to stored URL that client use trying to request or go to campgrounds
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    // passport middelware to logout
    req.logout();
    // flash message
    req.flash('success', 'Logged Out');
    // redirect to home page
    res.redirect('/campgrounds');
}