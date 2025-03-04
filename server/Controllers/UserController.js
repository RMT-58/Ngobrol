const { signToken } = require("../helpers/jwt");
const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");

class UserController {
  static async registerUser(req, res, next) {
    const { name, email, password } = req.body;
    try {
      const newUser = await User.create({
        name,
        email,
        password,
      });

      const result = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  static async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) throw { name: "BadRequest", message: "Email is required" };
      if (!password)
        throw { name: "BadRequest", message: "Password is required" };

      const user = await User.findOne({ where: { email } });
      if (!user || !comparePassword(password, user.password)) {
        throw { name: "BadRequest", message: "Invalid email or password" };
      }

      const access_token = signToken({ id: user.id });
      res.json({ access_token });
    } catch (error) {
      next(error);
    }
  }

  static async findUser(req, res, next) {
    try {
      const user = await User.findByPk(req.params.userId);
      if (!user) throw { name: "NotFound", message: "User not found" };

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
