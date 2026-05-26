const { Career, CareerRecommendation, SkillGapAnalysis, UserSkill } = require("../models");

const listCareers = async (req, res, next) => {
  try {
    const { search, industry, level, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search)   filter.$or = [{ title: new RegExp(search, "i") }, { description: new RegExp(search, "i") }, { keywords: new RegExp(search, "i") }];
    if (industry) filter.industry = new RegExp(industry, "i");
    if (level)    filter.experienceLevel = level;
    const [careers, total] = await Promise.all([
      Career.find(filter).select("-requiredSkills").sort({ title: 1 }).skip((page - 1) * limit).limit(Number(limit)),
      Career.countDocuments(filter),
    ]);
    res.json({ success: true, careers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getCareerById = async (req, res, next) => {
  try {
    const career = await Career.findById(req.params.id).populate("requiredSkills.skill", "name category type");
    if (!career) return res.status(404).json({ success: false, message: "Career not found." });
    res.json({ success: true, career });
  } catch (err) { next(err); }
};

// ── AI Recommendations (rule-based matching) ──────────────────────────────────
const getRecommendations = async (req, res, next) => {
  try {
    const userSkills = await UserSkill.find({ user: req.user.id }).populate("skill");
    const careers    = await Career.find().populate("requiredSkills.skill");

    const scored = careers.map(career => {
      const required = career.requiredSkills || [];
      if (required.length === 0) return { career, matchScore: 0.5 };

      let matched = 0;
      required.forEach(rs => {
        const has = userSkills.find(us => us.skill?._id?.toString() === rs.skill?._id?.toString());
        if (has) {
          const levels = ["beginner", "elementary", "intermediate", "advanced", "expert"];
          const userLvl = levels.indexOf(has.proficiencyLevel);
          const bonus = rs.isMandatory ? 1.5 : 1;
          matched += (userLvl + 1) / levels.length * bonus;
        }
      });

      const score = Math.min(matched / required.length, 1);
      return {
        career,
        matchScore: Math.round(score * 100) / 100,
        reasoning: {
          summary: `You match ${Math.round(score * 100)}% of required skills for ${career.title}.`,
          matchedSkills: userSkills.filter(us => required.some(rs => rs.skill?._id?.toString() === us.skill?._id?.toString())).map(us => us.skill?.name),
        },
      };
    }).filter(r => r.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

    // Save/update recommendations in DB
    const saved = await Promise.all(scored.map(async r => {
      const existing = await CareerRecommendation.findOne({ user: req.user.id, career: r.career._id });
      if (existing && existing.status !== "dismissed") {
        existing.matchScore = r.matchScore;
        existing.reasoning  = r.reasoning;
        await existing.save();
        return existing.populate("career", "title industry avgSalaryUsd experienceLevel");
      }
      if (existing?.status === "dismissed") return null;
      const rec = await CareerRecommendation.create({ user: req.user.id, career: r.career._id, matchScore: r.matchScore, reasoning: r.reasoning });
      return rec.populate("career", "title industry avgSalaryUsd experienceLevel");
    }));

    res.json({ success: true, recommendations: saved.filter(Boolean) });
  } catch (err) { next(err); }
};

const getRecommendationHistory = async (req, res, next) => {
  try {
    const recs = await CareerRecommendation.find({ user: req.user.id }).populate("career", "title industry avgSalaryUsd").sort({ matchScore: -1 });
    res.json({ success: true, recommendations: recs });
  } catch (err) { next(err); }
};

const updateRecommendation = async (req, res, next) => {
  try {
    const rec = await CareerRecommendation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: req.body.status },
      { new: true }
    );
    if (!rec) return res.status(404).json({ success: false, message: "Recommendation not found." });
    res.json({ success: true, recommendation: rec });
  } catch (err) { next(err); }
};

// ── Skill Gap Analysis ────────────────────────────────────────────────────────
const runSkillGap = async (req, res, next) => {
  try {
    const career     = await Career.findById(req.params.careerId).populate("requiredSkills.skill");
    if (!career)     return res.status(404).json({ success: false, message: "Career not found." });
    const userSkills = await UserSkill.find({ user: req.user.id }).populate("skill");

    const userSkillIds = userSkills.map(us => us.skill?._id?.toString());
    const missing = career.requiredSkills.filter(rs => !userSkillIds.includes(rs.skill?._id?.toString())).map(rs => rs.skill?._id);
    const strong  = career.requiredSkills.filter(rs => {
      const has = userSkills.find(us => us.skill?._id?.toString() === rs.skill?._id?.toString());
      return has && ["advanced", "expert"].includes(has.proficiencyLevel);
    }).map(rs => rs.skill?._id);

    const readinessScore = career.requiredSkills.length
      ? Math.round(((career.requiredSkills.length - missing.length) / career.requiredSkills.length) * 100)
      : 50;

    const analysis = await SkillGapAnalysis.findOneAndUpdate(
      { user: req.user.id, career: career._id },
      { missingSkills: missing, strongSkills: strong, readinessScore },
      { upsert: true, new: true }
    ).populate("missingSkills", "name category").populate("strongSkills", "name category");

    res.json({ success: true, analysis });
  } catch (err) { next(err); }
};

const getSkillGap = async (req, res, next) => {
  try {
    let analysis = await SkillGapAnalysis.findOne({ user: req.user.id, career: req.params.careerId })
      .populate("missingSkills", "name category").populate("strongSkills", "name category");
    if (!analysis) return runSkillGap(req, res, next);
    res.json({ success: true, analysis });
  } catch (err) { next(err); }
};

module.exports = { listCareers, getCareerById, getRecommendations, getRecommendationHistory, updateRecommendation, runSkillGap, getSkillGap };
