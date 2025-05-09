"use client";
import React, { useState, createContext, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser, setAuthToken, getUserProfile } from "@/lib/apiService";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  roles: string[];
  // Add other profile fields as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to check for existing token
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = await getUserProfile();
      setUser(profileData.user || profileData); // Adjust based on API response structure
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      localStorage.removeItem("authToken");
      setAuthToken(null);
      setIsAuthenticated(false);
      setUser(null);
      // router.push("/login"); // Optionally redirect
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      fetchUserProfile().catch((err) => {
        console.error("Error during initial profile fetch:", err);
        localStorage.removeItem("authToken");
        setAuthToken(null);
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false); // Ensure loading is false if fetchUserProfile promise chain fails
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser(credentials);
      if (data.access_token) {
        localStorage.setItem("authToken", data.access_token);
        // setAuthToken is called within loginUser in apiService.ts
        await fetchUserProfile(); // Fetch profile after successful login
        if (user) { // Check if user profile was fetched successfully
            router.push("/"); // Redirect to dashboard or desired page
        } else {
            // Handle case where profile fetch failed after login, maybe stay on login or show error
            setError("Login successful, but failed to load user profile.");
            setIsLoading(false); // Ensure loading is false
        }
      } else {
        throw new Error("Login failed: No token received.");
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Login failed. Please check your credentials.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error && err.message !== "Login failed: No token received.") {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("authToken");
      setAuthToken(null);
      setIsLoading(false);
      throw err; // Re-throw to allow form to handle error display
    }
    // Removed setIsLoading(false) from here as fetchUserProfile has its own finally block
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout API call failed (if any):", err);
    } finally {
      localStorage.removeItem("authToken");
      setAuthToken(null);
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      setIsLoading(false);
      router.push("/login");
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, error, clearError }}>
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

