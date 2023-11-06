const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { LDAP_URL } = require("./../config")

const auth = require("../middleware/authorization");

// Get current user info
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: "User not found" });

  // Remove password and __v from user object
  const userWithoutPassword = _.omit(user.toObject(), ["password", "__v"]);
  res.json(userWithoutPassword);
});

// Get user by id
router.get("/:id", async (req, res) => {
  let user;

  try {
    user = await User.findById(req.params.id);
  } catch (err) {
    console.log(err);

    return res.status(400).json({ message: "Invalid user id" });
  }

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

const ldap = require("ldapjs");
const client = ldap.createClient({
  url: LDAP_URL,
});

// User credentials for an admin user with rights to add new users
const adminDn = "cn=admin,dc=arqsoft,dc=unal,dc=edu,dc=co";
const adminPassword = "admin";

// Create a new user
router.post("", async (req, res) => {
  // Validate user with Joi and mongoose schema
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(409).json({ message: "User already registered" });

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

  const newUserDn = `cn=${email},ou=users,dc=arqsoft,dc=unal,dc=edu,dc=co`;
  const newUser = {
    cn: email,
    objectClass: ["organizationalRole", "simpleSecurityObject"],
    userPassword: password,
  };

  client.bind(adminDn, adminPassword, function (err) {
    if (err) {
      console.error('Error binding to LDAP:', err.message);
    } else {
      console.log('Bound as admin');

      // Add the new user
      client.add(newUserDn, newUser, function (err) {
        if (err) {
          console.error('Error adding entry to LDAP:', err.message);
        } else {
          console.log('Added new user');
        }

        // Unbind regardless of success or not
        client.unbind(function (err) {
          if (err) {
            console.error('Error unbinding from LDAP:', err.message);
          } else {
            console.log('Unbound from LDAP');
          }
        });
      });
    }

    // Remove password and __v from user object
    const userWithoutPassword = _.omit(user.toObject(), ["password", "__v"]);
    res.header("x-auth-token", jwtToken).json(userWithoutPassword);
  });
});

module.exports = router;
