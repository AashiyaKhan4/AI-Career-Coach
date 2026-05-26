const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const { Schema } = mongoose;

// ── User ──────────────────────────────────────────────────────────────────────
const userSchema = new Schema({
  name:            { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:        { type: String, minlength: 8, select: false },
  role:            { type: String, enum: ["user", "admin"], default: "user" },
  authProvider:    { type: String, enum: ["local"], default: "local" },
  isVerified:      { type: Boolean, default: false },
  avatarUrl:       { type: String, default: null },
  refreshToken:    { type: String, select: false },
  lastLoginAt:     { type: Date,   default: null },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};
userSchema.methods.toSafe = function() {
  return { id: this._id, name: this.name, email: this.email, role: this.role, isVerified: this.isVerified, avatarUrl: this.avatarUrl, lastLoginAt: this.lastLoginAt, createdAt: this.createdAt };
};

// ── Skill (catalog) ───────────────────────────────────────────────────────────
const skillSchema = new Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  category:    { type: String, required: true },
  type:        { type: String, enum: ["technical", "soft"], default: "technical" },
  demandLevel: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  description: { type: String, default: "" },
}, { timestamps: true });

// ── Career ────────────────────────────────────────────────────────────────────
const careerSchema = new Schema({
  title:              { type: String, required: true, unique: true },
  industry:           { type: String, required: true },
  description:        { type: String, required: true },
  avgSalaryUsd:       { type: Number, default: 0 },
  growthRate:         { type: String, default: "Moderate" },
  educationRequired:  { type: String, default: "Bachelor's Degree" },
  experienceLevel:    { type: String, enum: ["entry", "mid", "senior"], default: "mid" },
  keywords:           [String],
  requiredSkills:     [{ skill: { type: Schema.Types.ObjectId, ref: "Skill" }, importanceLevel: { type: String, enum: ["low", "medium", "high"], default: "medium" }, isMandatory: { type: Boolean, default: false } }],
}, { timestamps: true });

// ── UserSkill ─────────────────────────────────────────────────────────────────
const userSkillSchema = new Schema({
  user:             { type: Schema.Types.ObjectId, ref: "User", required: true },
  skill:            { type: Schema.Types.ObjectId, ref: "Skill", required: true },
  proficiencyLevel: { type: String, enum: ["beginner", "elementary", "intermediate", "advanced", "expert"], default: "beginner" },
  isVerified:       { type: Boolean, default: false },
}, { timestamps: true });
userSkillSchema.index({ user: 1, skill: 1 }, { unique: true });

// ── UserExperience ────────────────────────────────────────────────────────────
const userExperienceSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: "User", required: true },
  company:     { type: String, required: true },
  roleTitle:   { type: String, required: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date },
  description: { type: String },
  isCurrent:   { type: Boolean, default: false },
}, { timestamps: true });

// ── UserEducation ─────────────────────────────────────────────────────────────
const userEducationSchema = new Schema({
  user:          { type: Schema.Types.ObjectId, ref: "User", required: true },
  institution:   { type: String, required: true },
  degree:        { type: String, required: true },
  fieldOfStudy:  { type: String },
  graduationYear:{ type: Number },
  grade:         { type: String },
}, { timestamps: true });

// ── CareerRecommendation ──────────────────────────────────────────────────────
const recSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: "User",   required: true },
  career:     { type: Schema.Types.ObjectId, ref: "Career", required: true },
  matchScore: { type: Number, default: 0 },
  reasoning:  { type: Object, default: {} },
  status:     { type: String, enum: ["pending", "saved", "dismissed"], default: "pending" },
}, { timestamps: true });

// ── SkillGapAnalysis ──────────────────────────────────────────────────────────
const gapSchema = new Schema({
  user:          { type: Schema.Types.ObjectId, ref: "User",   required: true },
  career:        { type: Schema.Types.ObjectId, ref: "Career", required: true },
  missingSkills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
  strongSkills:  [{ type: Schema.Types.ObjectId, ref: "Skill" }],
  readinessScore:{ type: Number, default: 0 },
}, { timestamps: true });

