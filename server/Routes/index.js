const express = require("express");
const router = express.Router();
const userRoute = require("./userRoute");
const chatRoute = require("./chatRoute");
const messageRoute = require("./messageRoute");
const errorHandler = require("../middlewares/errorHandler");

router.get("/", (req, res) => {
  res.send("Welcome to our chat API...");
});

router.use("/api/users", userRoute);
router.use("/api/chats", chatRoute);
router.use("/api/messages", messageRoute);

router.use(errorHandler);

module.exports = router;
