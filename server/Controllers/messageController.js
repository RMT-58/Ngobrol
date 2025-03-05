const { Message, Chat } = require("../models");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  "AIzaSyDYGMbX70GUHL0I0znuPyA234gadeylXZw"
  // process.env.GOOGLE_API_KEY
);

class MessageController {
  static async getAiSuggestion(req, res, next) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const { messages } = req.body;

      console.log("Received messages:", messages);

      // Convert messages to a conversation string
      const conversationText = messages
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      const prompt = `Based on this conversation, suggest a helpful response (keep it brief, maximum one sentence):
  
  ${conversationText}
  
  Response suggestion:`;

      console.log("Sending formatted prompt to Gemini");

      const result = await model.generateContent({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      });

      const suggestion = result.response.text();
      console.log("Gemini suggestion:", suggestion);

      res.status(200).json({ suggestion });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({
        error: "Failed to get AI suggestion",
        message: error.message,
      });
    }
  }

  static async createMessage(req, res, next) {
    const { chatId, senderId, text } = req.body;
    try {
      if (!chatId || !senderId || !text) {
        return next({
          name: "BadRequest",
          message: "chatId, senderId, and text are required",
        });
      }

      const chat = await Chat.findByPk(chatId);
      if (!chat) {
        return next({
          name: "NotFound",
          message: "Chat not found",
        });
      }

      if (!chat.members.includes(senderId)) {
        return next({
          name: "Forbidden",
          message: "User is not a member of this chat",
        });
      }

      const message = await Message.create({ chatId, senderId, text });

      return res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req, res, next) {
    const { chatId } = req.params;
    try {
      if (!chatId) {
        return next({
          name: "BadRequest",
          message: "chatId is required",
        });
      }

      const chat = await Chat.findByPk(chatId);
      if (!chat) {
        return next({
          name: "NotFound",
          message: "Chat not found",
        });
      }

      const messages = await Message.findAll({
        where: { chatId },
        order: [["createdAt", "ASC"]],
      });

      return res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MessageController;
