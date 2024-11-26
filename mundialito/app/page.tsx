"use client"

import { useAuth } from "@/components/auth-context"
import { LoginForm } from "@/components/login-form"
import { TournamentBracket } from "@/components/tournament-bracket"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mundialito de {user.name}</h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
        <TournamentBracket userName={user.name} />
      </div>
    </div>
  )
}

