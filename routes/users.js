const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");

const auth = require("../middleware/authorization");

// Get user by id
router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).send("User not found");

  // Remove password and __v from user object
  const userWithoutPassword = _.omit(user.toObject(), ["password", "__v"]);
  res.send(userWithoutPassword);
});

// Delete a user
router.delete("/:id", auth, async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) return res.status(404).send("User not found");
  res.send(user);
});

// Patch a user
router.patch("/:id", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!user) return res.status(404).send("User not found");
  res.send(user);
});

// Create a new user
router.post("/", async (req, res) => {
  // Validate user with Joi and mongoose schema
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(404).send("User already registered");

  const { name, email, password, birthDay, profilePicture } = req.body;

  user = new User({
    name,
    email,
    password,
    birthDay,
    profilePicture,
    isAdmin: false,
  });

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error) {
    console.error("Password hashing failed:", error);
  }

  user = await user.save();

  const token = user.generateAuthToken();

  // Remove password and __v from user object
  const userWithoutPassword = _.omit(user.toObject(), ["password", "__v"]);
  res.header("x-auth-token", token).send(userWithoutPassword);
});

module.exports = router;
