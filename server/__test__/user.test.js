const UserController = require("../controllers/userController");
const { User } = require("../models");
const { signToken } = require("../helpers/jwt");
const { comparePassword } = require("../helpers/bcrypt");

jest.mock("../models");
jest.mock("../helpers/jwt");
jest.mock("../helpers/bcrypt");

describe("UserController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should call next with error if missing fields", async () => {
      req.body = { name: "Test", email: "test@example.com" };
      await UserController.registerUser(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "Name, email, and password are required",
        })
      );
    });

    it("should create a new user and return user data", async () => {
      req.body = {
        name: "Test",
        email: "test@example.com",
        password: "secret",
      };
      const newUser = { id: 1, name: "Test", email: "test@example.com" };
      User.create.mockResolvedValue(newUser);

      await UserController.registerUser(req, res, next);
      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newUser);
    });

    it("should pass Sequelize errors to next", async () => {
      req.body = {
        name: "Test",
        email: "test@example.com",
        password: "secret",
      };
      const error = new Error("DB error");
      User.create.mockRejectedValue(error);

      await UserController.registerUser(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("loginUser", () => {
    it("should error if email is missing", async () => {
      req.body = { password: "secret" };
      await UserController.loginUser(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "Email is required",
        })
      );
    });

    it("should error if password is missing", async () => {
      req.body = { email: "test@example.com" };
      await UserController.loginUser(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "Password is required",
        })
      );
    });

    it("should error if user not found", async () => {
      req.body = { email: "test@example.com", password: "secret" };
      User.findOne.mockResolvedValue(null);

      await UserController.loginUser(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Unauthorized",
          message: "Invalid email or password",
        })
      );
    });

    it("should error if password is invalid", async () => {
      req.body = { email: "test@example.com", password: "secret" };
      const user = { id: 1, email: "test@example.com", password: "hashed" };
      User.findOne.mockResolvedValue(user);
      comparePassword.mockReturnValue(false);

      await UserController.loginUser(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Unauthorized",
          message: "Invalid email or password",
        })
      );
    });

    it("should return token and user data on success", async () => {
      req.body = { email: "test@example.com", password: "secret" };
      const user = {
        id: 1,
        email: "test@example.com",
        password: "hashed",
        name: "Test",
      };
      User.findOne.mockResolvedValue(user);
      comparePassword.mockReturnValue(true);
      signToken.mockReturnValue("token123");

      await UserController.loginUser(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        id: user.id,
        access_token: "token123",
        email: user.email,
        name: user.name,
      });
    });
  });

  describe("findUser", () => {
    it("should error if userId not provided", async () => {
      req.params = {};
      await UserController.findUser(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "User ID is required",
        })
      );
    });

    it("should error if user not found", async () => {
      req.params = { userId: 1 };
      User.findByPk.mockResolvedValue(null);

      await UserController.findUser(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "NotFound",
          message: "User not found",
        })
      );
    });

    it("should return user data if found", async () => {
      req.params = { userId: 1 };
      const user = { id: 1, name: "Test", email: "test@example.com" };
      User.findByPk.mockResolvedValue(user);

      await UserController.findUser(req, res, next);
      expect(res.json).toHaveBeenCalledWith(user);
    });
  });

  describe("getUsers", () => {
    it("should return all users", async () => {
      const users = [
        { id: 1, name: "Test", email: "test@example.com" },
        { id: 2, name: "Another", email: "another@example.com" },
      ];
      User.findAll.mockResolvedValue(users);

      await UserController.getUsers(req, res, next);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it("should pass error to next on failure", async () => {
      const error = new Error("DB error");
      User.findAll.mockRejectedValue(error);

      await UserController.getUsers(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
