const { Op } = require("sequelize");
const { Chat } = require("../models");

class ChatController {
  static async createChat(req, res, next) {
    const { senderId, receiverId } = req.body;
    try {
      if (!senderId || !receiverId) {
        return next({
          name: "BadRequest",
          message: "senderId and receiverId are required",
        });
      }

      const chat = await Chat.findOne({
        where: {
          members: {
            [Op.contains]: [senderId, receiverId],
          },
        },
      });

      if (chat) {
        return res.status(200).json(chat);
      }

      const newChat = await Chat.create({
        members: [senderId, receiverId],
      });

      res.status(200).json(newChat);
    } catch (error) {
      next(error);
    }
  }

  static async userChats(req, res, next) {
    const { userId } = req.params;
    try {
      if (!userId) {
        return next({
          name: "BadRequest",
          message: "userId is required",
        });
      }

      const chats = await Chat.findAll({
        where: {
          members: { [Op.contains]: [userId] },
        },
      });

      return res.status(200).json(chats);
    } catch (error) {
      next(error);
    }
  }

  static async findChat(req, res, next) {
    const { firstId, secondId } = req.params;
    try {
      if (!firstId || !secondId) {
        return next({
          name: "BadRequest",
          message: "Both user IDs are required",
        });
      }

      const chat = await Chat.findOne({
        where: {
          members: {
            [Op.contains]: [firstId, secondId],
          },
        },
      });

      if (!chat) {
        return next({
          name: "NotFound",
          message: "Chat not found",
        });
      }

      res.status(200).json(chat);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;
