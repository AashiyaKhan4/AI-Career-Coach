import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider }   from "./context/AuthContext";
import { AppLayout, ProtectedRoute } from "./components/layout/AppLayout";

import {
  LoginPage, RegisterPage,
  DashboardPage, ProfilePage,
  CareersPage, CareerDetailPage, SkillsPage,
  RoadmapsPage, RoadmapDetailPage,
  ResumesPage, ResumeEditorPage,
  InterviewsPage, InterviewSessionPage,
} from "./pages/index";

import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e2535",
              color: "#e2e8f4",
              border: "1px solid #252d3f",
              fontSize: "13px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#1e2535" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#1e2535" } },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — all wrapped by sidebar layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"       element={<DashboardPage />} />
              <Route path="/profile"         element={<ProfilePage />} />
              <Route path="/careers"         element={<CareersPage />} />
              <Route path="/careers/:id"     element={<CareerDetailPage />} />
              <Route path="/skills"          element={<SkillsPage />} />
              <Route path="/roadmaps"        element={<RoadmapsPage />} />
              <Route path="/roadmaps/:id"    element={<RoadmapDetailPage />} />
              <Route path="/resumes"         element={<ResumesPage />} />
              <Route path="/resumes/:id"     element={<ResumeEditorPage />} />
              <Route path="/interviews"      element={<InterviewsPage />} />
              <Route path="/interviews/:id"  element={<InterviewSessionPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
