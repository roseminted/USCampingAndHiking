const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
// pluggin in passport-local-mongoose will add on to UserSchema a field for username & password, make sure not duplicates, plus some additional methods to we can use
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);