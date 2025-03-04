const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(req, res, next) {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      throw { name: "Unauthorized", message: "Invalid or Expired token" };
    }

    const accessToken = bearerToken.split(" ")[1];
    if (!accessToken) {
      throw { name: "Unauthorized", message: "Invalid or Expired token" };
    }

    const data = verifyToken(accessToken);

    const user = await User.findByPk(data.id);
    if (!user) {
      throw { name: "Unauthorized", message: "Invalid or Expired token" };
    }

    req.user = { id: user.id, email: user.email, role: user.role };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authentication;
