const { User } = require("../models/user");
const { AuthToken } = require("../models/authToken");
const express = require("express");
const Joi = require("joi");
const router = express.Router();

const ldap = require("ldapjs");
const { LDAP_URL } = require("../config");

router.post("/login", async (req, res) => {
  // Structure validation
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;
  console.log("Try to bind user with credentials ", email, password);

  const userDn = `cn=${email},ou=users,dc=arqsoft,dc=unal,dc=edu,dc=co`;

  // Create a new client instance for the request
  const clientForRequest = ldap.createClient({
    url: LDAP_URL, // Replace with your LDAP server address
  });

  // Try to bind using provided credentials
  clientForRequest.bind(userDn, password, async function (err) {
    // Always unbind after bind, no matter the outcome
    clientForRequest.unbind();

    if (err) {
      console.error("Error binding user to LDAP:", err.message);
      return res
        .status(401)
        .json({ message: "Invalid email or password (LDAP)" });
    }

    console.log("User successfully bound to LDAP");

    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password (DB)" });
    }

    // Generate and save token
    const jwtToken = user.generateAuthToken(user._id);

    // Send token to client
    res.header("x-auth-token", jwtToken).status(200).json({ token: jwtToken });
  });
});

// Validate token
router.get("/token", async (req, res) => {
  // Check if token exists
  const token = req.headers["x-auth-token"];
  if (!token)
    return res.status(401).json({ message: "Token not found in header" });
  if (!(await AuthToken.findOne({ token }))) return res.status(200).json(false);
  return res.status(200).json(true);
});

// Logout user
router.delete("/logout", async (req, res) => {
  const authToken = await AuthToken.findOneAndDelete({
    token: req.headers["x-auth-token"],
  });
  if (!authToken) return res.status(404).json({ message: "Token not found" });
  return res.status(204).json({ message: "User logged out" });
});

const validate = (req) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(req);
};

module.exports = router;
