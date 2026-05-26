// routes/career.routes.js
const r1 = require("express").Router();
const c1 = require("../controllers/career.controller");
const { protect } = require("../middleware/auth.middleware");
r1.use(protect);
r1.get("/",                              c1.listCareers);
r1.get("/recommendations",               c1.getRecommendations);
r1.get("/recommendations/history",       c1.getRecommendationHistory);
r1.patch("/recommendations/:id",         c1.updateRecommendation);
r1.get("/skill-gap/:careerId",           c1.getSkillGap);
r1.post("/skill-gap/:careerId",          c1.runSkillGap);
r1.get("/:id",                           c1.getCareerById);
module.exports = r1;
