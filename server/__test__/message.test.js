const MessageController = require("../controllers/messageController");
const { Message, Chat } = require("../models");
const { GoogleGenerativeAI } = require("@google/generative-ai");

jest.mock("../models");
jest.mock("@google/generative-ai");

describe("MessageController", () => {
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

  describe("getAiSuggestion", () => {
    it("should return AI suggestion on success", async () => {
      req.body = {
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there" },
        ],
      };

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => "This is a suggestion",
          },
        }),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel,
      }));

      await MessageController.getAiSuggestion(req, res, next);
      expect(mockModel.generateContent).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        suggestion: "This is a suggestion",
      });
    });

    it("should handle error and return 500", async () => {
      req.body = { messages: [] };
      const error = new Error("AI error");
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(error),
      };
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel,
      }));
      console.error = jest.fn();

      await MessageController.getAiSuggestion(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to get AI suggestion",
        message: error.message,
      });
    });
  });

  describe("createMessage", () => {
    it("should error if required fields are missing", async () => {
      req.body = { chatId: 1, senderId: 1 };
      await MessageController.createMessage(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "chatId, senderId, and text are required",
        })
      );
    });

    it("should error if chat is not found", async () => {
      req.body = { chatId: 1, senderId: 1, text: "Hello" };
      Chat.findByPk.mockResolvedValue(null);
      await MessageController.createMessage(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "NotFound",
          message: "Chat not found",
        })
      );
    });

    it("should error if sender is not a member of the chat", async () => {
      req.body = { chatId: 1, senderId: 1, text: "Hello" };
      Chat.findByPk.mockResolvedValue({ members: [2, 3] });
      await MessageController.createMessage(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Forbidden",
          message: "User is not a member of this chat",
        })
      );
    });

    it("should create a message and return it on success", async () => {
      req.body = { chatId: 1, senderId: 1, text: "Hello" };
      Chat.findByPk.mockResolvedValue({ members: [1, 2] });
      const message = { id: 100, chatId: 1, senderId: 1, text: "Hello" };
      Message.create.mockResolvedValue(message);

      await MessageController.createMessage(req, res, next);
      expect(Message.create).toHaveBeenCalledWith({
        chatId: 1,
        senderId: 1,
        text: "Hello",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(message);
    });

    it("should call next on error", async () => {
      req.body = { chatId: 1, senderId: 1, text: "Hello" };
      const error = new Error("Error");
      Chat.findByPk.mockRejectedValue(error);

      await MessageController.createMessage(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMessages", () => {
    it("should error if chatId is missing", async () => {
      req.params = {};
      await MessageController.getMessages(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "BadRequest",
          message: "chatId is required",
        })
      );
    });

    it("should error if chat is not found", async () => {
      req.params = { chatId: 1 };
      Chat.findByPk.mockResolvedValue(null);
      await MessageController.getMessages(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "NotFound",
          message: "Chat not found",
        })
      );
    });

    it("should return messages on success", async () => {
      req.params = { chatId: 1 };
      Chat.findByPk.mockResolvedValue({ id: 1 });
      const messages = [
        { id: 1, chatId: 1, text: "Hello", createdAt: new Date("2020-01-01") },
        { id: 2, chatId: 1, text: "World", createdAt: new Date("2020-01-02") },
      ];
      Message.findAll.mockResolvedValue(messages);

      await MessageController.getMessages(req, res, next);
      expect(Message.findAll).toHaveBeenCalledWith({
        where: { chatId: 1 },
        order: [["createdAt", "ASC"]],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(messages);
    });

    it("should call next on error", async () => {
      req.params = { chatId: 1 };
      const error = new Error("Error");
      Chat.findByPk.mockRejectedValue(error);

      await MessageController.getMessages(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
