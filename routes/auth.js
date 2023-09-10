const { User } = require("../models/user");
const { AuthToken } = require("../models/authToken");
const express = require("express");
const Joi = require("joi");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Validate login
router.post("/login", async (req, res) => {
  // Structure validation
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Invalid email or password");

  // Compare password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(404).send("Invalid email or password");

  // Generate and save token
  const jwt = user.generateAuthToken(user._id);

  // Send token to client
  res.send(jwt);
});

// Validate token
router.get("/token", async (req, res) => {
  // Check if token exists
  const token = req.headers["x-auth-token"];
  if (!token) return res.status(404).send("Token not found in header");
  if (!(await AuthToken.findOne({ token }))) return res.status(404).send(false);
  return res.status(200).send(true);
});

// Logout user
router.delete("/logout", async (req, res) => {
  const authToken = await AuthToken.findOneAndDelete({
    token: req.headers["x-auth-token"],
  });
  if (!authToken) return res.status(404).send("Token not found");
  return res.status(200).send("User logged out");
});

const validate = (req) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(req);
};

module.exports = router;
