const Joi = require("joi");
const mongoose = require("mongoose");
require("dotenv").config();

const authToken = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
});

const AuthToken = mongoose.model("AuthToken", authToken);

function validateAuthToken(authToken) {
  const schema = Joi.object({
    token: Joi.string().min(3).max(255).required(),
    userId: Joi.string().min(3).max(255).required(),
    expirationDate: Joi.date().required(),
  });

  return schema.validate(authToken);
}

exports.AuthToken = AuthToken;
exports.validate = validateAuthToken;
