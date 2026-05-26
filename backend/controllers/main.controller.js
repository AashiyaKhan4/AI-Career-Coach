const { LearningRoadmap, Resume, InterviewSession, Skill, Career } = require("../models");

// ══════════════════════════════════════════════════════════════════════════════
// ROADMAPS
// ══════════════════════════════════════════════════════════════════════════════

// Pre-built resource templates per career category
const RESOURCE_TEMPLATES = {
  default: [
    { title: "Foundations Course",      type: "course",   provider: "Coursera",  durationHours: 20, isFree: false, isRequired: true,  orderIndex: 1 },
    { title: "Core Concepts - YouTube", type: "video",    provider: "YouTube",   durationHours: 5,  isFree: true,  isRequired: false, orderIndex: 2 },
    { title: "Official Documentation",  type: "article",  provider: "MDN/Docs",  durationHours: 8,  isFree: true,  isRequired: true,  orderIndex: 3 },
    { title: "Hands-on Project",        type: "course",   provider: "Udemy",     durationHours: 15, isFree: false, isRequired: true,  orderIndex: 4 },
    { title: "Interview Prep Guide",    type: "article",  provider: "LeetCode",  durationHours: 10, isFree: true,  isRequired: false, orderIndex: 5 },
    { title: "Advanced Topics Book",    type: "book",     provider: "O'Reilly",  durationHours: 25, isFree: false, isRequired: false, orderIndex: 6 },
  ],
};

const getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await LearningRoadmap.find({ user: req.user.id })
      .populate("career", "title industry").sort({ createdAt: -1 });
    res.json({ success: true, roadmaps });
  } catch (err) { next(err); }
};

const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, user: req.user.id })
      .populate("career", "title industry");
    if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found." });
    res.json({ success: true, roadmap });
  } catch (err) { next(err); }
};

const createRoadmap = async (req, res, next) => {
  try {
    const { career_id, title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title required." });
    const resources = RESOURCE_TEMPLATES.default.map(r => ({
      ...r,
      title: r.title,
      url: "#",
      progress: { status: "not_started", completionPct: 0 },
    }));
    const roadmap = await LearningRoadmap.create({
      user: req.user.id,
      career: career_id || undefined,
      title,
      estimatedWeeks: 8,
      resources,
    });
    const populated = await roadmap.populate("career", "title industry");
    res.status(201).json({ success: true, roadmap: populated });
  } catch (err) { next(err); }
};

const deleteRoadmap = async (req, res, next) => {
  try {
    await LearningRoadmap.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true, message: "Roadmap deleted." });
  } catch (err) { next(err); }
};

const updateResourceProgress = async (req, res, next) => {
  try {
    const { status, completion_pct } = req.body;
    const roadmap = await LearningRoadmap.findOne({ user: req.user.id, "resources._id": req.params.resourceId });
    if (!roadmap) return res.status(404).json({ success: false, message: "Resource not found." });
    const resource = roadmap.resources.id(req.params.resourceId);
    resource.progress = { status, completionPct: completion_pct };
    await roadmap.save();

    const total = roadmap.resources.length;
    const done  = roadmap.resources.filter(r => r.progress?.status === "completed").length;
    if (done === total) { roadmap.status = "completed"; await roadmap.save(); }

    res.json({ success: true, progress: resource.progress, roadmapStatus: roadmap.status });
  } catch (err) { next(err); }
};

const getRoadmapProgress = async (req, res, next) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, user: req.user.id });
    if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found." });
    const total         = roadmap.resources.length;
    const completed     = roadmap.resources.filter(r => r.progress?.status === "completed").length;
    const completionPct = total ? Math.round((completed / total) * 100) : 0;
    res.json({ success: true, completionPct, completed, total });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════════════════════════
// RESUMES
// ══════════════════════════════════════════════════════════════════════════════

const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json({ success: true, resumes });
  } catch (err) { next(err); }
};

const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    res.json({ success: true, resume });
  } catch (err) { next(err); }
};

const createResume = async (req, res, next) => {
  try {
    const { title, target_role, template_name } = req.body;
    if (!title || !target_role)
      return res.status(400).json({ success: false, message: "Title and target role required." });
    const resume = await Resume.create({ user: req.user.id, title, targetRole: target_role, templateName: template_name || "default" });
    res.status(201).json({ success: true, resume });
  } catch (err) { next(err); }
};

const updateResume = async (req, res, next) => {
  try {
    const allowed = ["title", "targetRole", "templateName"];
    const updates = {};
    if (req.body.title)         updates.title        = req.body.title;
    if (req.body.target_role)   updates.targetRole   = req.body.target_role;
    if (req.body.template_name) updates.templateName = req.body.template_name;
    const resume = await Resume.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updates, { new: true });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    res.json({ success: true, resume });
  } catch (err) { next(err); }
};

