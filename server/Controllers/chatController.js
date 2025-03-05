const { Op } = require("sequelize");
const { Chat, User } = require("../models");

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

      let chat = await Chat.findOne({
        where: {
          members: {
            [Op.contains]: [senderId, receiverId],
          },
        },
      });

      if (!chat) {
        chat = await Chat.create({
          members: [senderId, receiverId],
        });
      }

      const users = await User.findAll({
        where: {
          id: [senderId, receiverId],
        },
        attributes: ["id", "name", "email"],
      });

      // const newChat = await Chat.create({
      //   members: [senderId, receiverId],
      // });

      res.status(200).json({ ...chat.toJSON(), membersDetails: users });
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

      const allMemberIds = new Set();
      chats.forEach((chat) => {
        chat.members.forEach((id) => allMemberIds.add(id));
      });
      const uniqueMemberIds = Array.from(allMemberIds);

      const users = await User.findAll({
        where: {
          id: uniqueMemberIds,
        },
        attributes: ["id", "name", "email"],
      });

      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user;
      });

      const chatsWithMembers = chats.map((chat) => {
        const chatData = chat.toJSON();
        chatData.membersDetails = chatData.members.map(
          (memberId) => userMap[memberId]
        );
        return chatData;
      });

      return res.status(200).json(chatsWithMembers);
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

      const chatData = chat.toJSON();

      const users = await User.findAll({
        where: {
          id: chatData.members,
        },
        attributes: ["id", "name", "email"],
      });

      chatData.membersDetails = users;

      res.status(200).json(chatData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;
