const mongoose = require("mongoose");
const express = require("express");
const app = express();
const users = require("./routes/users");
const auth = require("./routes/auth");

const {
  MONGODB_URL,
  APP_PORT,
} = require("./config");

// Connect to mongodb
mongoose
  .connect(
    MONGODB_URL,
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
app.listen(port, () => console.log(`Listening on port ${port}...`));
