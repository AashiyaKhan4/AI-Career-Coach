import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const NAV = [
  { to: "/dashboard",  icon: "🏠", label: "Dashboard" },
  { section: "Career" },
  { to: "/careers",    icon: "🎯", label: "Explore Careers" },
  { to: "/skills",     icon: "⚡", label: "My Skills" },
  { section: "Learning" },
  { to: "/roadmaps",   icon: "🗺️",  label: "Roadmaps" },
  { section: "Resume & Prep" },
  { to: "/resumes",    icon: "📄", label: "Resume Builder" },
  { to: "/interviews", icon: "🎤", label: "Interview Prep" },
  { section: "Account" },
  { to: "/profile",    icon: "👤", label: "Profile" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <h2>🎯 AI Career Coach</h2>
        <span>Your personal career guide</span>
      </div>
      <nav className="sb-nav">
        {NAV.map((item, i) =>
          item.section ? (
            <div key={i} className="sb-lbl">{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span style={{ width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>
      <div className="sb-foot">
        <div className="fc gap-12 mb-8" style={{ padding: "4px 10px" }}>
          <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="bold sm truncate">{user?.name}</div>
            <div className="xs muted">{user?.role}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm btn-full"
          style={{ justifyContent: "flex-start" }}
          onClick={logout}
        >
          🚪 Sign out
        </button>
      </div>
    </aside>
  );
}

export function AppLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="lc" style={{ height: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }
  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
}
