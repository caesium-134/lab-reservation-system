const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
    const { username, password, rememberMe } = req.body;

    const foundUser = await User.findOne({ username });

    if (foundUser && await bcrypt.compare(password, foundUser.password)) {
        req.session.user = foundUser.username;
        if (rememberMe) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 21;
        } else {
            req.session.cookie.expires = false;
        }
        res.redirect("/dashboard");
    } else {
        res.send("Invalid Login");
    }
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(400).send("Username or email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            name: username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(200).send("User registered successfully!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};
