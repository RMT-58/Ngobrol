const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const request = require("supertest");
const { User, Chat, Message } = require("../models");
const { queryInterface } = require("../models/index").sequelize;
const { signToken } = require("../helpers/jwt");
const { hashPassword } = require("../helpers/bcrypt");

const app = require("../app");

let access_token1;
let access_token2;

beforeAll(async () => {
  await queryInterface.bulkInsert("Users", [
    {
      name: "Anto",
      email: "a@mail.com",
      password: hashPassword("123456"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Budi",
      email: "b@mail.com",
      password: hashPassword("123456"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Dani",
      email: "d@mail.com",
      password: hashPassword("123456"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Edi",
      email: "e@mail.com",
      password: hashPassword("123456"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await Chat.create({
    members: ["1", "2"],
  });

  // await queryInterface.bulkInsert("Messages", [
  //   {
  //     chatId: 1,
  //     senderId: 1,
  //     text: "Hello",
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  // ]);

  const user = await User.findOne({ where: { email: "a@mail.com" } });
  access_token1 = signToken({ id: user.id });

  const user2 = await User.findOne({ where: { email: "e@mail.com" } });
  access_token2 = signToken({ id: user2.id });

  // chatId = chat.id;
});

afterAll(async () => {
  await User.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });

  await Chat.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });

  await Message.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
});

describe("GET /", () => {
  test("Return the correct message from the route", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Welcome to our chat API..." });
  });
});

describe("POST /users/register", () => {
  test("Success create a new user and return name and email", async () => {
    const response = await request(app).post("/users/register").send({
      name: "Chris",
      email: "c@mail.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("name", "Chris");
    expect(response.body).toHaveProperty("email", "c@mail.com");
  });

  test("Failed create a new user with invalid email", async () => {
    const response = await request(app).post("/users/register").send({
      name: "Anto",
      email: "a",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid email format");
  });

  test("Failed create a new user with invalid password", async () => {
    const response = await request(app).post("/users/register").send({
      name: "Anto",
      email: "a@mail.com",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Password must be at least 6 characters long"
    );
  });

  test("Failed create a new user with empty name", async () => {
    const response = await request(app).post("/users/register").send({
      email: "a@mail.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Name is required");
  });

  test("Failed create a new user with empty email", async () => {
    const response = await request(app).post("/users/register").send({
      name: "Anto",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email cannot be null");
  });

  test("Failed create a new user with empty password", async () => {
    const response = await request(app).post("/users/register").send({
      name: "Anto",
      email: "a@mail.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Password cannot be null");
  });

  test("Failed create a new user with empty name, email, and password", async () => {
    const response = await request(app).post("/users/register").send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Name is required");
  });

  test("Failed create a new user with existing email", async () => {
    const response = await request(app).post("/users/register").send({
      name: "Anto",
      email: "a@mail.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "The email is already taken"
    );
  });

  test("Failed create a new user with invalid email format", async () => {
    const response = await request(app).post("/users/register").send({
      name: "Anto",
      email: "a",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid email format");
  });
});

describe("POST /users/login", () => {
  test("Success login and return access_token1", async () => {
    const response = await request(app).post("/users/login").send({
      email: "a@mail.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
  });

  test("Failed login with wrong email", async () => {
    const response = await request(app).post("/users/login").send({
      email: "z@mail.com",
      password: "123456",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Invalid email or password"
    );
  });

  test("Failed login with wrong password", async () => {
    const response = await request(app).post("/users/login").send({
      email: "a@mail.com",
      password: "abcdef",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Invalid email or password"
    );
  });

  test("Failed login with empty email", async () => {
    const response = await request(app).post("/users/login").send({
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });

  test("Failed login with empty password", async () => {
    const response = await request(app).post("/users/login").send({
      email: "a@mail.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Password is required");
  });

  test("Failed login with empty email and password", async () => {
    const response = await request(app).post("/users/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });
});

describe("GET users/find/:userId", () => {
  test("Success find a user by id", async () => {
    const response = await request(app)
      .get("/users/find/1")
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("name", "Anto");
  });

  test("Failed find a user with empty token", async () => {
    const response = await request(app).get("/users/find/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Failed find a user with invalid token", async () => {
    const response = await request(app)
      .get("/users/find/1")
      .set("Authorization", `Bearer 123abc`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Failed find a user invalid id", async () => {
    const response = await request(app)
      .get("/users/find/19")
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");
  });
});

describe("GET /users", () => {
  test("Success find all users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(5);
  });

  test("Failed find all users with empty token", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Failed find all users with invalid token", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer 123abc`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });
});

describe("POST /chats", () => {
  test("Success create new chat", async () => {
    const response = await request(app)
      .post("/chats")
      .set("Authorization", `Bearer ${access_token1}`)
      .send({ senderId: 1, receiverId: 3 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.members).toContain(1);
    expect(response.body.members).toContain(3);
  });

  test("Should return existing chat if already created", async () => {
    const response = await request(app)
      .post("/chats")
      .set("Authorization", `Bearer ${access_token1}`)
      .send({ senderId: 1, receiverId: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("members", [1, 2]);
    expect(response.body).toHaveProperty("id");
  });

  test("Fail create chat without authentication", async () => {
    const response = await request(app)
      .post("/chats")
      .send({ senderId: 1, receiverId: 2 });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Fail create chat with invalid receiverId", async () => {
    const response = await request(app)
      .post("/chats")
      .set("Authorization", `Bearer ${access_token1}`)
      .send({ senderId: 4, receiverId: 10 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "User not found");
  });

  test("Fail create chat with missing senderId or receiverId", async () => {
    const response = await request(app)
      .post("/chats")
      .set("Authorization", `Bearer ${access_token1}`)
      .send({ senderId: 1 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "senderId and receiverId are required"
    );
  });
});

describe("GET /chats/:userId", () => {
  test("Success get user chats", async () => {
    const response = await request(app)
      .get("/chats/1")
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("Fail get user chats without authentication", async () => {
    const response = await request(app).get("/chats/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Fail get user chats with invalid token", async () => {
    const response = await request(app)
      .get("/chats/1")
      .set("Authorization", `Bearer 123abc`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Failed get user chats - No chat found", async () => {
    const response = await request(app)
      .get("/chats/999")
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
  });
});

describe("GET /chats/find/:firstId/:secondId", () => {
  test("Success get chat between two users", async () => {
    const response = await request(app)
      .get(`/chats/find/1/2`)
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("members", ["1", "2"]);
  });

  test("Failed get chat - Chat not found", async () => {
    const response = await request(app)
      .get(`/chats/find/1/99999`) // ID tidak valid
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Chat not found");
  });
});

describe("POST /messages", () => {
  test("Success create new message", async () => {
    const response = await request(app)
      .post("/messages")
      .set("Authorization", `Bearer ${access_token1}`)
      .send({
        chatId: "1",
        senderId: "1",
        text: "Hello, how are you?",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.text).toBe("Hello, how are you?");
  });

  test("Failed create message without authentication", async () => {
    const response = await request(app).post("/messages").send({
      chatId: 2,
      senderId: 3,
      text: "Hello",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Failed create message with invalid chatId", async () => {
    const response = await request(app)
      .post("/messages")
      .set("Authorization", `Bearer ${access_token1}`)
      .send({ chatId: 999, senderId: 1, text: "Hello" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Chat not found");
  });

  test("Failed create message with missing chatId, senderId, and text", async () => {
    const response = await request(app)
      .post("/messages")
      .set("Authorization", `Bearer ${access_token1}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "chatId, senderId, and text are required"
    );
  });

  test("Failed create message with forbidden id", async () => {
    const response = await request(app)
      .post("/messages")
      .set("Authorization", `Bearer ${access_token2}`)
      .send({ chatId: 1, senderId: 2, text: "Hello" });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      "message",
      "User is not a member of this chat"
    );
  });
});

describe("GET /messages/:chatId", () => {
  test("Success get messages by chatId", async () => {
    const response = await request(app)
      .get("/messages/1")
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("Failed get messages without authentication", async () => {
    const response = await request(app).get("/messages/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Failed get messages with invalid token", async () => {
    const response = await request(app)
      .get("/messages/1")
      .set("Authorization", `Bearer 123abc`);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid or Expired token");
  });

  test("Failed get messages - No messages found", async () => {
    const response = await request(app)
      .get("/messages/999")
      .set("Authorization", `Bearer ${access_token1}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Chat not found");
  });
});
