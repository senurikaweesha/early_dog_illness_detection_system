import React, { useEffect, useState, createContext } from "react";
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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          // Check if we have this user saved
          const usersRaw = localStorage.getItem("mockUsers");
          const users = usersRaw ? JSON.parse(usersRaw) : [];
          const existingUser = users.find(u => u.email === email);

          let loggedInUser;
          if (existingUser) {
            loggedInUser = existingUser;
          } else {
            // Fallback for demo logins
            const accountType = email.includes("vet") ? "vet" : "owner";
            const isVet = accountType === "vet";
            loggedInUser = {
              id: isVet ? "demo-vet-id" : "demo-owner-id",
              name: isVet ? "Dr. Veterinarian" : (email ? email.split('@')[0] : "User"),
              email,
              accountType,
            };
          }

          setUser(loggedInUser);
          localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
          localStorage.setItem("authToken", "mock-jwt-token-123");
          resolve();
        } else {
          reject(new Error("Invalid credentials"));
        }
        setLoading(false);
      }, 800);
    });
  };

  const signup = async (data) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          name: data.name,
          email: data.email,
          accountType: data.accountType,
        };

        // Save to mock database
        const usersRaw = localStorage.getItem("mockUsers");
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        users.push(newUser);
        localStorage.setItem("mockUsers", JSON.stringify(users));

        // Log them in
        setUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        localStorage.setItem("authToken", "mock-jwt-token-123");
        resolve();
        setLoading(false);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
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
