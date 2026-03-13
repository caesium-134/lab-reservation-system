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