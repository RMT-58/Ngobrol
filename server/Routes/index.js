const express = require("express");
const router = express.Router();
const userRoute = require("./userRoute");
const chatRoute = require("./chatRoute");
const messageRoute = require("./messageRoute");
const errorHandler = require("../middlewares/errorHandler");
const authentication = require("../middlewares/authentication");

router.get("/", (req, res) => {
  res.json({ message: "Welcome to our chat API..." });
});

router.use("/users", userRoute);

router.use(authentication);
router.use("/chats", chatRoute);
router.use("/messages", messageRoute);

router.use(errorHandler);

module.exports = router;
