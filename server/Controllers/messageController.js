const { Message, Chat } = require("../models");

class MessageController {
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
