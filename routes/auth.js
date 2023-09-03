const { User } = require("../models/user");
const express = require("express");
const Joi = require("joi");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Validate login
router.post("/login", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Invalid email or password 1");

  // Compare password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(404).send("Invalid email or password 2");

  // Generate token
  const token = jwt.sign({ _id: user._id }, "jwtPrivateKey");

  res.send(token);
});

const validate = (req) => {
  const schema = Joi.object({
    email: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).max(30).required(),
  });

  return schema.validate(req);
};

module.exports = router;
