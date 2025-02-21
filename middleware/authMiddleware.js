const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user ID to the request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
