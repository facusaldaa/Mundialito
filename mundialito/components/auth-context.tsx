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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("mundialito-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (name: string) => {
    const user = { name, id: crypto.randomUUID() }
    localStorage.setItem("mundialito-user", JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("mundialito-user")
    setUser(null)
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

