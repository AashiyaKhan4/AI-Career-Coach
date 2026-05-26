import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCareers, useRecommendations, useSkillGap, useUserSkills, useSkillCatalog } from "../../hooks";

// ── Careers ───────────────────────────────────────────────────────────────────
export const CareersPage = () => {
  const [tab, setTab]       = useState("browse");
  const [search, setSearch] = useState("");
  const { careers, loading: cl }          = useCareers();
  const { recs, loading: rl, refetch, save } = useRecommendations();

  const filtered = careers.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.industry?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="ph"><h1>Career Intelligence</h1><p>Explore careers and get AI-powered recommendations tailored to your profile.</p></div>

      <div className="fc gap-0 mb-24" style={{ borderBottom: "1px solid var(--border)" }}>
        {["browse", "recommendations"].map(t => (
          <button key={t} className="btn btn-ghost" onClick={() => setTab(t)}
            style={{ borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent", borderRadius: 0, paddingBottom: 10, color: tab === t ? "var(--primary)" : "var(--text2)" }}>
            {t === "browse" ? "🔍 Browse" : "🤖 AI Recommendations"}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <>
          <div className="fg mb-24"><input className="input" placeholder="🔍  Search careers or industries..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          {cl ? <div className="lc"><div className="spinner" /></div> :
            filtered.length === 0 ? <div className="empty"><div className="ei">🎯</div><p>No careers found.</p></div> :
            <div className="g3">{filtered.map(c => (
              <Link key={c._id} to={`/careers/${c._id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ cursor: "pointer", height: "100%" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--teal)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <div className="fb mb-12"><span className="badge b-teal">{c.industry}</span><span className="badge b-gray">{c.experienceLevel}</span></div>
                  <h3 className="bold sm mb-8">{c.title}</h3>
                  <p className="muted sm mb-12" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.description}</p>
                  <div className="fc gap-12 xs muted">
                    {c.avgSalaryUsd > 0 && <span>💰 ${c.avgSalaryUsd.toLocaleString()}/yr</span>}
                    {c.growthRate && <span>📈 {c.growthRate}</span>}
                  </div>
                </div>
              </Link>
            ))}</div>
          }
        </>
      )}

      {tab === "recommendations" && (
        <>
          <div className="fb mb-24"><p className="muted sm">AI analyses your skills and profile to find your best career matches.</p>
            <button className="btn btn-primary btn-sm" onClick={refetch} disabled={rl}>{rl ? <span className="spin-sm" /> : "🔄 Refresh"}</button>
          </div>
          {rl ? <div className="lc"><div className="spinner" /></div> :
            recs.filter(r => r.status !== "dismissed").length === 0 ?
            <div className="empty"><div className="ei">🤖</div><p>No recommendations yet. Fill in your skills first!</p></div> :
            <div className="g2">{recs.filter(r => r.status !== "dismissed").map(r => (
              <div key={r._id} className="card" style={{ border: "1px solid var(--primary)" }}>
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
            ))}</div>
          }
        </>
      )}
    </div>
  );
};

export const CareerDetailPage = () => {
  const id = window.location.pathname.split("/").pop();
  const { career, loading } = require("../../hooks").useCareer(id);
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
                {career.requiredSkills.map(rs => (
                  <span key={rs._id} className={`badge ${rs.isMandatory ? "b-blue" : "b-gray"}`}>{rs.skill?.name || "—"} {rs.isMandatory && "★"}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="fb mb-12"><h3 className="bold">Skill Gap Analysis</h3>
            <button className="btn btn-primary btn-sm" onClick={run} disabled={gl}>{gl ? <span className="spin-sm" /> : "🔍 Analyse"}</button>
          </div>
          {analysis ? (
            <>
              <div className="mb-16">
                <div className="fb mb-8"><span className="bold sm">Readiness</span><span className={`badge ${analysis.readinessScore >= 70 ? "b-green" : analysis.readinessScore >= 40 ? "b-amber" : "b-red"}`}>{analysis.readinessScore}%</span></div>
                <div className="pbar"><div className="pfill" style={{ width: `${analysis.readinessScore}%`, background: analysis.readinessScore >= 70 ? "var(--green)" : analysis.readinessScore >= 40 ? "var(--amber)" : "var(--red)" }} /></div>
              </div>
              {analysis.strongSkills?.length > 0 && <div className="mb-12"><div className="xs muted bold mb-8">✅ Your strengths</div><div className="fc gap-8 wrap">{analysis.strongSkills.map(s => <span key={s._id} className="badge b-green">{s.name}</span>)}</div></div>}
              {analysis.missingSkills?.length > 0 && <div><div className="xs muted bold mb-8">❌ Skills to develop</div><div className="fc gap-8 wrap">{analysis.missingSkills.map(s => <span key={s._id} className="badge b-red">{s.name}</span>)}</div></div>}
            </>
          ) : <p className="muted sm">Click Analyse to check your readiness for this career.</p>}
        </div>
      </div>
    </div>
  );
};

// ── Skills ────────────────────────────────────────────────────────────────────
const LEVELS = ["beginner", "elementary", "intermediate", "advanced", "expert"];
const lvlBadge = { beginner: "b-gray", elementary: "b-blue", intermediate: "b-teal", advanced: "b-purple", expert: "b-amber" };

export const SkillsPage = () => {
  const { skills, loading, add, update, remove } = useUserSkills();
  const { catalog, loading: cl }                  = useSkillCatalog();
  const [search, setSearch] = useState("");
  const [sel, setSel]       = useState("");
  const [lvl, setLvl]       = useState("beginner");
  const [adding, setAdding] = useState(false);

  const ownedIds = skills.map(s => s.skill?._id || s._id);
  const available = catalog.filter(s => !ownedIds.includes(s._id) && (!search || s.name.toLowerCase().includes(search.toLowerCase())));

  const handleAdd = async () => {
    if (!sel) return;
    setAdding(true);
    await add(sel, lvl);
    setSel(""); setLvl("beginner"); setSearch("");
    setAdding(false);
  };

  return (
    <div className="page">
      <div className="ph"><h1>My Skills</h1><p>Track your skills and proficiency levels — these power your career recommendations.</p></div>

      <div className="card mb-24">
        <h3 className="bold mb-16">Add a skill</h3>
        <div className="fc gap-12 wrap">
          <div style={{ flex: 2, minWidth: 150 }}><input className="input" placeholder="🔍 Search skill..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div style={{ flex: 2, minWidth: 150 }}>
            <select className="input" value={sel} onChange={e => setSel(e.target.value)} disabled={cl}>
              <option value="">-- Select skill --</option>
              {available.map(s => <option key={s._id} value={s._id}>{s.name} ({s.category})</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <select className="input" value={lvl} onChange={e => setLvl(e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!sel || adding}>{adding ? <span className="spin-sm" /> : "+ Add"}</button>
        </div>
      </div>

      {loading ? <div className="lc"><div className="spinner" /></div> :
        skills.length === 0 ? <div className="empty"><div className="ei">⚡</div><p>No skills yet. Add some above!</p></div> :
        <div className="g3">{skills.map(s => {
          const skillId = s.skill?._id || s._id;
          const name    = s.skill?.name || s.name || "—";
          const cat     = s.skill?.category;
          return (
            <div key={skillId} className="card card-sm">
              <div className="fb mb-8">
                <span className="bold sm">{name}</span>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)", padding: "2px 6px" }} onClick={() => remove(skillId)}>✕</button>
              </div>
              {cat && <div className="xs muted mb-12">{cat}</div>}
              <div className="fc gap-8 wrap">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => update(skillId, l)}
                    className={`badge ${s.proficiencyLevel === l ? lvlBadge[l] : "b-gray"}`}
                    style={{ cursor: "pointer", border: "none" }}>{l}</button>
                ))}
              </div>
            </div>
          );
        })}</div>
      }
    </div>
  );
};
