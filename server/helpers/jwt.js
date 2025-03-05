require("dotenv").config();
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET_KEY;

module.exports = {
  signToken: (data) => jwt.sign(data, secret),

  verifyToken: (token) => {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw { name: "JsonWebTokenError", message: "Invalid or Expired token" };
    }
  },
};