// ── LearningRoadmap ───────────────────────────────────────────────────────────
const roadmapSchema = new Schema({
  user:           { type: Schema.Types.ObjectId, ref: "User",   required: true },
  career:         { type: Schema.Types.ObjectId, ref: "Career" },
  title:          { type: String, required: true },
  status:         { type: String, enum: ["active", "completed", "paused"], default: "active" },
  estimatedWeeks: { type: Number, default: 8 },
  resources:      [{
    skill:       { type: Schema.Types.ObjectId, ref: "Skill" },
    title:       String,
    type:        { type: String, enum: ["course", "video", "article", "book"], default: "course" },
    url:         String,
    provider:    String,
    durationHours: Number,
    isFree:      { type: Boolean, default: true },
    isRequired:  { type: Boolean, default: false },
    orderIndex:  { type: Number, default: 0 },
    progress:    { status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" }, completionPct: { type: Number, default: 0 } },
  }],
}, { timestamps: true });

// ── Resume ────────────────────────────────────────────────────────────────────
const resumeSchema = new Schema({
  user:         { type: Schema.Types.ObjectId, ref: "User", required: true },
  title:        { type: String, required: true },
  targetRole:   { type: String, required: true },
  templateName: { type: String, default: "default" },
  atsScore:     { type: Number, default: null },
  aiSuggestions:{ type: Array,  default: [] },
  sections:     [{
    sectionType:{ type: String, enum: ["summary", "experience", "education", "skills", "projects", "certifications", "achievements", "other"], default: "other" },
    heading:    String,
    content:    { type: Object, default: {} },
    orderIndex: { type: Number, default: 0 },
  }],
}, { timestamps: true });

// ── InterviewSession ──────────────────────────────────────────────────────────
const interviewSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: "User",   required: true },
  career:     { type: Schema.Types.ObjectId, ref: "Career" },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  mode:       { type: String, enum: ["text", "voice"], default: "text" },
  totalScore: { type: Number, default: null },
  aiFeedback: { type: Object, default: {} },
  questions:  [{
    questionText: String,
    questionType: { type: String, enum: ["behavioral", "technical", "situational", "general"], default: "general" },
    userAnswer:   String,
    idealAnswer:  String,
    score:        { type: Number, default: null },
    feedback:     String,
  }],
  conductedAt:{ type: Date, default: Date.now },
}, { timestamps: true });

// ── ChatSession ───────────────────────────────────────────────────────────────
const chatSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: "User", required: true },
  sessionType: { type: String, enum: ["career", "resume", "interview", "general"], default: "general" },
  messages:    [{ role: { type: String, enum: ["user", "assistant"] }, content: String, timestamp: { type: Date, default: Date.now } }],
  aiModelUsed: { type: String, default: "gpt-4" },
}, { timestamps: true });

module.exports = {
  User:                mongoose.model("User",                userSchema),
  Skill:               mongoose.model("Skill",               skillSchema),
  Career:              mongoose.model("Career",              careerSchema),
  UserSkill:           mongoose.model("UserSkill",           userSkillSchema),
  UserExperience:      mongoose.model("UserExperience",      userExperienceSchema),
  UserEducation:       mongoose.model("UserEducation",       userEducationSchema),
  CareerRecommendation:mongoose.model("CareerRecommendation",recSchema),
  SkillGapAnalysis:    mongoose.model("SkillGapAnalysis",    gapSchema),
  LearningRoadmap:     mongoose.model("LearningRoadmap",     roadmapSchema),
  Resume:              mongoose.model("Resume",              resumeSchema),
  InterviewSession:    mongoose.model("InterviewSession",    interviewSchema),
  ChatSession:         mongoose.model("ChatSession",         chatSchema),
};
