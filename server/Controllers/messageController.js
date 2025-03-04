const { Message } = require("../models");

class MessageController {
  static async createMessage(req, res, next) {
    const { chatId, senderId, text } = req.body;
    try {
      const message = await Message.create({ chatId, senderId, text });

      return res.status(201).json(message);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getMessages(req, res, next) {
    const { chatId } = req.params;
    try {
      const messages = await Message.findAll({
        where: { chatId },
        // order: [["createdAt", "ASC"]],
      });

      return res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = MessageController;
