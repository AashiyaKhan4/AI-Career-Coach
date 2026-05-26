import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { careerAPI, skillAPI, roadmapAPI, resumeAPI, interviewAPI } from "../api";

// ── Careers ───────────────────────────────────────────────────────────────────
export function useCareers(params) {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async (p) => {
    setLoading(true);
    try { const { data } = await careerAPI.list(p || params || {}); setCareers(data.careers || []); }
    catch (e) { console.error(e); }
    finally   { setLoading(false); }
  // eslint-disable-next-line
  }, []);

  useEffect(() => { fetch(); }, []); // eslint-disable-line
  return { careers, loading, refetch: fetch };
}

export function useCareer(id) {
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    careerAPI.getById(id)
      .then(({ data }) => setCareer(data.career))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  return { career, loading };
}

export function useRecommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await careerAPI.recommendations(); setRecs(data.recommendations || []); }
    catch (e) { console.error(e); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, []); // eslint-disable-line

  const save = useCallback(async (id, status) => {
    try {
      await careerAPI.updateRec(id, status);
      setRecs((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      toast.success(status === "saved" ? "Saved!" : "Dismissed.");
    } catch { toast.error("Failed."); }
  }, []);

  return { recs, loading, refetch: fetch, save };
}

export function useSkillGap(careerId) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(false);

  const fetch = useCallback(async () => {
    if (!careerId) return;
    setLoading(true);
    try { const { data } = await careerAPI.skillGapGet(careerId); setAnalysis(data.analysis); }
    catch (e) { console.error(e); }
    finally   { setLoading(false); }
  }, [careerId]);

  useEffect(() => { fetch(); }, [careerId]); // eslint-disable-line

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await careerAPI.skillGapRun(careerId);
      setAnalysis(data.analysis);
      toast.success("Analysis complete!");
      return data.analysis;
    } catch { toast.error("Analysis failed."); }
    finally { setLoading(false); }
  }, [careerId]);

  return { analysis, loading, run, refetch: fetch };
}

// ── Skills ────────────────────────────────────────────────────────────────────
export function useUserSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    skillAPI.mine()
      .then(({ data }) => setSkills(data.skills || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const add = useCallback(async (skill_id, proficiency_level) => {
    try {
      const { data } = await skillAPI.add(skill_id, proficiency_level);
      setSkills((p) => [...p, data.skill]);
      toast.success("Skill added!");
    } catch (e) { toast.error(e.response?.data?.message || "Failed."); }
  }, []);

  const update = useCallback(async (id, proficiency_level) => {
    try {
      await skillAPI.update(id, proficiency_level);
      setSkills((p) => p.map((s) => {
        const sid = s.skill?._id || s._id;
        return sid === id ? { ...s, proficiencyLevel: proficiency_level } : s;
      }));
    } catch { toast.error("Update failed."); }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await skillAPI.remove(id);
      setSkills((p) => p.filter((s) => (s.skill?._id || s._id) !== id));
      toast.success("Skill removed.");
    } catch { toast.error("Failed."); }
  }, []);

  return { skills, loading, add, update, remove };
}

export function useSkillCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    skillAPI.catalog()
      .then(({ data }) => setCatalog(data.skills || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);
  return { catalog, loading };
}

// ── Roadmaps ──────────────────────────────────────────────────────────────────
export function useRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await roadmapAPI.list(); setRoadmaps(data.roadmaps || []); }
    catch (e) { console.error(e); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, []); // eslint-disable-line

  const create = useCallback(async (body) => {
    setLoading(true);
    try {
      const { data } = await roadmapAPI.create(body);
      setRoadmaps((p) => [data.roadmap, ...p]);
      toast.success("Roadmap created!");
      return data.roadmap;
    } catch (e) { toast.error(e.response?.data?.message || "Failed."); return null; }
    finally     { setLoading(false); }
  }, []);

  const remove = useCallback(async (id) => {
    try { await roadmapAPI.remove(id); setRoadmaps((p) => p.filter((r) => r._id !== id)); toast.success("Deleted."); }
    catch { toast.error("Failed."); }
  }, []);

  return { roadmaps, loading, create, remove, refetch: fetch };
}

