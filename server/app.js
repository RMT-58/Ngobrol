require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./Routes");
const http = require("http");
const setupSocket = require("./socket");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(router);

const port = process.env.PORT || 3000;
const server = http.createServer(app);

setupSocket(server);

server.listen(port, () => {
  console.log(`Server running on port: ${port}...`);
});

module.exports = app;
