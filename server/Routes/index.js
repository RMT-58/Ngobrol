const express = require("express");
const router = express.Router();
const errorHandler = require("../middlewares/errorHandler");
const userRoute = require("./userRoute");
// const chatRoute = require("./chatRoute");
// const messageRoute = require("./messageRoute");

app.use("/api/users", userRoute);
// app.use("/api/chats", chatRoute);
// app.use("/api/messages", messageRoute);

router.use(errorHandler);

module.exports = router;
