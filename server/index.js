
const cors = require("cors");
// const mongoose = require("mongoose");
const express = require("express");

const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
const userRoute = require("./Routes/userRoute");
const errorHandler = require("./middlewares/errorHandler");

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoute);
// app.use("/api/chats", chatRoute);
// app.use("/api/messages", messageRoute);

app.get("/", (req, res) => {
  res.send("Welcome to our chat API...");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}...`);
});
app.use(errorHandler);

module.exports = app;

