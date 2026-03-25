import React, { useEffect, useState, createContext } from "react";
import { login as loginAPI, register as registerAPI } from '../services/api';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to restore session on mount
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading check
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Call REAL backend API
      const response = await loginAPI(email, password);
      
      const loggedInUser = response.user;
      
      console.log("Backend login successful:", loggedInUser);
      
      // Store real user data from backend
      setUser(loggedInUser);
      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
      localStorage.setItem("authToken", response.token || "mock-jwt-token-123");
      
      setLoading(false);
      return loggedInUser;
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (data) => {
    setLoading(true);
    try {
      // Call REAL backend API
      const response = await registerAPI(data);
      
      const newUser = response.user;
      
      console.log("Registration successful:", newUser);
      
      // Store real user data from backend
      setUser(newUser);
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      localStorage.setItem("authToken", response.token || "mock-jwt-token-123");
      
      setLoading(false);
      return newUser;
    } catch (error) {
      setLoading(false);
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
    // Clean up old mock data
    localStorage.removeItem("mockUsers");
    localStorage.removeItem("dogOwnershipMap");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};