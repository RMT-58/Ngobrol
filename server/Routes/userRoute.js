const express = require("express");
const UserController = require("../Controllers/userController");
const authentication = require("../middlewares/authentication");

const router = express.Router();

router.post("/register", UserController.registerUser);

router.post("/login", UserController.loginUser);

router.use(authentication);
router.get("/find/:userId", UserController.findUser);

router.get("/", UserController.getUsers);

module.exports = router;
