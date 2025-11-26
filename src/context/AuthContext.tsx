import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/services/firebase";
import { authAPI } from "@/services/api";
import socketService from "@/services/socket";
import type { User, AuthContextType, Role } from "@/types";
import toast from "react-hot-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Get user data from backend
            const response = await authAPI.getMe();
            setUser(response.data.user);

            // Connect to socket
            if (token) {
              socketService.connect(token);
            }
          } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
          }
        } else {
          setUser(null);
          socketService.disconnect();
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // Login to backend
      const response = await authAPI.login(email, password);

      // Store token
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);

      // Connect to socket
      socketService.connect(response.data.token);

      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role?: Role
  ) => {
    try {
      // Create Firebase user
      await createUserWithEmailAndPassword(auth, email, password);

      // Register in backend
      const response = await authAPI.register(email, password, name, role);

      // Store token
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);

      // Connect to socket
      socketService.connect(response.data.token);

      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      socketService.disconnect();
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
