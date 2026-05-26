// routes/auth.routes.js
const r = require("express").Router();
const c = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate, registerRules, loginRules } = require("../middleware/error.middleware");
r.post("/register", registerRules, validate, c.register);
r.post("/login",    loginRules,    validate, c.login);
r.post("/refresh",  c.refresh);
r.post("/logout",   protect, c.logout);
r.get("/me",        protect, c.getMe);
module.exports = r;
