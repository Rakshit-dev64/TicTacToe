const express = require("express");
const {validateSignupData} = require("../utils/validation");
const {validateLoginData} = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authRouter = express.Router();
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const { name, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      emailId,
      password: passwordHash,
    });
    const signedUser = await user.save();
    const token = jwt.sign({ _id: signedUser._id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ message: "User added successfully", data: signedUser });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req);
    const { emailId, password } = req.body;
    const loggedInUser = await User.findOne({ emailId: emailId });
    if (!loggedInUser) {
      throw new Error("Invalid Credentials");
    }
    isPasswordValid = await bcrypt.compare(password, loggedInUser.password);
    if (isPasswordValid) {
      // create jwt token
      const token = jwt.sign({ _id: loggedInUser._id }, JWT_SECRET, {
        expiresIn: "1d",
      });
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      res.send(loggedInUser);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = authRouter;
