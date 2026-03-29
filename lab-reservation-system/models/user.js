const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    name: String,
    email: String,
    idNumber: String,
    bio: String,
    schoolYear: String,
    birthday: Date,
    college: String,
    course: String,
    profilePic: String,
    header: String
});

module.exports = mongoose.model("User", userSchema);
