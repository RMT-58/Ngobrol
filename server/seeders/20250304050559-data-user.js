"use strict";

const { hashPassword } = require("../helpers/bcrypt");

const USER_SEEDS = [
  {
    name: "rian",
    email: "rian@gmail.com",
    password: hashPassword("123123"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "deka",
    email: "deka@gmail.com",
    password: hashPassword("123123"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "thomy",
    email: "thomy@gmail.com",
    password: hashPassword("123123"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "moses",
    email: "moses@gmail.com",
    password: hashPassword("123123"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkInsert("Users", USER_SEEDS);
    } catch (error) {
      console.error("Error during user seeding:", error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete("Users", null, {});
    } catch (error) {
      console.error("Error during recipe unseeding:", error);
    }
  },
};
