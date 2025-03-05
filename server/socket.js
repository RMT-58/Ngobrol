// // socket.js
// const { Server } = require("socket.io");

// function setupSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin: "*",
//     },
//   });

//   let onlineUsers = [];

//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     socket.on("addNewUser", (userId) => {
//       if (!onlineUsers.some((user) => user.userId === userId)) {
//         onlineUsers.push({
//           userId,
//           socketId: socket.id,
//         });
//       }
//       console.log("Connected Users:", onlineUsers);
//       io.emit("getUsers", onlineUsers);
//     });

//     socket.on("sendMessage", (data) => {
//       console.log("Message received from client:", data);
//       const user = onlineUsers.find((user) => user.userId === data.recipientId);
//       if (user) {
//         console.log("Sending message to:", user.socketId);
//         io.to(user.socketId).emit("getMessage", data);
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//       onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
//       console.log("Updated Online Users:", onlineUsers);
//       io.emit("getUsers", onlineUsers);
//     });
//   });
// }

// module.exports = setupSocket;

const { Server } = require("socket.io");
const ChatController = require("../controllers/chatController");
const MessageController = require("../controllers/messageController");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  let onlineUsers = [];

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("addNewUser", (userId) => {
      if (!onlineUsers.some((user) => user.userId === userId)) {
        onlineUsers.push({
          userId,
          socketId: socket.id,
        });
      }
      console.log("Connected Users:", onlineUsers);
      io.emit("getUsers", onlineUsers);
    });

    socket.on("sendMessage", async (data) => {
      try {
        console.log("Message received from client:", data);

        const messageRequest = {
          body: {
            chatId: data.chatId,
            senderId: data.senderId,
            text: data.text,
          },
        };

        const messageResponse = {
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.data = data;
            return this;
          },
        };

        await MessageController.createMessage(
          messageRequest,
          messageResponse,
          (error) => {
            if (error) {
              console.error("Error creating message:", error);
            }
          }
        );

        if (messageResponse.statusCode === 201 && messageResponse.data) {
          data.messageId = messageResponse.data.id;
          data.createdAt = messageResponse.data.createdAt;

          const user = onlineUsers.find(
            (user) => user.userId === data.recipientId
          );
          if (user) {
            console.log("Sending message to:", user.socketId);
            io.to(user.socketId).emit("getMessage", data);
          }
        }
      } catch (error) {
        console.error("Error in sendMessage handler:", error);
      }
    });

    socket.on("createChat", async (data) => {
      try {
        const chatRequest = {
          body: {
            senderId: data.senderId,
            receiverId: data.receiverId,
          },
        };

        const chatResponse = {
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.data = data;
            return this;
          },
        };

        await ChatController.createChat(chatRequest, chatResponse, (error) => {
          if (error) {
            console.error("Error creating chat:", error);
            socket.emit("chatError", { message: "Failed to create chat" });
          }
        });

        if (chatResponse.statusCode === 200 && chatResponse.data) {
          socket.emit("chatCreated", chatResponse.data);

          const receiver = onlineUsers.find(
            (user) => user.userId === data.receiverId
          );
          if (receiver) {
            io.to(receiver.socketId).emit("newChat", chatResponse.data);
          }
        }
      } catch (error) {
        console.error("Error in createChat handler:", error);
        socket.emit("chatError", { message: "Failed to create chat" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      console.log("Updated Online Users:", onlineUsers);
      io.emit("getUsers", onlineUsers);
    });
  });
}

module.exports = setupSocket;
