const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const StreamChat = require("stream-chat");
const http = require("http");

require("dotenv").config();
const PORT = process.env.PORT;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

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

const server = http.createServer(app);
const initializeSocket = require("./utils/socket");
initializeSocket(server);

connectDB().then(() => {
  try {
    console.log("Connected to Database");
    // app.listen usually but had to change because using sockets.io
    server.listen(PORT, () => {
      console.log("Server Started");
    });
  } catch (err) {
    console.log("Something went wrong",err);
  }
});
