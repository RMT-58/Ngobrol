require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();

//! SOCKET
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
//! SOCKET

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//http request
app.get("/", (req, res) => {
  res.send("Welcome to our chat API!");
});

//! SOCKET

const chats = [];

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("/messages/chat", () => {
    console.log("get chat");

    socket.emit("/messages/chat", chats);
  });

  socket.on("/messages/chat/create", (data) => {
    // console.log(data, `<<< dari klien`);
    //harusnya dikirim ke database Message.create({...data})
    chats.push(data);

    io.emit("/messages/chat", chats);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// app.listen(port, () => {
//   console.log(`Server running on port: ${port}...`);
// });
//! SOCKET
server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
//! SOCKET

module.exports = app;
