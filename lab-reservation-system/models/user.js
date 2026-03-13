const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    //For Login
    username: String,
    password: String,

    //User Information
    id_no: String,
    name: String,
    email: String,
    bio: String,
    school_year: String,
    birthday: Date,
    college: String,
    course: String,

    //Personalization
    pfp: String,
    header: String
});

module.exports = mongoose.model("User", userSchema);

