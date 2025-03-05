const express = require("express");
const MessageController = require("../controllers/messageController");

const router = express.Router();

router.post("/", MessageController.createMessage);

router.get("/:chatId", MessageController.getMessages);

module.exports = router;
