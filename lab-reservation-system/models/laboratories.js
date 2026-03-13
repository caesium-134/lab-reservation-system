const mongoose = require("mongoose");
 
const laboratorySchema = new mongoose.Schema({
    
    name: String,
    room: String,
    capacity: Number,
    description: String,
 
    status: String,
 
    image: String
});
 
module.exports = mongoose.model("Laboratory", laboratorySchema);