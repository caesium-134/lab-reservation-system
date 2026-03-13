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