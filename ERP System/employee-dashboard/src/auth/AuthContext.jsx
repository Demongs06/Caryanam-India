import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  //  REAL-TIME JWT EXPIRY HANDLER
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      const expiryTime = decoded.exp * 1000; // convert seconds → ms
      const currentTime = Date.now();
      const timeLeft = expiryTime - currentTime;

      if (timeLeft <= 0) {
        logout();
      } else {
        const timer = setTimeout(() => {
          alert("Session expired. Please login again.");
          logout();
        }, timeLeft);

        return () => clearTimeout(timer);
      }
    } catch (err) {
      logout();
    }
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.post("/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      setAuth(res.data.user);

      return true;
    } catch (error) {
      console.error("Login failed:", error.response?.data);
      return false;
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};