import React, { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../api.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("gas_user");
    const token = sessionStorage.getItem("gas_token");
    if (savedUser && token) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const sendOTP = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      return res.ok;
    } catch { return false; }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, username: userData.email }),
      });
      const data = await response.json();
      if (response.ok || data.not_verified) {
        await sendOTP(userData.email); 
        return { success: true, email: userData.email, unverified: data.not_verified };
      }
      return { success: false, message: data.error || "SIGNUP FAILED" };
    } catch { return { success: false, message: "SERVER OFFLINE" }; }
  };

const verifyOTP = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.toString().trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        // FIXED: Removed setUser and sessionStorage logic to prevent "ghost login"[cite: 3]
        // This ensures Navbar/Sidebar icons stay hidden until the actual login occurs
        return { success: true };
      }
      return { success: false, message: data.error };
    } catch { 
      return { success: false, message: "VERIFICATION ERROR" }; 
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        const userData = { name: data.full_name, email: data.email, role: data.role, token: data.token };
        setUser(userData);
        sessionStorage.setItem("gas_user", JSON.stringify(userData));
        sessionStorage.setItem("gas_token", data.token);
        return { success: true };
      }
      return { success: false, message: data.error, not_verified: data.not_verified };
    } catch { return { success: false, message: "CONNECTION FAILED" }; }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.clear();
    toast.success("LOGGED OUT");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, verifyOTP, logout, loading, sendOTP }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};