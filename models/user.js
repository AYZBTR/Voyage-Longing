const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: String,
    required: true
})


//Username, salting, hashing automatically done!
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);