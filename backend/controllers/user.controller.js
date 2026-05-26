const { User, UserSkill, UserExperience, UserEducation, Skill } = require("../models");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user: user.toSafe() });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "avatarUrl"];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: "Profile updated.", user: user.toSafe() });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if (!await user.comparePassword(currentPassword))
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password changed." });
  } catch (err) { next(err); }
};

// ── Skills ────────────────────────────────────────────────────────────────────
const getUserSkills = async (req, res, next) => {
  try {
    const skills = await UserSkill.find({ user: req.user.id }).populate("skill", "name category type demandLevel");
    res.json({ success: true, skills });
  } catch (err) { next(err); }
};

const addUserSkill = async (req, res, next) => {
  try {
    const { skill_id, proficiency_level } = req.body;
    const skill = await Skill.findById(skill_id);
    if (!skill) return res.status(404).json({ success: false, message: "Skill not found." });
    const existing = await UserSkill.findOne({ user: req.user.id, skill: skill_id });
    if (existing) return res.status(409).json({ success: false, message: "Skill already added." });
    const us = await UserSkill.create({ user: req.user.id, skill: skill_id, proficiencyLevel: proficiency_level || "beginner" });
    const populated = await us.populate("skill", "name category type demandLevel");
    res.status(201).json({ success: true, skill: populated });
  } catch (err) { next(err); }
};

const updateUserSkill = async (req, res, next) => {
  try {
    const us = await UserSkill.findOneAndUpdate(
      { user: req.user.id, skill: req.params.skillId },
      { proficiencyLevel: req.body.proficiency_level },
      { new: true }
    ).populate("skill", "name category type");
    if (!us) return res.status(404).json({ success: false, message: "Skill not found." });
    res.json({ success: true, skill: us });
  } catch (err) { next(err); }
};

const removeUserSkill = async (req, res, next) => {
  try {
    await UserSkill.findOneAndDelete({ user: req.user.id, skill: req.params.skillId });
    res.json({ success: true, message: "Skill removed." });
  } catch (err) { next(err); }
};

// ── Experience ────────────────────────────────────────────────────────────────
const getExperiences = async (req, res, next) => {
  try {
    const experiences = await UserExperience.find({ user: req.user.id }).sort({ startDate: -1 });
    res.json({ success: true, experiences });
  } catch (err) { next(err); }
};

const addExperience = async (req, res, next) => {
  try {
    const exp = await UserExperience.create({ user: req.user.id, ...req.body });
    res.status(201).json({ success: true, experience: exp });
  } catch (err) { next(err); }
};

const deleteExperience = async (req, res, next) => {
  try {
    await UserExperience.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true, message: "Experience deleted." });
  } catch (err) { next(err); }
};

// ── Education ─────────────────────────────────────────────────────────────────
const getEducations = async (req, res, next) => {
  try {
    const educations = await UserEducation.find({ user: req.user.id }).sort({ graduationYear: -1 });
    res.json({ success: true, educations });
  } catch (err) { next(err); }
};

const addEducation = async (req, res, next) => {
  try {
    const edu = await UserEducation.create({ user: req.user.id, ...req.body });
    res.status(201).json({ success: true, education: edu });
  } catch (err) { next(err); }
};

const deleteEducation = async (req, res, next) => {
  try {
    await UserEducation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true, message: "Education deleted." });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, changePassword, getUserSkills, addUserSkill, updateUserSkill, removeUserSkill, getExperiences, addExperience, deleteExperience, getEducations, addEducation, deleteEducation };
