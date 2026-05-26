const { User } = require("../models");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, setRefreshCookie, clearRefreshCookie } = require("../utils/jwt.utils");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json({ success: false, message: "Email already registered." });
    const user         = await User.create({ name, email, password });
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    user.lastLoginAt   = new Date();
    await user.save({ validateBeforeSave: false });
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ success: true, message: "Account created.", accessToken, user: user.toSafe() });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    user.lastLoginAt   = new Date();
    await user.save({ validateBeforeSave: false });
    setRefreshCookie(res, refreshToken);
    res.json({ success: true, message: "Logged in.", accessToken, user: user.toSafe() });
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token." });
    let decoded;
    try { decoded = verifyRefreshToken(token); }
    catch { return res.status(403).json({ success: false, message: "Invalid refresh token." }); }
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      clearRefreshCookie(res);
      return res.status(403).json({ success: false, message: "Token reuse detected." });
    }
    const newAccess  = generateAccessToken(user._id, user.role);
    const newRefresh = generateRefreshToken(user._id);
    user.refreshToken = newRefresh;
    await user.save({ validateBeforeSave: false });
    setRefreshCookie(res, newRefresh);
    res.json({ success: true, accessToken: newAccess });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    clearRefreshCookie(res);
    res.json({ success: true, message: "Logged out." });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user: user.toSafe() });
  } catch (err) { next(err); }
};

module.exports = { register, login, refresh, logout, getMe };
