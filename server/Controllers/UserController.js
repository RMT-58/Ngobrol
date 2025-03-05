const { User } = require("../models");
const { signToken } = require("../helpers/jwt");

class UserController {
  static async registerUser(req, res, next) {
    const { name, email, password } = req.body;
    try {
      if (!name || !email || !password) {
        return next({
          name: "BadRequest",
          message: "Name, email, and password are required",
        });
      }

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

      if (!email) {
        return next({
          name: "BadRequest",
          message: "Email is required",
        });
      }

      if (!password) {
        return next({
          name: "BadRequest",
          message: "Password is required",
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return next({
          name: "Unauthorized",
          message: "Invalid email or password",
        });
      }

      const isValidPassword = await user.isValidPassword(password);
      if (!isValidPassword) {
        return next({
          name: "Unauthorized",
          message: "Invalid email or password",
        });
      }

      const access_token = signToken({ id: user.id });
      res.json({
        access_token,
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findUser(req, res, next) {
    const userId = req.params.userId;
    try {
      if (!userId) {
        return next({
          name: "BadRequest",
          message: "User ID is required",
        });
      }

      const user = await User.findByPk(userId, {
        attributes: ["id", "name", "email"],
      });

      if (!user) {
        return next({
          name: "NotFound",
          message: "User not found",
        });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const users = await User.findAll({
        attributes: ["id", "name", "email"],
      });

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
