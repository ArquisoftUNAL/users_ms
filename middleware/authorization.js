const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Check if user is authorized
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied");

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  req.user = decoded; // Store user data in the request object

  const { _id, _isAdmin } = req.user;

  if (!_isAdmin) {
    if (_id !== req.params.id) {
      return res.status(401).send("Access denied");
    }
  }

  next();
};
