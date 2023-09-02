const Joi = require("joi");
const mongoose = require("mongoose");

const commonOptions = {
  type: String,
  required: true,
  minlength: 3,
  maxlength: 30,
};

const UserSchema = new mongoose.Schema({
  name: commonOptions,
  email: commonOptions,
  password: commonOptions,
  age: {
    type: Number,
    required: true,
  },
  birthDay: {
    type: Date,
    required: true,
  },
  profilePicture: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", UserSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).max(30).required(),
    age: Joi.number().required(),
    birthDay: Joi.date().required(),
    profilePicture: Joi.string(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;