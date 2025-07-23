const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minLength : 3,
        maxLength : 20
    },
    emailId : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    password : {
        type : String,
        required : true,
        minLength : 6
    }
},{
    timestamps : true
})

module.exports = mongoose.model("User",userSchema);