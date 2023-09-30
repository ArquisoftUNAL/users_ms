const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let decoded;
  try {
    const token = req.header("x-auth-token");
    if (!token) throw new Error();
    decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (e) {
    return res.status(401).send("Access denied");
  }
  req.user = decoded; // Store user data in the request object
  next();
};
