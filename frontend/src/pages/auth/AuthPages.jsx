import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Field = ({ label, name, type = "text", value, onChange, error, placeholder, autoComplete, showToggle, onToggle, show }) => (
  <div className="fg">
    <label>{label}</label>
    <div className={showToggle ? "input-row" : ""}>
      <input className={`input${error ? " err" : ""}`} name={name} type={showToggle ? (show ? "text" : "password") : type}
        value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      {showToggle && <button type="button" className="ia" onClick={onToggle}>{show ? "Hide" : "Show"}</button>}
    </div>
    {error && <span className="xs" style={{ color: "var(--red)" }}>{error}</span>}
  </div>
);

export const LoginPage = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [fe, setFe] = useState({});
  const [showPw, setShow] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);
  useEffect(() => () => clearError(), []); // eslint-disable-line

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setFe(p => ({ ...p, [e.target.name]: "" })); clearError(); };

  const onSubmit = async e => {
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
          <Field label="Email address" name="email" type="email" value={form.email} onChange={onChange} error={fe.email} placeholder="you@example.com" autoComplete="email" />
          <Field label="Password" name="password" value={form.password} onChange={onChange} error={fe.password} placeholder="Your password" autoComplete="current-password" showToggle onToggle={() => setShow(p => !p)} show={showPw} />
          <button type="submit" className="btn btn-primary btn-full mt-8" disabled={isLoading}>
            {isLoading ? <span className="spin-sm" /> : "Sign in"}
          </button>
        </form>
        <p className="auth-foot">Don't have an account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fe, setFe] = useState({});
  const [showPw, setShow] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate("/dashboard", { replace: true }); }, [isAuthenticated]);
  useEffect(() => () => clearError(), []); // eslint-disable-line

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setFe(p => ({ ...p, [e.target.name]: "" })); clearError(); };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = "Name must be at least 2 characters.";
    if (!/\S+@\S+\.\S+/.test(form.email))          e.email = "Enter a valid email.";
    if (form.password.length < 8)                   e.password = "At least 8 characters.";
    else if (!/[A-Z]/.test(form.password))          e.password = "Include one uppercase letter.";
    else if (!/[0-9]/.test(form.password))          e.password = "Include one number.";
    return e;
  };

  const onSubmit = async e => {
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
          <Field label="Full name" name="name" value={form.name} onChange={onChange} error={fe.name} placeholder="Aarav Shah" autoComplete="name" />
          <Field label="Email address" name="email" type="email" value={form.email} onChange={onChange} error={fe.email} placeholder="you@example.com" autoComplete="email" />
          <Field label="Password" name="password" value={form.password} onChange={onChange} error={fe.password} placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" showToggle onToggle={() => setShow(p => !p)} show={showPw} />
          <button type="submit" className="btn btn-primary btn-full mt-8" disabled={isLoading}>
            {isLoading ? <span className="spin-sm" /> : "Create account"}
          </button>
        </form>
        <p className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};