export function useRoadmap(id) {
  const [roadmap, setRoadmap]   = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [r, p] = await Promise.allSettled([roadmapAPI.getById(id), roadmapAPI.progress(id)]);
    if (r.status === "fulfilled") setRoadmap(r.value.data.roadmap);
    if (p.status === "fulfilled") setProgress(p.value.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const markProgress = useCallback(async (resourceId, status, pct) => {
    try {
      await roadmapAPI.updateResource(resourceId, { status, completion_pct: pct });
      const { data: prog } = await roadmapAPI.progress(id);
      setProgress(prog);
      const { data: rd } = await roadmapAPI.getById(id);
      setRoadmap(rd.roadmap);
      toast.success(status === "completed" ? "Marked complete! ✓" : "Progress updated.");
    } catch { toast.error("Failed."); }
  }, [id]);

  return { roadmap, progress, loading, markProgress, refetch: load };
}

// ── Resumes ───────────────────────────────────────────────────────────────────
export function useResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await resumeAPI.list(); setResumes(data.resumes || []); }
    catch (e) { console.error(e); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, []); // eslint-disable-line

  const create = useCallback(async (body) => {
    try {
      const { data } = await resumeAPI.create(body);
      setResumes((p) => [data.resume, ...p]);
      toast.success("Resume created!");
      return data.resume;
    } catch (e) { toast.error(e.response?.data?.message || "Failed."); return null; }
  }, []);

  const remove = useCallback(async (id) => {
    try { await resumeAPI.remove(id); setResumes((p) => p.filter((r) => r._id !== id)); toast.success("Deleted."); }
    catch { toast.error("Failed."); }
  }, []);

  return { resumes, loading, create, remove, refetch: fetch };
}

export function useResume(id) {
  const [resume, setResume]       = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [atsLoading, setAtsL]     = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try { const { data } = await resumeAPI.getById(id); setResume(data.resume); }
    catch (e) { console.error(e); }
    finally   { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const update        = useCallback(async (body)         => { const { data } = await resumeAPI.update(id, body);              setResume(data.resume); toast.success("Saved."); },         [id]);
  const addSection    = useCallback(async (body)         => { const { data } = await resumeAPI.addSection(id, body);          setResume(data.resume); },                                    [id]);
  const updateSection = useCallback(async (sid, body)    => { const { data } = await resumeAPI.updateSection(id, sid, body);  setResume(data.resume); toast.success("Updated."); },         [id]);
  const removeSection = useCallback(async (sid)          => { const { data } = await resumeAPI.removeSection(id, sid);        setResume(data.resume); toast.success("Removed."); },         [id]);

  const runAts = useCallback(async () => {
    setAtsL(true);
    try {
      const { data } = await resumeAPI.atsScore(id);
      setAtsResult(data);
      setResume((p) => ({ ...p, atsScore: data.ats_score, aiSuggestions: data.suggestions }));
      toast.success(`ATS Score: ${data.ats_score}/100`);
      return data;
    } catch { toast.error("ATS check failed."); }
    finally { setAtsL(false); }
  }, [id]);

  const aiImprove = useCallback(async (section_type, content) => {
    const { data } = await resumeAPI.aiImprove(id, { section_type, content });
    return data.improved_content;
  }, [id]);

  return { resume, atsResult, loading, atsLoading, update, addSection, updateSection, removeSection, runAts, aiImprove, refetch: load };
}

// ── Interviews ────────────────────────────────────────────────────────────────
export function useInterviews() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([interviewAPI.list(), interviewAPI.stats()])
      .then(([s, st]) => {
        if (s.status  === "fulfilled") setSessions(s.value.data.sessions || []);
        if (st.status === "fulfilled") setStats(st.value.data.stats);
      })
      .finally(() => setLoading(false));
  }, []);

  const start = useCallback(async (body) => {
    try {
      const { data } = await interviewAPI.start(body);
      setSessions((p) => [data.session, ...p]);
      toast.success("Session started!");
      return data.session;
    } catch (e) { toast.error(e.response?.data?.message || "Failed."); return null; }
  }, []);

  return { sessions, stats, loading, start };
}

export function useInterviewSession(id) {
  const [session,    setSession]    = useState(null);
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [current,    setCurrent]    = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.allSettled([interviewAPI.getById(id), interviewAPI.questions(id)])
      .then(([s, q]) => {
        if (s.status === "fulfilled") setSession(s.value.data.session);
        if (q.status === "fulfilled") setQuestions(q.value.data.questions || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const submitAnswer = useCallback(async (question_id, user_answer) => {
    setSubmitting(true);
    try {
      const { data } = await interviewAPI.answer(id, { question_id, user_answer });
      setAnswers((p) => ({ ...p, [question_id]: data.result }));
      return data.result;
    } catch { toast.error("Submit failed."); return null; }
    finally { setSubmitting(false); }
  }, [id]);

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, questions.length - 1)), [questions.length]);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  const complete = useCallback(async () => {
    const scores = Object.values(answers).map((a) => a.score || 0);
    const avg    = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) : 0;
    const { data } = await interviewAPI.complete(id, { total_score: avg, ai_feedback: {} });
    setSession(data.session);
    toast.success("Session completed!");
    return data.session;
  }, [id, answers]);

  return {
    session, questions, answers, current, loading, submitting,
    currentQuestion: questions[current] || null,
    isFirst: current === 0,
    isLast:  current === questions.length - 1,
    submitAnswer, next, prev, complete,
  };
}
