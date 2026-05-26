import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useRoadmaps, useRoadmap, useResumes, useResume, useInterviews, useInterviewSession, useCareers } from "../../hooks";

// ══════════════════════════════════════════════════════════════════════════════
// ROADMAPS
// ══════════════════════════════════════════════════════════════════════════════
export const RoadmapsPage = () => {
  const { roadmaps, loading, create, remove } = useRoadmaps();
  const { careers, loading: cl }              = useCareers();
  const [careerId, setCareerId] = useState("");
  const [title,    setTitle]    = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    await create({ career_id: careerId || undefined, title: title.trim() });
    setCareerId(""); setTitle("");
    setCreating(false);
  };

  return (
    <div className="page">
      <div className="ph"><h1>Learning Roadmaps</h1><p>AI-generated step-by-step learning plans for your target career.</p></div>

      <div className="card mb-24">
        <h3 className="bold mb-16">Create new roadmap</h3>
        <div className="fc gap-12 wrap">
          <select className="input" style={{ flex: 2, minWidth: 180 }} value={careerId} onChange={e => setCareerId(e.target.value)} disabled={cl}>
            <option value="">-- No specific career --</option>
            {careers.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <input className="input" style={{ flex: 2, minWidth: 180 }} placeholder="Roadmap title e.g. 'ML Engineer Path'" value={title} onChange={e => setTitle(e.target.value)} />
          <button className="btn btn-primary" onClick={handleCreate} disabled={!title.trim() || creating}>
            {creating ? <span className="spin-sm" /> : "🗺️ Generate"}
          </button>
        </div>
      </div>

      {loading ? <div className="lc"><div className="spinner" /></div> :
        roadmaps.length === 0 ? <div className="empty"><div className="ei">🗺️</div><p>No roadmaps yet. Create one above!</p></div> :
        <div className="g2">{roadmaps.map(r => (
          <div key={r._id} className="card">
            <div className="fb mb-12">
              <span className={`badge ${r.status === "completed" ? "b-green" : "b-purple"}`}>{r.status}</span>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => remove(r._id)}>Delete</button>
            </div>
            <h3 className="bold sm mb-8">{r.title}</h3>
            <p className="muted sm mb-16">{r.career?.title || "General"} · {r.estimatedWeeks} weeks</p>
            <Link to={`/roadmaps/${r._id}`} className="btn btn-outline btn-sm">Open roadmap →</Link>
          </div>
        ))}</div>
      }
    </div>
  );
};

