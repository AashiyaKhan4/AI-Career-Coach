import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useRoadmaps, useResumes, useInterviews } from "../../hooks";
import { authAPI } from "../../api";

export const DashboardPage = () => {
  const { user } = useAuth();
  const { roadmaps,  loading: rl } = useRoadmaps();
  const { resumes,   loading: resl } = useResumes();
  const { sessions,  stats, loading: il } = useInterviews();

  const modules = [
    { to: "/careers",    icon: "🎯", label: "Explore Careers",   desc: "AI-matched career paths",          c: "var(--primary)" },
    { to: "/skills",     icon: "⚡", label: "My Skills",          desc: "Track and grow your skill set",    c: "var(--teal)" },
    { to: "/roadmaps",   icon: "🗺️", label: "Learning Roadmaps",  desc: "Personalised learning plans",      c: "var(--purple)" },
    { to: "/resumes",    icon: "📄", label: "Resume Builder",     desc: "ATS-optimised resumes with AI",    c: "var(--amber)" },
    { to: "/interviews", icon: "🎤", label: "Interview Prep",     desc: "Practice with AI questions",       c: "var(--pink)" },
    { to: "/profile",    icon: "👤", label: "My Profile",         desc: "Update your details and goals",    c: "var(--green)" },
  ];

  return (
    <div className="page">
      <div className="card mb-24" style={{ background: "linear-gradient(135deg,#1a2a4a,#1e2535)", border: "1px solid var(--primary)" }}>
        <div className="fb wrap gap-12">
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22 }}>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="muted mt-8 sm">Your AI career coach is ready. Here's a snapshot of your progress.</p>
          </div>
          <Link to="/careers" className="btn btn-primary">Get Recommendations →</Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="lbl">Active Roadmaps</div><div className="val" style={{ color: "var(--purple)" }}>{rl ? "—" : roadmaps.filter(r => r.status === "active").length}</div><div className="sub">In progress</div></div>
        <div className="stat"><div className="lbl">Resumes</div><div className="val" style={{ color: "var(--amber)" }}>{resl ? "—" : resumes.length}</div><div className="sub">Built with AI</div></div>
        <div className="stat"><div className="lbl">Interview Sessions</div><div className="val" style={{ color: "var(--pink)" }}>{il ? "—" : sessions.length}</div><div className="sub">Practice done</div></div>
        <div className="stat"><div className="lbl">Avg Interview Score</div><div className="val" style={{ color: "var(--green)" }}>{il || !stats ? "—" : `${stats.avg_score ?? 0}%`}</div><div className="sub">Across sessions</div></div>
      </div>

      <h2 className="bold mb-16" style={{ fontSize: 15 }}>All Modules</h2>
      <div className="g3 mb-24">
        {modules.map(m => (
          <Link key={m.to} to={m.to} style={{ textDecoration: "none" }}>
            <div className="card" style={{ cursor: "pointer", transition: "border-color .15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = m.c}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{m.icon}</div>
              <div className="bold sm mb-8">{m.label}</div>
              <div className="muted sm">{m.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {sessions.length > 0 && (
        <>
          <div className="fb mb-16"><h2 className="bold" style={{ fontSize: 15 }}>Recent Interview Sessions</h2><Link to="/interviews" className="btn btn-ghost btn-sm">View all →</Link></div>
          <div className="g2">
            {sessions.slice(0, 4).map(s => (
              <Link key={s._id} to={`/interviews/${s._id}`} style={{ textDecoration: "none" }}>
                <div className="card card-sm fc gap-12" style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--pink)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <span style={{ fontSize: 20 }}>🎤</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bold sm truncate">{s.career?.title || "General"}</div>
                    <div className="xs muted mt-8">{s.difficulty} · {new Date(s.conductedAt).toLocaleDateString("en-IN")}</div>
                  </div>
                  {s.totalScore != null && <span className={`badge ${s.totalScore >= 70 ? "b-green" : s.totalScore >= 40 ? "b-amber" : "b-red"}`}>{s.totalScore}%</span>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [pf, setPf]   = useState({ name: user?.name || "", avatarUrl: user?.avatarUrl || "" });
  const [pw, setPw]   = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSv] = useState(false);
  const [changingPw, setCh] = useState(false);
  const [pwe, setPwe] = useState({});

  const savePf = async e => {
    e.preventDefault(); setSv(true);
    try { const { data } = await authAPI.updateProfile(pf); updateUser(data.user); toast.success("Profile updated!"); }
    catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setSv(false); }
  };

  const savePw = async e => {
    e.preventDefault();
    const errs = {};
    if (!pw.currentPassword)              errs.cur = "Enter current password.";
    if (pw.newPassword.length < 8)        errs.new = "Min 8 characters.";
    else if (!/[A-Z]/.test(pw.newPassword)) errs.new = "Include uppercase.";
    else if (!/[0-9]/.test(pw.newPassword)) errs.new = "Include a number.";
    if (pw.newPassword !== pw.confirm)    errs.con = "Passwords don't match.";
    if (Object.keys(errs).length) { setPwe(errs); return; }
    setCh(true);
    try { await authAPI.changePassword(pw.currentPassword, pw.newPassword); toast.success("Password changed!"); setPw({ currentPassword: "", newPassword: "", confirm: "" }); setPwe({}); }
    catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setCh(false); }
  };

  return (
    <div className="page-sm">
      <div className="ph"><h1>My Profile</h1><p>Manage account information and security settings.</p></div>

      <div className="card mb-24 fc gap-16">
        <div className="avatar lg">{user?.name?.[0]?.toUpperCase()}</div>
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
          <div className="fg"><label>Full name</label><input className="input" value={pf.name} onChange={e => setPf(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="fg"><label>Email</label><input className="input" value={user?.email || ""} disabled /></div>
          <div className="fg"><label>Avatar URL <span className="muted">(optional)</span></label><input className="input" value={pf.avatarUrl} onChange={e => setPf(p => ({ ...p, avatarUrl: e.target.value }))} placeholder="https://..." /></div>
          <div className="fg"><label>Member since</label><input className="input" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"} disabled /></div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spin-sm" /> : "Save changes"}</button>
        </form>
      </div>

      <div className="card">
        <h3 className="bold mb-16">Change password</h3>
        <form onSubmit={savePw}>
          <div className="fg"><label>Current password</label><input className={`input${pwe.cur ? " err" : ""}`} type="password" value={pw.currentPassword} onChange={e => { setPw(p => ({ ...p, currentPassword: e.target.value })); setPwe(p => ({ ...p, cur: "" })); }} autoComplete="current-password" />{pwe.cur && <span className="xs" style={{ color: "var(--red)" }}>{pwe.cur}</span>}</div>
          <div className="fg"><label>New password</label><input className={`input${pwe.new ? " err" : ""}`} type="password" value={pw.newPassword} onChange={e => { setPw(p => ({ ...p, newPassword: e.target.value })); setPwe(p => ({ ...p, new: "" })); }} autoComplete="new-password" />{pwe.new && <span className="xs" style={{ color: "var(--red)" }}>{pwe.new}</span>}</div>
          <div className="fg"><label>Confirm password</label><input className={`input${pwe.con ? " err" : ""}`} type="password" value={pw.confirm} onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setPwe(p => ({ ...p, con: "" })); }} autoComplete="new-password" />{pwe.con && <span className="xs" style={{ color: "var(--red)" }}>{pwe.con}</span>}</div>
          <button type="submit" className="btn btn-primary" disabled={changingPw}>{changingPw ? <span className="spin-sm" /> : "Update password"}</button>
        </form>
      </div>
    </div>
  );
};
