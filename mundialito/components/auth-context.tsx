"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  name: string
  id: string
}

interface AuthContextType {
  user: User | null
  login: (name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Add this function to clear all localStorage
const clearAllData = () => {
  localStorage.removeItem("mundialito-user");
  localStorage.removeItem("tournament-data");
  localStorage.removeItem("completed-matches");
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Add event listener for page reload
    const handleBeforeUnload = () => {
      clearAllData();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Load user data
    const storedUser = localStorage.getItem("mundialito-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [])

  const login = (name: string) => {
    const user = { name, id: crypto.randomUUID() }
    localStorage.setItem("mundialito-user", JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    clearAllData();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

