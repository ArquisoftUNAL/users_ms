const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Get user by id
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found");
  res.send(user);
});

// Create a new user
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(404).send("User already registered");

  const { name, email, password, age, birthDay, profilePicture } = req.body;

  user = new User({
    name,
    email,
    password,
    age,
    birthDay,
    profilePicture,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  user = await user.save();
  res.send(user);
});

// Delete a user
router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) return res.status(404).send("User not found");
  res.send(user);
});

// Patch a user
router.patch("/:id", async (req, res) => {
  const { name, email, password, age, birthDay, profilePicture } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name,
      email,
      password,
      age,
      birthDay,
      profilePicture,
    },
    { new: true }
  );
  if (!user) return res.status(404).send("User not found");
  res.send(user);
});

module.exports = router;
