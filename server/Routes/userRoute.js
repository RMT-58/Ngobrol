const express = require("express");
const UserController = require("../Controllers/UserController");

const router = express.Router();

router.post("/register", UserController.registerUser);

router.post("/login", UserController.loginUser);

router.get("/find/:userId", UserController.findUser);

router.get("/", UserController.getUsers);

module.exports = router;
