// routes/resume.routes.js
const r1 = require("express").Router();
const c  = require("../controllers/main.controller");
const { protect } = require("../middleware/auth.middleware");
r1.use(protect);
r1.get("/",                             c.getResumes);
r1.post("/",                            c.createResume);
r1.get("/:id",                          c.getResumeById);
r1.patch("/:id",                        c.updateResume);
r1.delete("/:id",                       c.deleteResume);
r1.post("/:id/sections",               c.addResumeSection);
r1.patch("/:id/sections/:sectionId",   c.updateResumeSection);
r1.delete("/:id/sections/:sectionId",  c.deleteResumeSection);
r1.post("/:id/ats-score",              c.getAtsScore);
r1.post("/:id/ai-improve",             c.aiImproveSection);
module.exports = r1;