const deleteResume = async (req, res, next) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true, message: "Resume deleted." });
  } catch (err) { next(err); }
};

const addResumeSection = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    const { section_type, heading, content, order_index } = req.body;
    resume.sections.push({ sectionType: section_type, heading, content: content || {}, orderIndex: order_index || resume.sections.length + 1 });
    await resume.save();
    const section = resume.sections[resume.sections.length - 1];
    res.status(201).json({ success: true, section, resume });
  } catch (err) { next(err); }
};

const updateResumeSection = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    const section = resume.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found." });
    if (req.body.heading)    section.heading    = req.body.heading;
    if (req.body.content)    section.content    = req.body.content;
    if (req.body.order_index !== undefined) section.orderIndex = req.body.order_index;
    await resume.save();
    res.json({ success: true, section, resume });
  } catch (err) { next(err); }
};

const deleteResumeSection = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    resume.sections.pull({ _id: req.params.sectionId });
    await resume.save();
    res.json({ success: true, message: "Section deleted.", resume });
  } catch (err) { next(err); }
};

const getAtsScore = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    // Rule-based ATS scoring
    let score = 30;
    const suggestions = [];
    if (resume.sections.length >= 3) score += 20; else suggestions.push("Add more sections (experience, skills, education).");
    if (resume.sections.some(s => s.sectionType === "summary")) score += 15; else suggestions.push("Add a professional summary section.");
    if (resume.sections.some(s => s.sectionType === "skills"))  score += 15; else suggestions.push("Add a skills section.");
    if (resume.sections.some(s => s.sectionType === "experience")) score += 10; else suggestions.push("Add work experience.");
    if (resume.targetRole && resume.sections.some(s => JSON.stringify(s.content).toLowerCase().includes(resume.targetRole.toLowerCase()))) score += 10; else suggestions.push(`Mention your target role '${resume.targetRole}' in your content.`);
    score = Math.min(score, 100);
    resume.atsScore     = score;
    resume.aiSuggestions = suggestions;
    await resume.save();
    res.json({ success: true, ats_score: score, suggestions });
  } catch (err) { next(err); }
};

const aiImproveSection = async (req, res, next) => {
  try {
    const { section_type, content } = req.body;
    // Rule-based improvement suggestions
    const improvements = {
      summary:    `Experienced ${req.body.target_role || "professional"} with a proven track record of delivering results. Passionate about continuous learning and innovation. Seeking opportunities to leverage expertise and contribute to team success.`,
      experience: content + "\n• Quantified achievements with metrics and impact\n• Led cross-functional initiatives\n• Improved processes resulting in measurable outcomes",
      skills:     content + "\n• Add relevant technical certifications\n• Include soft skills like communication and leadership",
      default:    content + " [Enhanced with action verbs and quantified results]",
    };
    res.json({ success: true, improved_content: improvements[section_type] || improvements.default });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════════════════════════
// INTERVIEWS
// ══════════════════════════════════════════════════════════════════════════════

const QUESTION_BANK = {
  behavioral: [
    { q: "Tell me about a time you faced a difficult challenge at work. How did you handle it?", type: "behavioral" },
    { q: "Describe a situation where you had to work with a difficult team member.", type: "behavioral" },
    { q: "Tell me about your greatest professional achievement.", type: "behavioral" },
    { q: "How do you handle tight deadlines and pressure?", type: "behavioral" },
    { q: "Describe a time you showed leadership.", type: "behavioral" },
  ],
  technical: [
    { q: "Explain the difference between synchronous and asynchronous programming.", type: "technical" },
    { q: "What is the difference between REST and GraphQL?", type: "technical" },
    { q: "How would you optimise a slow database query?", type: "technical" },
    { q: "Explain the concept of Object-Oriented Programming.", type: "technical" },
    { q: "What is a data structure? Name three common ones.", type: "technical" },
  ],
  situational: [
    { q: "If you were given a project with no clear requirements, what would you do first?", type: "situational" },
    { q: "How would you handle a situation where your manager disagrees with your approach?", type: "situational" },
    { q: "What would you do if you discovered a bug just before a product launch?", type: "situational" },
  ],
  general: [
    { q: "Why do you want to work in this field?", type: "general" },
    { q: "Where do you see yourself in 5 years?", type: "general" },
    { q: "What are your greatest strengths and weaknesses?", type: "general" },
    { q: "Why should we hire you?", type: "general" },
    { q: "What do you know about our company/industry?", type: "general" },
  ],
};

const IDEAL_ANSWERS = {
  behavioral:    "Use the STAR method: Situation, Task, Action, Result. Be specific and quantify results.",
  technical:     "Explain clearly with examples. Show understanding of trade-offs.",
  situational:   "Demonstrate structured thinking, communication skills, and proactive problem-solving.",
  general:       "Be authentic, concise, and align your answer with the role requirements.",
};

const getInterviewSessions = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user.id }).populate("career", "title").sort({ conductedAt: -1 });
    res.json({ success: true, sessions });
  } catch (err) { next(err); }
};

