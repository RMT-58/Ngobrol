"use strict";
const { Model } = require("sequelize");

const { hashPassword } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {

          notNull: {
            msg: "Name is required",
          },
          notEmpty: {
            msg: "Name is required",
          },

        },
      },
      email: {
        type: DataTypes.STRING,

        allowNull: false,
        unique: {
          msg: "The email is already taken",
        },
        validate: {
          notNull: { msg: "Email cannot be null" },
          notEmpty: { msg: "Email cannot be empty" },
          isEmail: { msg: "Invalid email format" },

        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {

          notNull: { msg: "Password cannot be null" },
          notEmpty: { msg: "Password cannot be empty" },
          len: {
            args: [6, 100],

            msg: "Password must be at least 6 characters long",
          },
        },
      },
    },
    {

      hooks: {
        beforeCreate: (user) => {
          user.password = hashPassword(user.password);
        },
      },

      sequelize,
      modelName: "User",
    }
  );

  return User;
};
