const { validationResult, body } = require("express-validator");

// ── Global error handler ──────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]", err.message);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ success: false, message: `${field} already exists.` });
  }
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(422).json({ success: false, message: "Validation failed.", errors });
  }
  if (err.name === "CastError")
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error." });
};

// ── Run validations ───────────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, message: "Validation failed.", errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  next();
};

// ── Rule sets ─────────────────────────────────────────────────────────────────
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name required.").isLength({ min: 2 }).withMessage("Min 2 chars."),
  body("email").trim().isEmail().withMessage("Valid email required.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Min 8 chars.")
    .matches(/[A-Z]/).withMessage("Need one uppercase.")
    .matches(/[0-9]/).withMessage("Need one number."),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password required."),
];

module.exports = { errorHandler, validate, registerRules, loginRules };
