const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("📦 Token received:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Decoded token:", decoded);

      req.user = await User.findById(decoded.id).select("-password");
      console.log("👤 Authenticated user:", req.user);

      next();
    } catch (error) {
      console.error("❌ JWT verification error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
