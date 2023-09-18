const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

const auth = require("../middleware/authorization");

// Get current user info
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: "User not found" });

  // Remove password and __v from user object
  const userWithoutPassword = _.omit(user.toObject(), ["password", "__v"]);
  res.json(userWithoutPassword);
});

// Delete current user
router.delete("/me", auth, async (req, res) => {
  const user = await User.findByIdAndRemove(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user).status(204);
});

// Patch current user
router.patch("/me", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Create a new user
router.post("", async (req, res) => {
  // Validate user with Joi and mongoose schema
  const { error } = validate(req.body);
  if (error) return res.status(404).json({ message: error.details[0].message });

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(404).json({ message: "User already registered" });

  const { name, email, password, birthDay } = req.body;

  user = new User({
    name,
    email,
    password,
    birthDay,
    isAdmin: false,
  });

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error) {
    console.error("Password hashing failed:", error);
  }

  user = await user.save();

  const jwtToken = user.generateAuthToken(user._id);

  // Remove password and __v from user object
  const userWithoutPassword = _.omit(user.toObject(), ["password", "__v"]);
  res.header("x-auth-token", jwtToken).json(userWithoutPassword);
});

module.exports = router;
