require("dotenv").config();
const express      = require("express");
const mongoose     = require("mongoose");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const morgan       = require("morgan");
const rateLimit    = require("express-rate-limit");

const authRoutes      = require("./routes/auth.routes");
const userRoutes      = require("./routes/user.routes");
const careerRoutes    = require("./routes/career.routes");
const skillRoutes     = require("./routes/skill.routes");
const roadmapRoutes   = require("./routes/roadmap.routes");
const resumeRoutes    = require("./routes/resume.routes");
const interviewRoutes = require("./routes/interview.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 15,
  message: { success: false, message: "Too many attempts, try again later." } });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api", globalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",       authLimiter, authRoutes);
app.use("/api/user",       userRoutes);
app.use("/api/careers",    careerRoutes);
app.use("/api/skills",     skillRoutes);
app.use("/api/roadmaps",   roadmapRoutes);
app.use("/api/resumes",    resumeRoutes);
app.use("/api/interviews", interviewRoutes);

app.get("/api/health", (_, res) => res.json({ success: true, message: "AI Career Coach API running." }));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀  Server on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error("❌  MongoDB:", err.message); process.exit(1); });
