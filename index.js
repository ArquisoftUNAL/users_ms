const mongoose = require("mongoose");
const express = require("express");
const app = express();
const users = require("./routes/users");
const auth = require("./routes/auth");

const {
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  DATABASE_HOST,
  APP_PORT
} = require("./config");

// Connect to mongodb
mongoose
  .connect(
    `mongodb+srv://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log("Could not connect to db", err);
  });

app.use(express.json());

app.use("/users", users);
app.use("/auth", auth);

const port = APP_PORT || 3000;
app.listen(
  port,
  () => console.log(`Listening on port ${port}...`)
);
