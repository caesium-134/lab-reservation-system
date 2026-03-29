const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const path = require("path");
const authController = require("./controllers/authController");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.engine("hbs", exphbs.engine({ extname: "hbs", defaultLayout: false, helpers: { eq: (a, b) => a === b } }));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect("mongodb://127.0.0.1:27017/appDB");

app.listen(3000, () => {
    console.log("SERVER RUNNING");
});

app.use(session({
    secret: "very-super-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    }
}));

app.get("/", (req, res) => { res.render("index"); });
app.get("/index", (req, res) => { res.render("index"); });
app.get("/register", (req, res) => { res.render("register"); });

app.post("/index", authController.login);

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/index");
    }
}

// ─── Models ───────────────────────────────────────────────────────────────────
const User = require("./models/user");
const Reservation = require("./models/reservations");
const Laboratory = require("./models/laboratories");

// ─── Dashboard ────────────────────────────────────────────────────────────────
app.get("/dashboard", isAuthenticated, async (req, res) => {
    const currentUser = await User.findOne({ username: req.session.user }).lean();
    const otherUsers = await User.aggregate([
        { $match: { username: { $ne: req.session.user } } },
        { $sample: { size: 5 } }
    ]);
    res.render("dashboard", {
        username: req.session.user,
        user: currentUser,
        otherUsers: otherUsers
    });
});

// ─── Edit Profile ─────────────────────────────────────────────────────────────
app.get("/editprofile", isAuthenticated, async (req, res) => {
    const fullUser = await User.findOne({ username: req.session.user }).lean();
    res.render("editprofile", { user: fullUser });
});

app.post("/editprofile", isAuthenticated, async (req, res) => {
    const { name, email, bio, schoolYear, birthday, college, course, profilePic } = req.body;
    const updates = { name, email, bio, schoolYear, birthday, college, course };
    if (profilePic && profilePic.trim() !== "") {
        updates.profilePic = profilePic;
    }
    await User.findOneAndUpdate({ username: req.session.user }, updates, { new: true });
    res.redirect("/dashboard");
});

// ─── Laboratories ─────────────────────────────────────────────────────────────
app.get("/laboratories", isAuthenticated, async (req, res) => {
    const labs = await Laboratory.find();
    const currentUser = await User.findOne({ username: req.session.user }).lean();
    res.render("laboratories", {
        username: req.session.user,
        user: currentUser,
        labs: labs.map(l => l.toObject())
    });
});

// ─── Reservations ─────────────────────────────────────────────────────────────
app.get("/reservation", isAuthenticated, async (req, res) => {
    const currentUser = await User.findOne({ username: req.session.user }).lean();
    const labs = await Laboratory.find().lean();
    res.render("reservation", {
        username: req.session.user,
        user: currentUser,
        labs: labs
    });
});

app.get("/api/reservations", isAuthenticated, async (req, res) => {
    const reservations = await Reservation.find({}).populate("userId", "name").lean();
    const formatted = reservations.map(r => ({
        date:     r.date,
        timeslot: r.time,
        seat:     parseInt(r.seat_name.replace("Seat ", "")),
        lab:      r.lab,
        user:     r.anonymous ? "Anonymous" : (r.userId?.name || "Unknown")
    }));
    res.json(formatted);
});

app.post("/reservation", isAuthenticated, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.session.user });
        const { date, timeslot, seat, lab, anonymous } = req.body;

        const newReservation = new Reservation({
            userId:    currentUser._id,
            seat_name: `Seat ${String(seat).padStart(2, '0')}`,
            lab:       lab || "Computer Lab",
            date:      date,
            time:      timeslot,
            anonymous: anonymous === "true",
            status:    "active"
        });

        await newReservation.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to save reservation." });
    }
});

// ─── View My Reservations ─────────────────────────────────────────────────────
app.get("/view-reservations", isAuthenticated, async (req, res) => {
    const currentUser = await User.findOne({ username: req.session.user });
    const reservations = await Reservation.find({ userId: currentUser._id });
    res.render("view-reservations", {
        username: req.session.user,
        user: currentUser.toObject(),
        reservations: reservations.map(r => r.toObject())
    });
});

// ─── Delete Reservation ───────────────────────────────────────────────────────
app.delete("/reservation/:id", isAuthenticated, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.session.user });
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservation not found." });
        }

        if (reservation.userId.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own reservations." });
        }

        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Reservation deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// ─── Search Users ─────────────────────────────────────────────────────────────
app.get("/search-user", async (req, res) => {
    const query = req.query.q.trim();
    if (!query) return res.json([]);
    const users = await User.find({
        name: { $regex: query, $options: "i" }
    }).lean();
    res.json(users);
});

// ─── Logout ───────────────────────────────────────────────────────────────────
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.send("Error logging out");
        }
        res.redirect("/index");
    });
});

// ─── Delete Account ───────────────────────────────────────────────────────────
app.delete("/delete-account", isAuthenticated, async (req, res) => {
    try {
        const username = req.session.user;
        await User.findOneAndDelete({ username });
        req.session.destroy(err => {
            if (err) console.log(err);
        });
        res.json({ success: true, message: "Account deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to delete account" });
    }
});

// ─── Register ─────────────────────────────────────────────────────────────────
app.post("/register", authController.register);
