import React, { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import {
  useCareers, useCareer, useRecommendations, useSkillGap,
  useUserSkills, useSkillCatalog,
  useRoadmaps, useRoadmap,
  useResumes, useResume,
  useInterviews, useInterviewSession,
} from "../hooks";

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
export function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [fe, setFe]     = useState({});
  const [showPw, setSP] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]); // eslint-disable-line
  useEffect(() => () => clearError(), []); // eslint-disable-line

  const onChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setFe((p) => ({ ...p, [e.target.name]: "" })); clearError(); };
  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email)    errs.email    = "Email is required.";
    if (!form.password) errs.password = "Password is required.";
    if (Object.keys(errs).length) { setFe(errs); return; }
    await login(form.email, form.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎯</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue your career journey</p>
        {error && <div className="alert a-err">{error}</div>}
        <form onSubmit={onSubmit} noValidate>
          <div className="fg">
            <label>Email address</label>
            <input className={`input${fe.email ? " err" : ""}`} name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" />
            {fe.email && <span className="xs" style={{ color: "var(--red)" }}>{fe.email}</span>}
          </div>
          <div className="fg">
            <label>Password</label>
            <div className="input-wrap">
              <input className={`input${fe.password ? " err" : ""}`} name="password" type={showPw ? "text" : "password"} value={form.password} onChange={onChange} placeholder="Your password" autoComplete="current-password" />
              <button type="button" className="ia" onClick={() => setSP((p) => !p)}>{showPw ? "Hide" : "Show"}</button>
            </div>
            {fe.password && <span className="xs" style={{ color: "var(--red)" }}>{fe.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-8" disabled={isLoading}>
            {isLoading ? <span className="spin-sm" /> : "Sign in"}
          </button>
        </form>
        <p className="auth-foot">Don't have an account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fe, setFe]     = useState({});
  const [showPw, setSP] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate("/dashboard", { replace: true }); }, [isAuthenticated]); // eslint-disable-line
  useEffect(() => () => clearError(), []); // eslint-disable-line

  const onChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setFe((p) => ({ ...p, [e.target.name]: "" })); clearError(); };
  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = "Min 2 characters.";
    if (!/\S+@\S+\.\S+/.test(form.email))          e.email = "Enter a valid email.";
    if (form.password.length < 8)                   e.password = "Min 8 characters.";
    else if (!/[A-Z]/.test(form.password))          e.password = "Include one uppercase.";
    else if (!/[0-9]/.test(form.password))          e.password = "Include one number.";
    return e;
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFe(errs); return; }
    const { ok } = await register(form.name, form.email, form.password);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎯</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start your AI-powered career journey</p>
        {error && <div className="alert a-err">{error}</div>}
        <form onSubmit={onSubmit} noValidate>
          {[
            { name: "name",     label: "Full name",      type: "text",     ph: "Aarav Shah",              ac: "name" },
            { name: "email",    label: "Email address",  type: "email",    ph: "you@example.com",         ac: "email" },
          ].map((f) => (
            <div className="fg" key={f.name}>
              <label>{f.label}</label>
              <input className={`input${fe[f.name] ? " err" : ""}`} name={f.name} type={f.type} value={form[f.name]} onChange={onChange} placeholder={f.ph} autoComplete={f.ac} />
              {fe[f.name] && <span className="xs" style={{ color: "var(--red)" }}>{fe[f.name]}</span>}
            </div>
          ))}
          <div className="fg">
            <label>Password</label>
            <div className="input-wrap">
              <input className={`input${fe.password ? " err" : ""}`} name="password" type={showPw ? "text" : "password"} value={form.password} onChange={onChange} placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" />
              <button type="button" className="ia" onClick={() => setSP((p) => !p)}>{showPw ? "Hide" : "Show"}</button>
            </div>
            {fe.password && <span className="xs" style={{ color: "var(--red)" }}>{fe.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-8" disabled={isLoading}>
            {isLoading ? <span className="spin-sm" /> : "Create account"}
          </button>
        </form>
        <p className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export function DashboardPage() {
  const { user } = useAuth();
  const { roadmaps,  loading: rl }  = useRoadmaps();
  const { resumes,   loading: resl } = useResumes();
  const { sessions,  stats, loading: il } = useInterviews();

  const modules = [
    { to: "/careers",    icon: "🎯", label: "Explore Careers",  desc: "AI-matched career paths",       c: "var(--primary)" },
    { to: "/skills",     icon: "⚡", label: "My Skills",         desc: "Track your skill set",           c: "var(--teal)" },
    { to: "/roadmaps",   icon: "🗺️",  label: "Learning Roadmaps", desc: "Personalised learning plans",   c: "var(--purple)" },
    { to: "/resumes",    icon: "📄", label: "Resume Builder",   desc: "ATS-optimised resumes with AI",  c: "var(--amber)" },
    { to: "/interviews", icon: "🎤", label: "Interview Prep",   desc: "Practice with AI questions",     c: "var(--pink)" },
    { to: "/profile",    icon: "👤", label: "My Profile",       desc: "Update details and goals",       c: "var(--green)" },
  ];

  return (
    <div className="page">
      <div className="card mb-24" style={{ background: "linear-gradient(135deg,#1a2a4a,#1e2535)", borderColor: "var(--primary)" }}>
        <div className="fb wrap gap-12">
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22 }}>
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="muted sm mt-8">Your AI career coach is ready.</p>
          </div>
          <Link to="/careers" className="btn btn-primary">Get Recommendations →</Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="lbl">Active Roadmaps</div>     <div className="val" style={{ color: "var(--purple)" }}>{rl  ? "—" : roadmaps.filter(r => r.status === "active").length}</div><div className="sub">In progress</div></div>
        <div className="stat"><div className="lbl">Resumes</div>             <div className="val" style={{ color: "var(--amber)"  }}>{resl ? "—" : resumes.length}</div><div className="sub">Built with AI</div></div>
        <div className="stat"><div className="lbl">Interview Sessions</div>  <div className="val" style={{ color: "var(--pink)"   }}>{il  ? "—" : sessions.length}</div><div className="sub">Practice done</div></div>
        <div className="stat"><div className="lbl">Avg Interview Score</div> <div className="val" style={{ color: "var(--green)"  }}>{il || !stats ? "—" : `${stats.avg_score ?? 0}%`}</div><div className="sub">Across sessions</div></div>
      </div>

      <h2 className="bold mb-16" style={{ fontSize: 15 }}>All Modules</h2>
      <div className="g3 mb-24">
        {modules.map((m) => (
          <Link key={m.to} to={m.to} style={{ textDecoration: "none" }}>
            <div className="card" style={{ cursor: "pointer", height: "100%", transition: "border-color .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = m.c)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{m.icon}</div>
              <div className="bold sm mb-8">{m.label}</div>
              <div className="muted sm">{m.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {sessions.length > 0 && (
        <>
          <div className="fb mb-16">
            <h2 className="bold" style={{ fontSize: 15 }}>Recent Interview Sessions</h2>
            <Link to="/interviews" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="g2">
            {sessions.slice(0, 4).map((s) => (
              <Link key={s._id} to={`/interviews/${s._id}`} style={{ textDecoration: "none" }}>
                <div className="card card-sm fc gap-12" style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--pink)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <span style={{ fontSize: 20 }}>🎤</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bold sm truncate">{s.career?.title || "General"}</div>
                    <div className="xs muted mt-8">{s.difficulty} · {new Date(s.conductedAt).toLocaleDateString("en-IN")}</div>
                  </div>
                  {s.totalScore != null && (
                    <span className={`badge ${s.totalScore >= 70 ? "b-green" : s.totalScore >= 40 ? "b-amber" : "b-red"}`}>{s.totalScore}%</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════════════════
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [pf, setPf]     = useState({ name: user?.name || "", avatarUrl: user?.avatarUrl || "" });
  const [pw, setPw]     = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSv] = useState(false);
  const [chPw, setChPw] = useState(false);
  const [pwe, setPwe]   = useState({});

  const savePf = async (e) => {
    e.preventDefault(); setSv(true);
    try { const { data } = await authAPI.updateProfile(pf); updateUser(data.user); toast.success("Profile updated!"); }
    catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setSv(false); }
  };

  const savePw = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.currentPassword)               errs.cur = "Enter current password.";
    if (pw.newPassword.length < 8)         errs.new = "Min 8 characters.";
    else if (!/[A-Z]/.test(pw.newPassword)) errs.new = "Include uppercase.";
    else if (!/[0-9]/.test(pw.newPassword)) errs.new = "Include a number.";
    if (pw.newPassword !== pw.confirm)     errs.con = "Passwords don't match.";
    if (Object.keys(errs).length) { setPwe(errs); return; }
    setChPw(true);
    try { await authAPI.changePassword(pw.currentPassword, pw.newPassword); toast.success("Password changed!"); setPw({ currentPassword: "", newPassword: "", confirm: "" }); setPwe({}); }
    catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setChPw(false); }
  };

  return (
    <div className="page-sm">
      <div className="ph"><h1>My Profile</h1><p>Manage account info and security settings.</p></div>
      <div className="card mb-24 fc gap-16">
        <div className={`avatar avatar-lg`}>{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="bold" style={{ fontSize: 17 }}>{user?.name}</div>
          <div className="muted sm">{user?.email}</div>
          <div className="fc gap-8 mt-8">
            <span className="badge b-blue">{user?.role}</span>
            <span className={`badge ${user?.isVerified ? "b-green" : "b-amber"}`}>{user?.isVerified ? "✓ Verified" : "Unverified"}</span>
          </div>
        </div>
      </div>

      <div className="card mb-24">
        <h3 className="bold mb-16">Personal information</h3>
        <form onSubmit={savePf}>
          <div className="fg"><label>Full name</label><input className="input" value={pf.name} onChange={(e) => setPf((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="fg"><label>Email</label><input className="input" value={user?.email || ""} disabled /></div>
          <div className="fg"><label>Avatar URL <span className="muted">(optional)</span></label><input className="input" value={pf.avatarUrl} onChange={(e) => setPf((p) => ({ ...p, avatarUrl: e.target.value }))} placeholder="https://..." /></div>
          <div className="fg">
            <label>Member since</label>
            <input className="input" disabled value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spin-sm" /> : "Save changes"}</button>
        </form>
      </div>

      <div className="card">
        <h3 className="bold mb-16">Change password</h3>
        <form onSubmit={savePw}>
          {[
            { key: "cur", name: "currentPassword", label: "Current password", ac: "current-password" },
            { key: "new", name: "newPassword",      label: "New password",     ac: "new-password" },
            { key: "con", name: "confirm",          label: "Confirm password", ac: "new-password" },
          ].map((f) => (
            <div className="fg" key={f.name}>
              <label>{f.label}</label>
              <input className={`input${pwe[f.key] ? " err" : ""}`} type="password" value={pw[f.name]}
                onChange={(e) => { setPw((p) => ({ ...p, [f.name]: e.target.value })); setPwe((p) => ({ ...p, [f.key]: "" })); }}
                autoComplete={f.ac} />
              {pwe[f.key] && <span className="xs" style={{ color: "var(--red)" }}>{pwe[f.key]}</span>}
            </div>
          ))}
          <button type="submit" className="btn btn-primary" disabled={chPw}>{chPw ? <span className="spin-sm" /> : "Update password"}</button>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CAREERS
// ══════════════════════════════════════════════════════════════════════════════
export function CareersPage() {
  const [tab, setTab]       = useState("browse");
  const [search, setSearch] = useState("");
  const { careers, loading: cl }                = useCareers();
  const { recs, loading: rl, refetch, save }    = useRecommendations();

  const filtered = careers.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="ph"><h1>Career Intelligence</h1><p>Explore careers and get AI-powered recommendations.</p></div>
      <div className="fc gap-0 mb-24" style={{ borderBottom: "1px solid var(--border)" }}>
        {["browse", "recommendations"].map((t) => (
          <button key={t} className="btn btn-ghost" onClick={() => setTab(t)}
            style={{ borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent", borderRadius: 0, paddingBottom: 10, color: tab === t ? "var(--primary)" : "var(--text2)" }}>
            {t === "browse" ? "🔍 Browse" : "🤖 AI Recommendations"}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <>
          <div className="fg mb-24"><input className="input" placeholder="🔍  Search careers or industries..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {cl ? <div className="lc"><div className="spinner" /></div> :
           filtered.length === 0 ? <div className="empty"><div className="ei">🎯</div><p>No careers found.</p></div> :
           <div className="g3">{filtered.map((c) => (
            <Link key={c._id} to={`/careers/${c._id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ cursor: "pointer", height: "100%" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--teal)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                <div className="fb mb-12"><span className="badge b-teal">{c.industry}</span><span className="badge b-gray">{c.experienceLevel}</span></div>
                <h3 className="bold sm mb-8">{c.title}</h3>
                <p className="muted sm mb-12" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.description}</p>
                <div className="fc gap-12 xs muted">
                  {c.avgSalaryUsd > 0 && <span>💰 ${c.avgSalaryUsd.toLocaleString()}/yr</span>}
                  {c.growthRate && <span>📈 {c.growthRate}</span>}
                </div>
              </div>
            </Link>
          ))}</div>}
        </>
      )}

      {tab === "recommendations" && (
        <>
          <div className="fb mb-24">
            <p className="muted sm">AI matches your skills to the best career paths.</p>
            <button className="btn btn-primary btn-sm" onClick={refetch} disabled={rl}>{rl ? <span className="spin-sm" /> : "🔄 Refresh"}</button>
          </div>
          {rl ? <div className="lc"><div className="spinner" /></div> :
           recs.filter((r) => r.status !== "dismissed").length === 0 ?
           <div className="empty"><div className="ei">🤖</div><p>No recommendations yet. Add your skills first!</p></div> :
           <div className="g2">{recs.filter((r) => r.status !== "dismissed").map((r) => (
            <div key={r._id} className="card" style={{ borderColor: "var(--primary)" }}>
              <div className="fb mb-12">
                <span className="badge b-blue">{Math.round((r.matchScore || 0) * 100)}% match</span>
                <div className="fc gap-8">
                  <button className="btn btn-ghost btn-sm" onClick={() => save(r._id, "saved")}>💾 Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => save(r._id, "dismissed")}>✕</button>
                </div>
              </div>
              <h3 className="bold sm mb-8">{r.career?.title}</h3>
              <p className="muted xs mb-12">{r.career?.industry}</p>
              <div className="pbar mb-12"><div className="pfill" style={{ width: `${Math.round((r.matchScore || 0) * 100)}%`, background: "var(--primary)" }} /></div>
              {r.reasoning?.summary && <p className="xs muted mb-12">{r.reasoning.summary}</p>}
              <Link to={`/careers/${r.career?._id}`} className="btn btn-outline btn-sm">View details →</Link>
            </div>
          ))}</div>}
        </>
      )}
    </div>
  );
}

export function CareerDetailPage() {
  const { id } = useParams();
  const { career, loading }          = useCareer(id);
  const { analysis, loading: gl, run } = useSkillGap(id);

  if (loading) return <div className="lc" style={{ height: "80vh" }}><div className="spinner" /></div>;
  if (!career) return <div className="page"><p>Career not found.</p></div>;

  return (
    <div className="page">
      <Link to="/careers" className="btn btn-ghost btn-sm mb-16">← Back</Link>
      <div className="ph">
        <div className="fc gap-12 mb-8"><span className="badge b-teal">{career.industry}</span><span className="badge b-gray">{career.experienceLevel}</span></div>
        <h1>{career.title}</h1>
        <div className="fc gap-16 mt-8 muted sm">
          {career.avgSalaryUsd > 0 && <span>💰 ${career.avgSalaryUsd.toLocaleString()}/yr</span>}
          <span>📈 {career.growthRate}</span>
          <span>🎓 {career.educationRequired}</span>
        </div>
      </div>
      <div className="g2">
        <div>
          <div className="card mb-16"><h3 className="bold mb-12">About this career</h3><p className="muted sm" style={{ lineHeight: 1.7 }}>{career.description}</p></div>
          {career.requiredSkills?.length > 0 && (
            <div className="card">
              <h3 className="bold mb-12">Required skills</h3>
              <div className="fc gap-8 wrap">
                {career.requiredSkills.map((rs) => (
                  <span key={rs._id} className={`badge ${rs.isMandatory ? "b-blue" : "b-gray"}`}>{rs.skill?.name || "—"}{rs.isMandatory && " ★"}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <div className="fb mb-12">
            <h3 className="bold">Skill Gap Analysis</h3>
            <button className="btn btn-primary btn-sm" onClick={run} disabled={gl}>{gl ? <span className="spin-sm" /> : "🔍 Analyse"}</button>
          </div>
          {analysis ? (
            <>
              <div className="mb-16">
                <div className="fb mb-8"><span className="bold sm">Readiness</span><span className={`badge ${analysis.readinessScore >= 70 ? "b-green" : analysis.readinessScore >= 40 ? "b-amber" : "b-red"}`}>{analysis.readinessScore}%</span></div>
                <div className="pbar"><div className="pfill" style={{ width: `${analysis.readinessScore}%`, background: analysis.readinessScore >= 70 ? "var(--green)" : analysis.readinessScore >= 40 ? "var(--amber)" : "var(--red)" }} /></div>
              </div>
              {analysis.strongSkills?.length > 0 && <div className="mb-12"><div className="xs muted bold mb-8">✅ Your strengths</div><div className="fc gap-8 wrap">{analysis.strongSkills.map((s) => <span key={s._id} className="badge b-green">{s.name}</span>)}</div></div>}
              {analysis.missingSkills?.length > 0 && <div><div className="xs muted bold mb-8">❌ Skills to develop</div><div className="fc gap-8 wrap">{analysis.missingSkills.map((s) => <span key={s._id} className="badge b-red">{s.name}</span>)}</div></div>}
            </>
          ) : <p className="muted sm">Click Analyse to check your readiness.</p>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SKILLS
// ══════════════════════════════════════════════════════════════════════════════
const LEVELS = ["beginner", "elementary", "intermediate", "advanced", "expert"];
const LVL_BADGE = { beginner: "b-gray", elementary: "b-blue", intermediate: "b-teal", advanced: "b-purple", expert: "b-amber" };

export function SkillsPage() {
  const { skills, loading, add, update, remove } = useUserSkills();
  const { catalog, loading: cl }                  = useSkillCatalog();
  const [search, setSearch] = useState("");
  const [sel, setSel]       = useState("");
  const [lvl, setLvl]       = useState("beginner");
  const [adding, setAdding] = useState(false);

  const ownedIds = skills.map((s) => s.skill?._id || s._id);
  const available = catalog.filter((s) =>
    !ownedIds.includes(s._id) && (!search || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!sel) return;
    setAdding(true);
    await add(sel, lvl);
    setSel(""); setLvl("beginner"); setSearch("");
    setAdding(false);
  };

  return (
    <div className="page">
      <div className="ph"><h1>My Skills</h1><p>Track your skills and proficiency — these power your career recommendations.</p></div>
      <div className="card mb-24">
        <h3 className="bold mb-16">Add a skill</h3>
        <div className="fc gap-12 wrap">
          <div style={{ flex: 2, minWidth: 140 }}><input className="input" placeholder="🔍 Search skill..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div style={{ flex: 2, minWidth: 150 }}>
            <select className="input" value={sel} onChange={(e) => setSel(e.target.value)} disabled={cl}>
              <option value="">-- Select skill --</option>
              {available.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.category})</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <select className="input" value={lvl} onChange={(e) => setLvl(e.target.value)}>
              {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!sel || adding}>{adding ? <span className="spin-sm" /> : "+ Add"}</button>
        </div>
      </div>
      {loading ? <div className="lc"><div className="spinner" /></div> :
       skills.length === 0 ? <div className="empty"><div className="ei">⚡</div><p>No skills yet. Add some above!</p></div> :
       <div className="g3">{skills.map((s) => {
         const skillId = s.skill?._id || s._id;
         const name    = s.skill?.name || s.name || "—";
         const cat     = s.skill?.category;
         return (
           <div key={skillId} className="card card-sm">
             <div className="fb mb-8"><span className="bold sm">{name}</span>
               <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)", padding: "2px 6px" }} onClick={() => remove(skillId)}>✕</button>
             </div>
             {cat && <div className="xs muted mb-12">{cat}</div>}
             <div className="fc gap-8 wrap">
               {LEVELS.map((l) => (
                 <button key={l} onClick={() => update(skillId, l)}
                   className={`badge ${s.proficiencyLevel === l ? LVL_BADGE[l] : "b-gray"}`}
                   style={{ cursor: "pointer", border: "none" }}>{l}</button>
               ))}
             </div>
           </div>
         );
       })}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROADMAPS
// ══════════════════════════════════════════════════════════════════════════════
export function RoadmapsPage() {
  const { roadmaps, loading, create, remove } = useRoadmaps();
  const { careers, loading: cl }              = useCareers();
  const [careerId, setCareerId] = useState("");
  const [title, setTitle]       = useState("");
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
          <select className="input" style={{ flex: 2, minWidth: 180 }} value={careerId} onChange={(e) => setCareerId(e.target.value)} disabled={cl}>
            <option value="">-- No specific career --</option>
            {careers.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <input className="input" style={{ flex: 2, minWidth: 180 }} placeholder="Roadmap title e.g. ML Engineer Path" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button className="btn btn-primary" onClick={handleCreate} disabled={!title.trim() || creating}>{creating ? <span className="spin-sm" /> : "🗺️ Generate"}</button>
        </div>
      </div>
      {loading ? <div className="lc"><div className="spinner" /></div> :
       roadmaps.length === 0 ? <div className="empty"><div className="ei">🗺️</div><p>No roadmaps yet.</p></div> :
       <div className="g2">{roadmaps.map((r) => (
        <div key={r._id} className="card">
          <div className="fb mb-12">
            <span className={`badge ${r.status === "completed" ? "b-green" : "b-purple"}`}>{r.status}</span>
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => remove(r._id)}>Delete</button>
          </div>
          <h3 className="bold sm mb-8">{r.title}</h3>
          <p className="muted sm mb-16">{r.career?.title || "General"} · {r.estimatedWeeks} weeks</p>
          <Link to={`/roadmaps/${r._id}`} className="btn btn-outline btn-sm">Open →</Link>
        </div>
      ))}</div>}
    </div>
  );
}

export function RoadmapDetailPage() {
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
      <div className="ph"><h1>{roadmap.title}</h1><p>{roadmap.career?.title || "General"} · {roadmap.estimatedWeeks} weeks</p></div>
      {progress && (
        <div className="card mb-24">
          <div className="fb mb-12"><span className="bold">Overall progress</span><span className="badge b-purple">{progress.completionPct ?? 0}%</span></div>
          <div className="pbar mb-8"><div className="pfill" style={{ width: `${progress.completionPct ?? 0}%`, background: "var(--purple)" }} /></div>
          <div className="xs muted">{progress.completed} of {progress.total} resources completed</div>
        </div>
      )}
      <div className="col gap-12">
        {(roadmap.resources || []).sort((a, b) => a.orderIndex - b.orderIndex).map((res) => {
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
                </div>
                <button className={`btn btn-sm ${done ? "btn-outline" : "btn-primary"}`}
                  onClick={() => handleMark(res._id, !done)} disabled={marking === res._id} style={{ flexShrink: 0 }}>
                  {marking === res._id ? <span className="spin-sm" /> : done ? "✓ Done" : "Mark done"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESUMES
// ══════════════════════════════════════════════════════════════════════════════
const SEC_TYPES = ["summary","experience","education","skills","projects","certifications","achievements","other"];

export function ResumesPage() {
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
      <div className="ph"><h1>Resume Builder</h1><p>Build ATS-optimised resumes with AI suggestions and scoring.</p></div>
      <div className="card mb-24">
        <h3 className="bold mb-16">Create new resume</h3>
        <div className="fc gap-12 wrap">
          <input className="input" style={{ flex: 2, minWidth: 150 }} placeholder="Resume title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <input className="input" style={{ flex: 2, minWidth: 150 }} placeholder="Target role e.g. Full Stack Developer" value={form.target_role} onChange={(e) => setForm((p) => ({ ...p, target_role: e.target.value }))} />
          <select className="input" style={{ flex: 1, minWidth: 110 }} value={form.template_name} onChange={(e) => setForm((p) => ({ ...p, template_name: e.target.value }))}>
            <option value="default">Default</option><option value="modern">Modern</option><option value="minimal">Minimal</option>
          </select>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!form.title || !form.target_role || creating}>{creating ? <span className="spin-sm" /> : "+ Create"}</button>
        </div>
      </div>
      {loading ? <div className="lc"><div className="spinner" /></div> :
       resumes.length === 0 ? <div className="empty"><div className="ei">📄</div><p>No resumes yet.</p></div> :
       <div className="g2">{resumes.map((r) => (
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
      ))}</div>}
    </div>
  );
}

export function ResumeEditorPage() {
  const { id } = useParams();
  const { resume, atsResult, loading, atsLoading, addSection, updateSection, removeSection, runAts, aiImprove } = useResume(id);
  const [nType, setNType]       = useState("summary");
  const [nHead, setNHead]       = useState("");
  const [nCont, setNCont]       = useState("");
  const [improving, setImp]     = useState(null);
  const [improved, setImproved] = useState({});
  const [editing, setEditing]   = useState(null);
  const [editData, setEditData] = useState({});

  if (loading) return <div className="lc" style={{ height: "80vh" }}><div className="spinner" /></div>;
  if (!resume) return <div className="page"><p>Resume not found.</p></div>;

  const handleAdd = async () => {
    if (!nHead.trim()) return;
    await addSection({ section_type: nType, heading: nHead, content: { text: nCont }, order_index: (resume.sections?.length || 0) + 1 });
    setNHead(""); setNCont("");
  };

  const handleAiImprove = async (s) => {
    setImp(s._id);
    const result = await aiImprove(s.sectionType, s.content?.text || "");
    if (result) setImproved((p) => ({ ...p, [s._id]: result }));
    setImp(null);
  };

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
        : <div className="col gap-10 mb-24">{resume.sections.map((s) => (
            <div key={s._id} className="card">
              <div className="fb mb-12">
                <div className="fc gap-8"><span className="badge b-amber">{s.sectionType}</span><span className="bold sm">{s.heading}</span></div>
                <div className="fc gap-8">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleAiImprove(s)} disabled={improving === s._id}>{improving === s._id ? <span className="spin-sm" /> : "🤖 Improve"}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(s._id); setEditData({ heading: s.heading, content: s.content?.text || "" }); }}>✏️</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => removeSection(s._id)}>✕</button>
                </div>
              </div>
              {editing === s._id ? (
                <div>
                  <input className="input mb-8" value={editData.heading} onChange={(e) => setEditData((p) => ({ ...p, heading: e.target.value }))} />
                  <textarea className="input mb-12" rows={4} value={editData.content} onChange={(e) => setEditData((p) => ({ ...p, content: e.target.value }))} />
                  <div className="fc gap-8">
                    <button className="btn btn-primary btn-sm" onClick={() => { updateSection(s._id, { heading: editData.heading, content: { text: editData.content } }); setEditing(null); }}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : <p className="sm muted">{s.content?.text}</p>}
              {improved[s._id] && (
                <div className="card card-sm mt-12" style={{ borderColor: "var(--green)", background: "var(--green-bg)" }}>
                  <p className="xs bold mb-8" style={{ color: "var(--green)" }}>✨ AI suggestion:</p>
                  <p className="sm mb-12">{improved[s._id]}</p>
                  <div className="fc gap-8">
                    <button className="btn btn-primary btn-sm" onClick={() => { updateSection(s._id, { content: { text: improved[s._id] } }); setImproved((p) => { const n = { ...p }; delete n[s._id]; return n; }); }}>Apply</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setImproved((p) => { const n = { ...p }; delete n[s._id]; return n; })}>Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          ))}</div>
      }

      <div className="card" style={{ border: "1px dashed var(--border2)" }}>
        <h3 className="bold mb-16">+ Add section</h3>
        <div className="fc gap-12 wrap mb-12">
          <select className="input" style={{ flex: 1, minWidth: 120 }} value={nType} onChange={(e) => setNType(e.target.value)}>
            {SEC_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <input className="input" style={{ flex: 2, minWidth: 160 }} placeholder="Section heading" value={nHead} onChange={(e) => setNHead(e.target.value)} />
        </div>
        <textarea className="input mb-12" rows={4} placeholder="Section content..." value={nCont} onChange={(e) => setNCont(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!nHead.trim()}>Add section</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERVIEWS
// ══════════════════════════════════════════════════════════════════════════════
export function InterviewsPage() {
  const { sessions, stats, loading, start } = useInterviews();
  const { careers, loading: cl }            = useCareers();
  const [careerId, setCareerId] = useState("");
  const [diff, setDiff]         = useState("medium");
  const [mode, setMode]         = useState("text");
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
      <div className="ph"><h1>Interview Prep</h1><p>Practice with AI-generated questions and get instant scoring and feedback.</p></div>
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
          <select className="input" style={{ flex: 2, minWidth: 160 }} value={careerId} onChange={(e) => setCareerId(e.target.value)} disabled={cl}>
            <option value="">-- General questions --</option>
            {careers.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <select className="input" style={{ flex: 1, minWidth: 100 }} value={diff} onChange={(e) => setDiff(e.target.value)}>
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
          <select className="input" style={{ flex: 1, minWidth: 90 }} value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="text">Text</option><option value="voice">Voice</option>
          </select>
          <button className="btn btn-primary" onClick={handleStart} disabled={starting}>{starting ? <span className="spin-sm" /> : "🎤 Start"}</button>
        </div>
      </div>
      {loading ? <div className="lc"><div className="spinner" /></div> :
       sessions.length === 0 ? <div className="empty"><div className="ei">🎤</div><p>No sessions yet.</p></div> :
       <div className="g2">{sessions.map((s) => (
        <Link key={s._id} to={`/interviews/${s._id}`} style={{ textDecoration: "none" }}>
          <div className="card" onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--pink)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
            <div className="fb mb-12">
              <span className="badge b-pink">{s.difficulty}</span>
              {s.totalScore != null && <span className={`badge ${s.totalScore >= 70 ? "b-green" : s.totalScore >= 40 ? "b-amber" : "b-red"}`}>{s.totalScore}%</span>}
            </div>
            <h3 className="bold sm mb-8">{s.career?.title || "General"}</h3>
            <p className="xs muted">{s.mode} · {new Date(s.conductedAt).toLocaleDateString("en-IN")}</p>
          </div>
        </Link>
      ))}</div>}
    </div>
  );
}

export function InterviewSessionPage() {
  const { id } = useParams();
  const { session, questions, currentQuestion, answers, current, loading, submitting, isFirst, isLast, submitAnswer, next, prev, complete } = useInterviewSession(id);
  const [answer, setAnswer]     = useState("");
  const [submitted, setSub]     = useState(false);
  const [completing, setComp]   = useState(false);
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
  if (!session || questions.length === 0) return <div className="page"><p>Session not found or no questions.</p></div>;

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
        <span className="badge b-pink mb-12" style={{ display: "inline-flex" }}>{currentQuestion?.questionType}</span>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.7, marginTop: 8 }}>{currentQuestion?.questionText}</p>
      </div>

      {!submitted && (
        <>
          <textarea className="input mb-12" rows={6} placeholder="Type your answer here..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!answer.trim() || submitting}>
            {submitting ? <span className="spin-sm" /> : "Submit answer"}
          </button>
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
              <p className="xs muted bold mb-8">💡 Ideal approach:</p>
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
            : <button className="btn btn-primary" onClick={handleComplete} disabled={completing}>{completing ? <span className="spin-sm" /> : "✅ Complete"}</button>
          }
        </div>
      )}
    </div>
  );
}
