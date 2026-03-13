const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const path = require("path");
const authController = require("./controllers/authController");
const session = require("express-session");
const User = require("./models/user");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.engine("hbs", exphbs.engine({extname: "hbs", defaultLayout: false}));

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
        maxAge:1000*60*60*24*30,
        httpOnly: true
    }
}));

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

app.get("/dashboard", isAuthenticated, async (req,res) => {

    const currentUser = await User.findOne({ username: req.session.user }).lean();
    const otherUsers = await User.aggregate([
        { $match: {username: {$ne: req.session.user}}},
        { $sample: { size: 5 }}
    ]);

    res.render("dashboard", { 
        username: req.session.user,
        user: currentUser,
        otherUsers: otherUsers
    });
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

app.get("/search-user", async (req, res) => {

    const query = req.query.q.trim();

    if(!query){
        return res.json([]);
    }

    const users = await User.find({
        name: { $regex: `^${query}$`, $options: "i" }
    }).lean();

    res.json(users);

});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if(err){
            console.log(err);
            return res.send("Error logging out");
        }
        res.redirect("/index");
    });
});

app.delete("/delete-account", isAuthenticated, async (req, res) => {
    try{
        const username = req.session.user;

        await User.findOneAndDelete({ username });

        req.session.destroy(err => {
            if (err) console.log(err);
        });

        res.json({ success: true, message: "Account deleted successfully" });
    } 
    catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to delete account" });
    }
});

app.post("/register", authController.register);