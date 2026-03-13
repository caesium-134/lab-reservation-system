const User = require("../models/user");

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const foundUser = await User.findOne({ username, password });

    if(foundUser){
        req.session.user = foundUser.username;
        res.redirect("/dashboard");
    }
    else{
        res.send("Invalid Login");
    }
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).send("All fields are required.");
    }

    try{
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if(existing){
            return res.status(400).send("Username or email already exists.");
        }

        const newUser = new User({
            username,
            name: username,
            email,
            password
        });

        await newUser.save();

        res.status(200).send("User registered successfully!");
    } 
    catch(err){
        console.error(err);
        res.status(500).send("Server error");
    }
};