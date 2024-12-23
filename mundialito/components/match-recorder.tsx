import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GroupStageMatch } from "@/types/tournament"

interface MatchRecorderProps {
  match: GroupStageMatch
  onUpdateMatch: (updatedMatch: GroupStageMatch) => void
  onComplete: () => void
  userName: string
  isEditable: boolean
}

export function MatchRecorder({ match, onUpdateMatch, onComplete, userName, isEditable }: MatchRecorderProps) {
  const [localMatch, setLocalMatch] = useState<GroupStageMatch>(match)

  const updateField = (field: keyof GroupStageMatch, value: string) => {
    setLocalMatch(prev => {
      const updated = { ...prev, [field]: value }
      if (field === "score1" || field === "score2") {
        const score1 = field === "score1" ? (parseInt(value) || 0) : prev.score1 || 0
        const score2 = field === "score2" ? (parseInt(value) || 0) : prev.score2 || 0
        if (!isNaN(score1) && !isNaN(score2)) {
          updated.winner = score1 > score2 ? updated.team1 : (score1 < score2 ? updated.team2 : "draw")
        }
      }
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting match:", localMatch);
    onUpdateMatch(localMatch)
    onComplete()
    setLocalMatch(match)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Match {match.position + 1} of 3</CardTitle>
        <CardDescription>
          {match.position === 0 ? "First" : match.position === 1 ? "Second" : "Third"} match in the group stage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" key={match.id}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">{userName}</span>
            <Input
              type="number"
              value={localMatch.score1 ?? ""}
              onChange={(e) => updateField("score1", e.target.value)}
              className="w-16 text-center"
              placeholder="Score"
              required
            />
            <span className="font-bold">vs</span>
            <Input
              type="number"
              value={localMatch.score2 ?? ""}
              onChange={(e) => updateField("score2", e.target.value)}
              className="w-16 text-center"
              placeholder="Score"
              required
            />
            <Input
              value={localMatch.team2}
              onChange={(e) => updateField("team2", e.target.value)}
              className="w-32 text-center"
              placeholder="Opponent"
              required
            />
          </div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <Input
            type="date"
            value={localMatch.date}
            onChange={(e) => updateField("date", e.target.value)}
            required
          />
          <label className="block text-sm font-medium text-gray-700 mt-4">Time</label>
          <Input
            type="time"
            value={localMatch.time}
            onChange={(e) => updateField("time", e.target.value)}
            required
          />
          <label className="block text-sm font-medium text-gray-700 mt-4">Location</label>
          <Input
            value={localMatch.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Location"
            required
          />
          <Button type="submit" className="w-full" disabled={!isEditable}>
            {isEditable ? "Save Match" : "Match Locked"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

