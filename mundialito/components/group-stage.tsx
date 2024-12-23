"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GroupStageMatch } from "@/types/tournament"
import { MatchRecorder } from "@/components/match-recorder"
import { GroupStageResultPopup } from "@/components/group-stage-result-popup"

interface GroupStageProps {
  userMatches: GroupStageMatch[]
  currentMatch: number
  onUpdateMatches: (updatedMatches: GroupStageMatch[], currentMatch: number) => void
  onCompleteGroupStage: (advanced: boolean) => void
  userName: string
}

export function GroupStage({ userMatches, currentMatch, onUpdateMatches, onCompleteGroupStage, userName }: GroupStageProps) {
  const [localMatches, setLocalMatches] = useState<GroupStageMatch[]>(userMatches)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(currentMatch)
  const [showResultPopup, setShowResultPopup] = useState(false)
  const [advanced, setAdvanced] = useState(false)

  const updateMatch = (updatedMatch: GroupStageMatch) => {
    const newMatches = localMatches.map(match => 
      match.id === updatedMatch.id ? updatedMatch : match
    )
    setLocalMatches(newMatches)
    onUpdateMatches(newMatches, currentMatchIndex + 1)
  }

  const nextMatch = () => {
    if (currentMatchIndex < localMatches.length - 1) {
      setCurrentMatchIndex(prev => prev + 1)
    } else {
      checkAdvancement()
    }
  }

  const prevMatch = () => {
    if (currentMatchIndex > 0) {
      setCurrentMatchIndex(currentMatchIndex - 1)
    }
  }

  const checkAdvancement = () => {
    const wins = localMatches.filter(m => m.winner === userName).length
    const draws = localMatches.filter(m => m.winner === "draw").length
    const totalPoints = wins * 3 + draws;

    if (totalPoints >= 7) {
      setAdvanced(true);
      setShowResultPopup(true);
    } else {
      setAdvanced(false);
      setShowResultPopup(true);
    }
  }

  const closeResultPopup = () => {
    setShowResultPopup(false)
    onCompleteGroupStage(advanced)
  }

  const renderMatchSummary = (match: GroupStageMatch, index: number) => (
    <Card key={match.id} className="mb-4">
      <CardContent className="p-4">
        <h3 className="font-bold mb-2">Match {index + 1}</h3>
        <div className="flex justify-between items-center">
          <span>{userName}</span>
          <span>{match.score1} - {match.score2}</span>
          <span>{match.team2}</span>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {match.date} {match.time} at {match.location}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Fase de Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          {currentMatchIndex < localMatches.length ? (
            <MatchRecorder
              match={localMatches[currentMatchIndex]}
              onUpdateMatch={updateMatch}
              onComplete={nextMatch}
              userName={userName}
              isEditable={true}
            />
          ) : (
            localMatches.map((match, index) => renderMatchSummary(match, index))
          )}
          <div className="flex justify-between mt-4">
            <Button onClick={prevMatch} disabled={currentMatchIndex === 0}>Anterior</Button>
            <Button onClick={nextMatch} disabled={currentMatchIndex >= localMatches.length}>
              {currentMatchIndex < localMatches.length - 1 ? "Siguiente" : "Finalizar Fase de Grupos"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <GroupStageResultPopup
        isOpen={showResultPopup}
        onClose={closeResultPopup}
        advanced={advanced}
      />
    </div>
  )
}

