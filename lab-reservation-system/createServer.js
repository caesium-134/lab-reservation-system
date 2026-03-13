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

app.engine("hbs", exphbs.engine({extname: "hbs", defaultLayout: false}));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect("mongodb://localhost:27017/appDB");



app.use(session({
    secret: "very-super-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:1000*60*60*24*30,
        httpOnly: true
    }
}));

const User = require("./models/user");

app.get("/seed", async (req, res) => {
    await User.deleteMany({});
    await User.create({ username: "admin", password: "admin123" });
    res.send("User seeded! Username: admin | Password: admin123");
});

app.get("/", (req,res)=>{
    res.render("index");
});

app.get("/index", (req,res)=>{
    res.render("index");
});

app.get("/register", (req,res)=>{
    res.render("register");
});

app.post("/index", authController.login);

function isAuthenticated(req, res, next){
    if(req.session.user){
        next();
    }
    else{
        res.redirect("/index");
    }
}

app.get("/dashboard", isAuthenticated, (req,res) => {
    res.render("dashboard", { username: req.session.user });
});

app.get("/editprofile", isAuthenticated, (req,res) => {
    res.render("editprofile", { username: req.session.user });
});

app.get("/laboratories", isAuthenticated, (req,res) => {
    res.render("laboratories", { username: req.session.user });
});

app.get("/menu", isAuthenticated, (req,res) => {
    res.render("menu", { username: req.session.user });
});

app.get("/reservation", isAuthenticated, (req,res) => {
    res.render("reservation", { username: req.session.user });
});

app.get("/view-reservations", isAuthenticated, (req,res) => {
    res.render("view-reservations", { username: req.session.user });
});


// api route for reservations
const Reservation = require("./models/reservations");

// get all reservations
app.get("/api/reservations", isAuthenticated, async (req, res) => {
    const reservations = await Reservation.find();
    res.json(reservations);
});

// create a reservation
app.post("/api/reservations", isAuthenticated, async (req, res) => {
    const { date, timeslot, seat, lab } = req.body;

    const existing = await Reservation.findOne({ date, time: timeslot, seat_name: String(seat), lab });
    if (existing) return res.json({ success: false, message: "Seat already taken" });

    const newReservation = new Reservation({
        seat_name: String(seat),
        lab: lab || "A",
        date,
        time: timeslot,
        user: req.session.user
    });

    await newReservation.save();
    res.json({ success: true });
});  

app.listen(3000, () => {
    console.log("SERVER RUNNING");
});
