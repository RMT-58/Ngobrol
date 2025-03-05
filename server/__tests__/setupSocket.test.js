const { Server } = require("socket.io");

const { createServer } = require("http");

const Client = require("socket.io-client");

const setupSocket = require("../socket");

const MessageController = require("../controllers/messageController");

const ChatController = require("../controllers/chatController");

jest.mock("../controllers/messageController");

jest.mock("../controllers/chatController");

let io, serverSocket, clientSocket1, clientSocket2, httpServer;

describe("Socket.IO Server", () => {
  beforeAll((done) => {
    httpServer = createServer();

    io = new Server(httpServer, { cors: { origin: "*" } });

    setupSocket(httpServer);

    httpServer.listen(async () => {
      const port = await httpServer.address().port;

      clientSocket1 = new Client(`http://localhost:${port}`);

      clientSocket2 = new Client(`http://localhost:${port}`);

      clientSocket1.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();

    httpServer.close();

    clientSocket1.close();

    clientSocket2.close();
  });

  test("✅ Should add a new user and receive user list", (done) => {
    clientSocket1.on("getUsers", (users) => {
      console.log("✅ Users received:", users);

      expect(users).toEqual([
        { userId: "user1", socketId: expect.any(String) },
      ]);

      done();
    });

    clientSocket1.emit("addNewUser", "user1");
  });

  test("✅ Should send a message and receive it", (done) => {
    jest.setTimeout(5000);

    MessageController.createMessage.mockImplementation((req, res) => {
      console.log("📩 Mock createMessage called with:", req.body);

      res.status(201).json({ id: 123, createdAt: new Date().toISOString() });
    });

    const messageData = {
      chatId: 1,

      senderId: "user1",

      recipientId: "user2",

      text: "Hello!",
    };

    clientSocket2.onAny((event, ...args) => {
      console.log("Client2 received event:", event, args);
    });

    clientSocket2.once("getMessage", (message) => {
      console.log("✅ Message received by client2:", message);

      expect(message).toMatchObject({
        chatId: messageData.chatId,

        senderId: messageData.senderId,

        text: messageData.text,

        messageId: expect.any(Number),

        createdAt: expect.any(String),
      });

      done();
    });

    clientSocket1.emit("sendMessage", messageData);

    setTimeout(() => {
      done(new Error("❌ getMessage event not received"));
    }, 1000);
  });

  test("✅ Should create a chat and notify users", (done) => {
    ChatController.createChat.mockImplementation((req, res) => {
      console.log("📩 Mock createChat called with:", req.body);

      res.status(200).json({
        chatId: 1,

        senderId: req.body.senderId,

        receiverId: req.body.receiverId,
      });
    });

    const chatData = { senderId: "user1", receiverId: "user2" };

    clientSocket1.emit("createChat", chatData);

    clientSocket1.once("chatCreated", (chat) => {
      console.log("✅ Chat created:", chat);

      expect(chat).toMatchObject({
        chatId: 1,

        senderId: "user1",

        receiverId: "user2",
      });

      done();
    });
  });

  test("✅ Should remove user from list on disconnect", (done) => {
    clientSocket1.emit("addNewUser", "user1");

    clientSocket1.on("getUsers", (users) => {
      console.log("👥 Users before disconnect:", users);
    });

    clientSocket1.disconnect();

    setTimeout(() => {
      clientSocket2.on("getUsers", (users) => {
        console.log("👥 Users after disconnect:", users);

        expect(users).not.toContainEqual(
          expect.objectContaining({ userId: "user1" })
        );

        done();
      });
    }, 500);
  });
});
