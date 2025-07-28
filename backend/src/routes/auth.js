const express = require("express");
const {validateSignupData} = require("../utils/validation");
const {validateLoginData} = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authRouter = express.Router();
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

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

// Get user profile (for persistence)
authRouter.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint
authRouter.post("/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = authRouter;