export const RoadmapDetailPage = () => {
  const { id } = useParams();
  const { roadmap, progress, loading, markProgress } = useRoadmap(id);
  const [marking, setMarking] = useState(null);

  if (loading) return <div className="lc" style={{ height: "80vh" }}><div className="spinner" /></div>;
  if (!roadmap) return <div className="page"><p>Roadmap not found.</p></div>;

  const handleMark = async (resourceId, done) => {
    setMarking(resourceId);
    await markProgress(resourceId, done ? "completed" : "not_started", done ? 100 : 0);
    setMarking(null);
  };

  return (
    <div className="page">
      <Link to="/roadmaps" className="btn btn-ghost btn-sm mb-16">← Back</Link>
      <div className="ph"><h1>{roadmap.title}</h1><p>{roadmap.career?.title || "General"} · {roadmap.estimatedWeeks} weeks estimated</p></div>

      {progress && (
        <div className="card mb-24">
          <div className="fb mb-12"><span className="bold">Overall progress</span><span className="badge b-purple">{progress.completionPct ?? 0}%</span></div>
          <div className="pbar mb-8"><div className="pfill" style={{ width: `${progress.completionPct ?? 0}%`, background: "var(--purple)" }} /></div>
          <div className="xs muted">{progress.completed} of {progress.total} resources completed</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(roadmap.resources || []).sort((a, b) => a.orderIndex - b.orderIndex).map(res => {
          const done = res.progress?.status === "completed";
          return (
            <div key={res._id} className="card card-sm" style={{ borderColor: done ? "var(--green)" : "var(--border)", opacity: done ? 0.8 : 1 }}>
              <div className="fc gap-12">
                <span style={{ fontSize: 22 }}>{res.type === "course" ? "📚" : res.type === "video" ? "🎥" : res.type === "book" ? "📖" : "📄"}</span>
                <div style={{ flex: 1 }}>
                  <div className="bold sm mb-8">{res.title}</div>
                  <div className="fc gap-8 xs muted">
                    {res.provider && <span>{res.provider}</span>}
                    {res.durationHours && <span>⏱ {res.durationHours}h</span>}
                    <span className={`badge ${res.isFree ? "b-green" : "b-amber"}`} style={{ fontSize: 10 }}>{res.isFree ? "Free" : "Paid"}</span>
                    {res.isRequired && <span className="badge b-pink" style={{ fontSize: 10 }}>Required</span>}
                  </div>
                  {res.url && res.url !== "#" && <a href={res.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm mt-8" style={{ padding: "4px 0", fontSize: 11 }}>Open resource ↗</a>}
                </div>
                <button className={`btn btn-sm ${done ? "btn-outline" : "btn-primary"}`} onClick={() => handleMark(res._id, !done)} disabled={marking === res._id} style={{ flexShrink: 0 }}>
                  {marking === res._id ? <span className="spin-sm" /> : done ? "✓ Done" : "Mark done"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// RESUMES
// ══════════════════════════════════════════════════════════════════════════════
export const ResumesPage = () => {
  const { resumes, loading, create, remove } = useResumes();
  const [form, setForm] = useState({ title: "", target_role: "", template_name: "default" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!form.title || !form.target_role) return;
    setCreating(true);
    const r = await create(form);
    if (r) setForm({ title: "", target_role: "", template_name: "default" });
    setCreating(false);
  };

  return (
    <div className="page">
      <div className="ph"><h1>Resume Builder</h1><p>Build ATS-optimised resumes with AI-powered suggestions and scoring.</p></div>

      <div className="card mb-24">
        <h3 className="bold mb-16">Create new resume</h3>
        <div className="fc gap-12 wrap">
          <input className="input" style={{ flex: 2, minWidth: 150 }} placeholder="Resume title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <input className="input" style={{ flex: 2, minWidth: 150 }} placeholder="Target role e.g. Full Stack Developer" value={form.target_role} onChange={e => setForm(p => ({ ...p, target_role: e.target.value }))} />
          <select className="input" style={{ flex: 1, minWidth: 110 }} value={form.template_name} onChange={e => setForm(p => ({ ...p, template_name: e.target.value }))}>
            <option value="default">Default</option><option value="modern">Modern</option><option value="minimal">Minimal</option>
          </select>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!form.title || !form.target_role || creating}>
            {creating ? <span className="spin-sm" /> : "+ Create"}
          </button>
        </div>
      </div>

      {loading ? <div className="lc"><div className="spinner" /></div> :
        resumes.length === 0 ? <div className="empty"><div className="ei">📄</div><p>No resumes yet.</p></div> :
        <div className="g2">{resumes.map(r => (
          <div key={r._id} className="card">
            <div className="fb mb-12">
              <span className="badge b-amber">{r.templateName}</span>
              {r.atsScore != null && <span className={`badge ${r.atsScore >= 70 ? "b-green" : r.atsScore >= 40 ? "b-amber" : "b-red"}`}>ATS: {r.atsScore}/100</span>}
            </div>
            <h3 className="bold sm mb-8">{r.title}</h3>
            <p className="muted sm mb-16">Target: {r.targetRole}</p>
            <div className="fc gap-8">
              <Link to={`/resumes/${r._id}`} className="btn btn-primary btn-sm">Edit →</Link>
              <button className="btn btn-danger btn-sm" onClick={() => remove(r._id)}>Delete</button>
            </div>
          </div>
        ))}</div>
      }
    </div>
  );
};

const SECTION_TYPES = ["summary", "experience", "education", "skills", "projects", "certifications", "achievements", "other"];

export const ResumeEditorPage = () => {
  const { id } = useParams();
  const { resume, atsResult, loading, atsLoading, addSection, updateSection, removeSection, runAts, aiImprove } = useResume(id);
  const [nType, setNType]     = useState("summary");
  const [nHead, setNHead]     = useState("");
  const [nCont, setNCont]     = useState("");
  const [improving, setImp]   = useState(null);
  const [improved, setImproved] = useState({});
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  if (loading) return <div className="lc" style={{ height: "80vh" }}><div className="spinner" /></div>;
  if (!resume) return <div className="page"><p>Resume not found.</p></div>;

  const handleAdd = async () => {
    if (!nHead.trim()) return;
    await addSection({ section_type: nType, heading: nHead, content: { text: nCont }, order_index: (resume.sections?.length || 0) + 1 });
    setNHead(""); setNCont("");
  };

  const handleAiImprove = async s => {
    setImp(s._id);
    const result = await aiImprove(s.sectionType, s.content?.text || "");
    if (result) setImproved(p => ({ ...p, [s._id]: result }));
    setImp(null);
  };

  const startEdit = s => { setEditing(s._id); setEditData({ heading: s.heading, content: s.content?.text || "" }); };
  const saveEdit  = async s => { await updateSection(s._id, { heading: editData.heading, content: { text: editData.content } }); setEditing(null); };

  return (
    <div className="page">
      <Link to="/resumes" className="btn btn-ghost btn-sm mb-16">← Back</Link>
      <div className="fb wrap gap-12 mb-24">
        <div><h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22 }}>{resume.title}</h1><p className="muted sm">Target: {resume.targetRole}</p></div>
        <button className="btn btn-primary" onClick={runAts} disabled={atsLoading}>{atsLoading ? <span className="spin-sm" /> : "🤖 Check ATS Score"}</button>
      </div>

      {atsResult && (
        <div className="card mb-24" style={{ borderColor: atsResult.ats_score >= 70 ? "var(--green)" : "var(--amber)" }}>
          <div className="fb mb-12"><h3 className="bold">ATS Score</h3><span className={`badge ${atsResult.ats_score >= 70 ? "b-green" : "b-amber"}`} style={{ fontSize: 14 }}>{atsResult.ats_score}/100</span></div>
          <div className="pbar mb-12"><div className="pfill" style={{ width: `${atsResult.ats_score}%`, background: atsResult.ats_score >= 70 ? "var(--green)" : "var(--amber)" }} /></div>
          {atsResult.suggestions?.length > 0 && <ul style={{ paddingLeft: 18 }}>{atsResult.suggestions.map((s, i) => <li key={i} className="sm muted" style={{ marginBottom: 4 }}>{s}</li>)}</ul>}
        </div>
      )}

      <h2 className="bold mb-16" style={{ fontSize: 15 }}>Sections ({resume.sections?.length || 0})</h2>

      {(resume.sections || []).length === 0
        ? <div className="empty mb-24"><p>No sections yet. Add one below.</p></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {resume.sections.map(s => (
              <div key={s._id} className="card">
                <div className="fb mb-12">
                  <div className="fc gap-8"><span className="badge b-amber">{s.sectionType}</span><span className="bold sm">{s.heading}</span></div>
                  <div className="fc gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleAiImprove(s)} disabled={improving === s._id}>{improving === s._id ? <span className="spin-sm" /> : "🤖 Improve"}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(s)}>✏️ Edit</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => removeSection(s._id)}>✕</button>
                  </div>
                </div>
                {editing === s._id ? (
                  <div>
                    <div className="fg"><input className="input mb-8" value={editData.heading} onChange={e => setEditData(p => ({ ...p, heading: e.target.value }))} /></div>
                    <textarea className="input mb-12" rows={4} value={editData.content} onChange={e => setEditData(p => ({ ...p, content: e.target.value }))} />
                    <div className="fc gap-8"><button className="btn btn-primary btn-sm" onClick={() => saveEdit(s)}>Save</button><button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button></div>
                  </div>
                ) : <p className="sm muted">{s.content?.text}</p>}
                {improved[s._id] && (
                  <div className="mt-12 card card-sm" style={{ borderColor: "var(--green)", background: "var(--green-bg)" }}>
                    <p className="xs bold mb-8" style={{ color: "var(--green)" }}>✨ AI suggestion:</p>
                    <p className="sm mb-12">{improved[s._id]}</p>
                    <div className="fc gap-8">
                      <button className="btn btn-primary btn-sm" onClick={() => { updateSection(s._id, { content: { text: improved[s._id] } }); setImproved(p => { const n = { ...p }; delete n[s._id]; return n; }); }}>Apply</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setImproved(p => { const n = { ...p }; delete n[s._id]; return n; })}>Dismiss</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
      }

      <div className="card" style={{ border: "1px dashed var(--border2)" }}>
        <h3 className="bold mb-16">+ Add section</h3>
        <div className="fc gap-12 wrap mb-12">
          <select className="input" style={{ flex: 1, minWidth: 120 }} value={nType} onChange={e => setNType(e.target.value)}>
            {SECTION_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <input className="input" style={{ flex: 2, minWidth: 160 }} placeholder="Section heading" value={nHead} onChange={e => setNHead(e.target.value)} />
        </div>
        <textarea className="input mb-12" rows={4} placeholder="Section content..." value={nCont} onChange={e => setNCont(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!nHead.trim()}>Add section</button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// INTERVIEWS
// ══════════════════════════════════════════════════════════════════════════════
export const InterviewsPage = () => {
  const { sessions, stats, loading, start } = useInterviews();
  const { careers, loading: cl }            = useCareers();
  const [careerId, setCareerId] = useState("");
  const [diff,     setDiff]     = useState("medium");
  const [mode,     setMode]     = useState("text");
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    setStarting(true);
    const s = await start({ career_id: careerId || undefined, difficulty: diff, mode });
    if (s) navigate(`/interviews/${s._id}`);
    setStarting(false);
  };

  return (
    <div className="page">
      <div className="ph"><h1>Interview Prep</h1><p>Practice with AI-generated questions. Get instant scoring and feedback.</p></div>

      {stats && (
        <div className="stats">
          <div className="stat"><div className="lbl">Sessions</div><div className="val" style={{ color: "var(--pink)" }}>{stats.sessions_count ?? 0}</div><div className="sub">Practice done</div></div>
          <div className="stat"><div className="lbl">Avg Score</div><div className="val" style={{ color: "var(--green)" }}>{stats.avg_score ?? 0}%</div></div>
          <div className="stat"><div className="lbl">Trend</div><div className="val" style={{ fontSize: 18, color: "var(--primary)" }}>{stats.improvement_trend || "—"}</div></div>
        </div>
      )}

      <div className="card mb-24">
        <h3 className="bold mb-16">Start new session</h3>
        <div className="fc gap-12 wrap">
          <select className="input" style={{ flex: 2, minWidth: 160 }} value={careerId} onChange={e => setCareerId(e.target.value)} disabled={cl}>
            <option value="">-- General questions --</option>
            {careers.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <select className="input" style={{ flex: 1, minWidth: 100 }} value={diff} onChange={e => setDiff(e.target.value)}>
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
          <select className="input" style={{ flex: 1, minWidth: 90 }} value={mode} onChange={e => setMode(e.target.value)}>
            <option value="text">Text</option><option value="voice">Voice</option>
          </select>
          <button className="btn btn-primary" onClick={handleStart} disabled={starting}>{starting ? <span className="spin-sm" /> : "🎤 Start"}</button>
        </div>
      </div>

      {loading ? <div className="lc"><div className="spinner" /></div> :
        sessions.length === 0 ? <div className="empty"><div className="ei">🎤</div><p>No sessions yet.</p></div> :
        <div className="g2">{sessions.map(s => (
          <Link key={s._id} to={`/interviews/${s._id}`} style={{ textDecoration: "none" }}>
            <div className="card" onMouseEnter={e => e.currentTarget.style.borderColor = "var(--pink)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div className="fb mb-12">
                <span className="badge b-pink">{s.difficulty}</span>
                {s.totalScore != null && <span className={`badge ${s.totalScore >= 70 ? "b-green" : s.totalScore >= 40 ? "b-amber" : "b-red"}`}>{s.totalScore}%</span>}
              </div>
              <h3 className="bold sm mb-8">{s.career?.title || "General"}</h3>
              <p className="xs muted">{s.mode} · {new Date(s.conductedAt).toLocaleDateString("en-IN")}</p>
            </div>
          </Link>
        ))}</div>
      }
    </div>
  );
};

export const InterviewSessionPage = () => {
  const { id } = useParams();
  const { session, questions, currentQuestion, answers, current, loading, submitting, isFirst, isLast, submitAnswer, next, prev, complete } = useInterviewSession(id);
  const [answer, setAnswer]   = useState("");
  const [submitted, setSub]   = useState(false);
  const [completing, setComp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return;
    await submitAnswer(currentQuestion._id, answer);
    setSub(true);
  };

  const handleNext = () => { next(); setAnswer(""); setSub(false); };

  const handleComplete = async () => {
    setComp(true);
    await complete();
    navigate("/interviews");
  };

  if (loading) return <div className="lc" style={{ height: "80vh" }}><div className="spinner" /></div>;
  if (!session || questions.length === 0) return <div className="page"><p>Session not found or no questions available.</p></div>;

  const result = currentQuestion ? answers[currentQuestion._id] : null;

  return (
    <div className="page-sm">
      <Link to="/interviews" className="btn btn-ghost btn-sm mb-16">← Back</Link>
      <div className="fb mb-16">
        <span className="muted sm">Question {current + 1} of {questions.length}</span>
        <div className="fc gap-8"><span className="badge b-pink">{session.difficulty}</span><span className="badge b-gray">{session.mode}</span></div>
      </div>
      <div className="pbar mb-24"><div className="pfill" style={{ width: `${((current + 1) / questions.length) * 100}%`, background: "var(--pink)" }} /></div>

      <div className="card mb-16" style={{ borderColor: "var(--pink)" }}>
        <div className="fc gap-8 mb-12"><span className="badge b-pink">{currentQuestion?.questionType}</span></div>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.7 }}>{currentQuestion?.questionText}</p>
      </div>

      {!submitted && (
        <>
          <textarea className="input mb-12" rows={6} placeholder="Type your answer here..." value={answer} onChange={e => setAnswer(e.target.value)} />
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!answer.trim() || submitting}>{submitting ? <span className="spin-sm" /> : "Submit answer"}</button>
        </>
      )}

      {submitted && result && (
        <div className="card mb-16" style={{ borderColor: result.score >= 7 ? "var(--green)" : result.score >= 4 ? "var(--amber)" : "var(--red)" }}>
          <div className="fb mb-12">
            <h3 className="bold">AI Feedback</h3>
            <span className={`badge ${result.score >= 7 ? "b-green" : result.score >= 4 ? "b-amber" : "b-red"}`} style={{ fontSize: 14 }}>{result.score}/10</span>
          </div>
          <p className="sm mb-12">{result.feedback}</p>
          {result.ideal_answer && (
            <div className="card card-sm" style={{ background: "var(--surface)" }}>
              <p className="xs muted bold mb-8">💡 Ideal answer approach:</p>
              <p className="sm">{result.ideal_answer}</p>
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div className="fc gap-12 mt-8">
          {!isFirst && <button className="btn btn-outline" onClick={() => { prev(); setAnswer(""); setSub(false); }}>← Prev</button>}
          {!isLast
            ? <button className="btn btn-primary" onClick={handleNext}>Next →</button>
            : <button className="btn btn-primary" onClick={handleComplete} disabled={completing}>{completing ? <span className="spin-sm" /> : "✅ Complete session"}</button>
          }
        </div>
      )}
    </div>
  );
};
