const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { JWT_PRIVATE_KEY } = require("../config");

const {
  AuthToken,
  validate: validateAuthToken,
} = require("../models/authToken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 255,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  birthDay: {
    type: Date,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.generateAuthToken = function (userId) {
  const hoursToExpire = 12;

  const tokenData = {
    _id: this._id,
    _isAdmin: this.isAdmin,
    iat: Math.floor(Date.now() / 1000), // Issued at time (in seconds since Unix epoch)
    exp: Math.floor(Date.now() / 1000) + hoursToExpire * 60 * 60, // Expiration time: 12 hours after iat
  };

  const token = jwt.sign(tokenData, JWT_PRIVATE_KEY);
  const authToken = new AuthToken({ token, userId });
  authToken.save();
  return token;
};

const User = mongoose.model("User", UserSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string()
      .min(3)
      .max(255)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
      .required(),
    birthDay: Joi.date().required(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
