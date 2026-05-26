const r = require("express").Router();
const { Skill } = require("../models");
const { protect } = require("../middleware/auth.middleware");
r.use(protect);
r.get("/", async (req, res, next) => {
  try {
    const { search, category, type } = req.query;
    const filter = {};
    if (search)   filter.$or = [{ name: new RegExp(search, "i") }, { category: new RegExp(search, "i") }];
    if (category) filter.category = new RegExp(category, "i");
    if (type)     filter.type = type;
    const skills = await Skill.find(filter).sort({ name: 1 });
    res.json({ success: true, skills });
  } catch (err) { next(err); }
});
module.exports = r;
