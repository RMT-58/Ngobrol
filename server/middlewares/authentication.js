const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(req, res, next) {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      return next({
        name: "Unauthorized",
        message: "Invalid or Expired token",
      });
    }

    const accessToken = bearerToken.split(" ")[1];
    if (!accessToken) {
      return next({
        name: "Unauthorized",
        message: "Invalid or Expired token",
      });
    }

    let data;
    try {
      data = verifyToken(accessToken);
    } catch (tokenError) {
      return next({
        name: "Unauthorized",
        message: "Invalid or Expired token",
      });
    }

    const user = await User.findByPk(data.id);
    if (!user) {
      return next({
        name: "Unauthorized",
        message: "Invalid or Expired token",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next({
      name: error.name || "InternalServerError",
      message: error.message || "An unexpected error occurred",
    });
  }
}

module.exports = authentication;
