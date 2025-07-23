const validator = require("validator");
const validateSignupData = (req) => {
    const {name, emailId, password} = req.body;
    if(!validator.isEmail(emailId)){
        throw new Error("Invalid Email Address");
    }
    if(!password){
        throw new Error("Password is required");
    }
    if(!validator.isStrongPassword(password)){
        throw new Error("Weak Password");
    }
}

const validateLoginData = (req)=>{
    const {name, emailId, password} = req.body;
    if(!validator.isEmail(emailId)){
        throw new Error("Invalid Email Address");
    }
    if(!password){
        throw new Error("Password is required");
    }
}

module.exports = {validateSignupData, validateLoginData};