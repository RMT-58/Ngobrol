require("dotenv").config();
const cors = require("cors");
const express = require("express");
const router = require("./Routes");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

app.use(router);

app.listen(port, () => {
  console.log(`Server running on port: ${port}...`);
});

module.exports = app;
