const jwt = require("jsonwebtoken");

const generateAccessToken  = (id, role) => jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET,  { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN  || "15m" });
const generateRefreshToken = (id)       => jwt.sign({ id },       process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"  });
const verifyAccessToken    = (token)    => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
const verifyRefreshToken   = (token)    => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

const setRefreshCookie = (res, token) =>
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     "/api/auth/refresh",
  });

const clearRefreshCookie = (res) =>
  res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/auth/refresh" });

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, setRefreshCookie, clearRefreshCookie };
