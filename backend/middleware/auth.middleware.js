const { verifyAccessToken } = require("../utils/jwt.utils");

// ── Protect (verify JWT) ──────────────────────────────────────────────────────
const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "No token provided.", code: "NO_TOKEN" });

  try {
    req.user = verifyAccessToken(header.split(" ")[1]);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ success: false, message: "Token expired.", code: "TOKEN_EXPIRED" });
    return res.status(403).json({ success: false, message: "Invalid token." });
  }
};

// ── Role guard ────────────────────────────────────────────────────────────────
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ success: false, message: "Access denied." });
  next();
};

module.exports = { protect, restrictTo };
