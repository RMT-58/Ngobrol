const ChatController = require("../controllers/chatController");
const { Chat, User } = require("../models");
const { Op } = require("sequelize");

jest.mock("../models");

describe("ChatController", () => {
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

  describe("createChat", () => {
    it("should error if senderId or receiverId is missing", async () => {
      req.body = { senderId: 1 };
      await ChatController.createChat(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "senderId and receiverId are required",
        })
      );
    });

    it("should return existing chat if found", async () => {
      req.body = { senderId: 1, receiverId: 2 };
      const chat = { toJSON: () => ({ id: 10, members: [1, 2] }) };
      Chat.findOne.mockResolvedValue(chat);
      const users = [
        { id: 1, name: "User1", email: "u1@example.com" },
        { id: 2, name: "User2", email: "u2@example.com" },
      ];
      User.findAll.mockResolvedValue(users);

      await ChatController.createChat(req, res, next);
      expect(Chat.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 10,
          members: [1, 2],
          membersDetails: users,
        })
      );
    });

    it("should create a new chat if not found", async () => {
      req.body = { senderId: 1, receiverId: 2 };
      Chat.findOne.mockResolvedValue(null);
      const newChat = { toJSON: () => ({ id: 20, members: [1, 2] }) };
      Chat.create.mockResolvedValue(newChat);
      const users = [
        { id: 1, name: "User1", email: "u1@example.com" },
        { id: 2, name: "User2", email: "u2@example.com" },
      ];
      User.findAll.mockResolvedValue(users);

      await ChatController.createChat(req, res, next);
      expect(Chat.create).toHaveBeenCalledWith({ members: [1, 2] });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 20,
          members: [1, 2],
          membersDetails: users,
        })
      );
    });

    it("should call next on error", async () => {
      req.body = { senderId: 1, receiverId: 2 };
      const error = new Error("Error");
      Chat.findOne.mockRejectedValue(error);

      await ChatController.createChat(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("userChats", () => {
    it("should error if userId is missing", async () => {
      req.params = {};
      await ChatController.userChats(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "userId is required",
        })
      );
    });

    it("should return an empty array if no chats are found", async () => {
      req.params = { userId: 1 };
      Chat.findAll.mockResolvedValue([]);
      User.findAll.mockResolvedValue([]);
      await ChatController.userChats(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should call next on error", async () => {
      req.params = { userId: 1 };
      const error = new Error("Error");
      Chat.findAll.mockRejectedValue(error);

      await ChatController.userChats(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("findChat", () => {
    it("should error if firstId or secondId is missing", async () => {
      req.params = { firstId: 1 };
      await ChatController.findChat(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "Both user IDs are required",
        })
      );
    });

    it("should error if chat not found", async () => {
      req.params = { firstId: 1, secondId: 2 };
      Chat.findOne.mockResolvedValue(null);

      await ChatController.findChat(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "NotFound",
          message: "Chat not found",
        })
      );
    });

    it("should return chat with members details if found", async () => {
      req.params = { firstId: 1, secondId: 2 };
      const chat = { toJSON: () => ({ id: 1, members: [1, 2] }) };
      Chat.findOne.mockResolvedValue(chat);
      const users = [
        { id: 1, name: "User1", email: "u1@example.com" },
        { id: 2, name: "User2", email: "u2@example.com" },
      ];
      User.findAll.mockResolvedValue(users);

      await ChatController.findChat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          members: [1, 2],
          membersDetails: users,
        })
      );
    });

    it("should return chat with empty membersDetails if no users found", async () => {
      req.params = { firstId: 1, secondId: 2 };
      const chat = { toJSON: () => ({ id: 1, members: [1, 2] }) };
      Chat.findOne.mockResolvedValue(chat);
      User.findAll.mockResolvedValue([]);
      await ChatController.findChat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          members: [1, 2],
          membersDetails: [],
        })
      );
    });

    it("should call next on error", async () => {
      req.params = { firstId: 1, secondId: 2 };
      const error = new Error("Error");
      Chat.findOne.mockRejectedValue(error);

      await ChatController.findChat(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe("Chat Model", () => {
  const Sequelize = require("sequelize");
  const DataTypes = Sequelize.DataTypes;

  const defineChat = require("../models/chat");

  const connectionString =
    process.env.TEST_DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/chatApp_db_test";
  const sequelize = new Sequelize(connectionString, {
    logging: false,
    dialect: "postgres",
  });

  const ChatReal = defineChat(sequelize, DataTypes);

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it("should return an array for members if stored as an array", () => {
    const instance = ChatReal.build({ members: [1, 2] });
    expect(instance.members).toEqual([1, 2]);
  });

  it("should return an array for members if stored as a JSON string", () => {
    const instance = ChatReal.build({ members: JSON.stringify([1, 2]) });
    expect(instance.members).toEqual([1, 2]);
  });

  it("should throw a validation error when members is not an array", async () => {
    const instance = ChatReal.build({ members: "not an array" });
    await expect(instance.validate()).rejects.toThrow(
      "Members must be an array"
    );
  });
});
