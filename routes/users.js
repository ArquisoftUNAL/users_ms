const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
require("dotenv").config();

// Get user by id
router.get("/:id", async (req, res) => {
  // Check if user is authorized
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied 1");

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  const { _id, isAdmin } = decoded;

  if (!isAdmin) {
    if (_id !== req.params.id) {
      return res.status(401).send("Access denied 2");
    }
  }

  const user = await User.findById(_id);

  if (!user) return res.status(404).send("User not found");

  // Remove password and __v from user object
  const userWithoutPassword = _.omit(user.toObject(), ["password", "__v"]);
  res.send(userWithoutPassword);
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

  // Generate token and send user to the client. The default role is "user". One can create an admin user by changing the role to "admin" in the db.
  const token = jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_PRIVATE_KEY
  );
  console.log("HOLAAA", user.isAdmin);
  // Remove password and __v from user object
  const userWithoutPassword = _.omit(user.toObject(), ["password", "__v"]);
  res.header("x-auth-token", token).send(userWithoutPassword);
});

// Delete a user
router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) return res.status(404).send("User not found");
  res.send(user);
});

// Patch a user
router.patch("/:id", async (req, res) => {
  const { name, email, password, birthDay, profilePicture } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name,
      email,
      password,
      birthDay,
      profilePicture,
    },
    { new: true }
  );
  if (!user) return res.status(404).send("User not found");
  res.send(user);
});

module.exports = router;
