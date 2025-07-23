const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials : true
  })
);

const authRouter = require("./routes/auth");

app.use("/", authRouter);

connectDB().then(() => {
  try {
    console.log("Connected to Database");
    app.listen(PORT, () => {
      console.log("Server Started");
    });
  } catch (err) {
    console.log("Something went wrong");
  }
});
