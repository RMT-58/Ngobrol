require("dotenv").config();
const cors = require("cors");
const express = require("express");

const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Welcome to our chat API...");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}...`);
});

module.exports = app;
