"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [name, setName] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      login(name.trim())
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Welcome to Mundialito</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Start Tournament
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

