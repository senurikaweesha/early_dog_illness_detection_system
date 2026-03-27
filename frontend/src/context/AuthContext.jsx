import React, { useEffect, useState, createContext } from "react";
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
      // Call Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;
      
      // Fetch user metadata from Firestore
      const docRef = doc(db, "users", loggedInUser.uid);
      const docSnap = await getDoc(docRef);
      
      let userData = {
        id: loggedInUser.uid,
        email: loggedInUser.email,
        name: "User",
        accountType: "owner"
      };

      if (docSnap.exists()) {
        userData = { ...userData, ...docSnap.data() };
      }
      
      console.log("Firebase login successful:", userData);
      
      // Store real user data from Firebase
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("authToken", loggedInUser.accessToken || "firebase-token");
      
      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (data) => {
    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;
      
      const userData = {
        id: newUser.uid,
        name: data.name,
        email: data.email,
        accountType: data.accountType,
      };

      // Save user metadata to Firestore
      await setDoc(doc(db, "users", newUser.uid), userData);
      
      console.log("Firebase Registration successful:", userData);
      
      // Store user data
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("authToken", newUser.accessToken || "firebase-token");
      
      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch(err) {
      console.error("Firebase signout error", err);
    }
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