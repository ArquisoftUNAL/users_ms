const mongoose = require("mongoose");
const express = require('express');
const app = express();
const users = require("./routes/users");
const auth = require("./routes/auth");

// Connect to mongodb
mongoose
  .connect("mongodb://127.0.0.1/users")
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log("Could not connect to db", err);
  });

app.use(express.json());
app.use("/api/users", users);
app.use("/api/auth", auth);


const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

