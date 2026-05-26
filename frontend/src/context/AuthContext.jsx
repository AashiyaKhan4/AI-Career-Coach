import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { authAPI } from "../api";

const Ctx = createContext(null);
const INIT = { user: null, isAuthenticated: false, isLoading: true, error: null };

function reducer(state, { type, payload }) {
  if (type === "SUCCESS")  return { ...state, user: payload, isAuthenticated: true,  isLoading: false, error: null };
  if (type === "FAIL")     return { ...state, user: null,    isAuthenticated: false, isLoading: false, error: payload };
  if (type === "LOGOUT")   return { ...state, user: null,    isAuthenticated: false, isLoading: false, error: null };
  if (type === "UPDATE")   return { ...state, user: { ...state.user, ...payload } };
  if (type === "LOADING")  return { ...state, isLoading: true };
  if (type === "CLR_ERR")  return { ...state, error: null };
  return state;
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { dispatch({ type: "FAIL", payload: null }); return; }
    authAPI.me()
      .then(({ data }) => dispatch({ type: "SUCCESS", payload: data.user }))
      .catch(() => { localStorage.removeItem("accessToken"); dispatch({ type: "FAIL", payload: null }); });
  }, []);

  const register = useCallback(async (name, email, password) => {
    dispatch({ type: "LOADING" });
    try {
      const { data } = await authAPI.register(name, email, password);
      localStorage.setItem("accessToken", data.accessToken);
      dispatch({ type: "SUCCESS", payload: data.user });
      return { ok: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Registration failed.";
      dispatch({ type: "FAIL", payload: msg });
      return { ok: false, msg };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: "LOADING" });
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem("accessToken", data.accessToken);
      dispatch({ type: "SUCCESS", payload: data.user });
      return { ok: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Invalid credentials.";
      dispatch({ type: "FAIL", payload: msg });
      return { ok: false, msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem("accessToken");
    dispatch({ type: "LOGOUT" });
  }, []);

  const updateUser = useCallback((u)  => dispatch({ type: "UPDATE",  payload: u }), []);
  const clearError = useCallback(()   => dispatch({ type: "CLR_ERR" }),              []);

  return (
    <Ctx.Provider value={{ ...state, register, login, logout, updateUser, clearError }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