const getInterviewById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user.id }).populate("career", "title industry");
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    res.json({ success: true, session });
  } catch (err) { next(err); }
};

const startInterview = async (req, res, next) => {
  try {
    const { career_id, difficulty = "medium", mode = "text" } = req.body;
    const difficultyCount = { easy: 3, medium: 5, hard: 8 };
    const count = difficultyCount[difficulty] || 5;

    // Mix question types based on difficulty
    const all = [
      ...QUESTION_BANK.general.slice(0, 2),
      ...QUESTION_BANK.behavioral.slice(0, 2),
      ...(difficulty !== "easy" ? QUESTION_BANK.technical.slice(0, 2) : []),
      ...(difficulty === "hard"  ? QUESTION_BANK.situational.slice(0, 2) : []),
    ];
    const questions = all.slice(0, count).map(q => ({ questionText: q.q, questionType: q.type }));

    const session = await InterviewSession.create({
      user: req.user.id,
      career: career_id || undefined,
      difficulty, mode,
      questions,
      conductedAt: new Date(),
    });
    const populated = await session.populate("career", "title");
    res.status(201).json({ success: true, session: populated });
  } catch (err) { next(err); }
};

const getInterviewQuestions = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    res.json({ success: true, questions: session.questions });
  } catch (err) { next(err); }
};

const submitAnswer = async (req, res, next) => {
  try {
    const { question_id, user_answer } = req.body;
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    const question = session.questions.id(question_id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    // Rule-based scoring
    const wordCount = (user_answer || "").trim().split(/\s+/).length;
    let score = 5;
    if (wordCount > 50)  score += 2;
    if (wordCount > 100) score += 2;
    if (wordCount > 20)  score = Math.max(score, 4);
    if (wordCount < 10)  score = Math.min(score, 3);
    score = Math.min(10, Math.max(1, score));

    const feedback = score >= 8
      ? "Excellent answer! You demonstrated clear understanding and provided specific examples."
      : score >= 5
      ? "Good answer. Consider adding more specific examples or quantifiable results."
      : "Your answer could be more detailed. Try the STAR method (Situation, Task, Action, Result).";

    question.userAnswer  = user_answer;
    question.score       = score;
    question.feedback    = feedback;
    question.idealAnswer = IDEAL_ANSWERS[question.questionType] || IDEAL_ANSWERS.general;
    await session.save();

    res.json({ success: true, result: { score, feedback, ideal_answer: question.idealAnswer } });
  } catch (err) { next(err); }
};

const completeInterview = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    const scores   = session.questions.filter(q => q.score != null).map(q => q.score);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) : 0;
    session.totalScore = avgScore;
    session.aiFeedback = {
      summary:     avgScore >= 70 ? "Strong performance overall!" : avgScore >= 40 ? "Good effort, room to improve." : "Keep practising — focus on specific examples.",
      strengths:   ["Clear communication", "Relevant experience"],
      improvements:["Quantify your achievements", "Use the STAR method consistently"],
    };
    await session.save();
    res.json({ success: true, session });
  } catch (err) { next(err); }
};

const getInterviewStats = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user.id, totalScore: { $ne: null } });
    const scores   = sessions.map(s => s.totalScore);
    const avg      = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const trend    = scores.length >= 2
      ? (scores[scores.length - 1] > scores[0] ? "↑ Improving" : scores[scores.length - 1] < scores[0] ? "↓ Declining" : "→ Stable")
      : "Not enough data";
    res.json({ success: true, stats: { sessions_count: sessions.length, avg_score: avg, improvement_trend: trend } });
  } catch (err) { next(err); }
};

module.exports = {
  getRoadmaps, getRoadmapById, createRoadmap, deleteRoadmap, updateResourceProgress, getRoadmapProgress,
  getResumes, getResumeById, createResume, updateResume, deleteResume, addResumeSection, updateResumeSection, deleteResumeSection, getAtsScore, aiImproveSection,
  getInterviewSessions, getInterviewById, startInterview, getInterviewQuestions, submitAnswer, completeInterview, getInterviewStats,
};
