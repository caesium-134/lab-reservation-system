const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    seat_name: String,
    lab: String,
    date: String,
    time: String
});

module.exports = mongoose.model("Reservation", reservationSchema);

