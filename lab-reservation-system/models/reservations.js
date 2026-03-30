const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seat_name:   String,
    lab:         String,
    date:        String,
    time:        String,
    anonymous:   { type: Boolean, default: false },
    requestDate: { type: Date, default: Date.now },
    status:      { type: String, default: "active" },
});

module.exports = mongoose.model("Reservation", reservationSchema);
