const { Op } = require("sequelize");
const { Chat } = require("../models");

class ChatController {
  static async createChat(req, res, next) {
    const { senderId, receiverId } = req.body;
    try {
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
      const chats = await Chat.findAll({
        where: {
          members: { [Op.contains]: [userId] },
        },
      });

      return res.status(200).json(chats);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  static async findChat(req, res, next) {
    const { firstId, secondId } = req.params;
    try {
      const chat = await Chat.findOne({
        where: {
          members: {
            [Op.contains]: [firstId, secondId],
          },
        },
      });

      res.status(200).json(chat);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = ChatController;
