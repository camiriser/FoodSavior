var mongoose = require("mongoose");

var profileSchema = new mongoose.Schema({
        
        // id provide the data association to the model user.js
        id:{
                type:mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
        username: String,
        ingredients: [],
        my_recipes:[]
});

module.exports = mongoose.model("Profile", profileSchema);