const { signToken } = require("../helpers/jwt");

class UserController {
  static async registerUser(req, res) {
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
      console.log(error);
      if (error.name === "SequelizeValidationError") {
        res.status(400).json({ message: error.errors[0].message });
      } else if (error.name === "SequelizeUniqueConstraintError") {
        res.status(400).json({ message: "Email must be unique" });
      } else {
        res.status(500).send({ message: "Internal server error" });
      }
    }
  }
  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const access_token = signToken({ id: user.id });
      res.json({ access_token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async findUser(req, res) {
    const userId = req.params.userId;
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async getUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = UserController;
