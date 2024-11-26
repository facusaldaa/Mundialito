"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GroupStage } from "@/components/group-stage"
import { Match, GroupStageMatch, KnockoutStage, Tournament } from "@/types/tournament"

export function TournamentBracket({ userName }: { userName: string }) {
  const [tournament, setTournament] = useState<Tournament>(() => {
    const stored = localStorage.getItem("tournament-data")
    if (stored) return JSON.parse(stored)

    // Initialize group stage with only user's matches
    const userMatches: GroupStageMatch[] = [
      { id: "A-1", team1: userName, team2: "", score1: null, score2: null, round: "group", position: 0, group: "A", date: "", time: "", location: "" },
      { id: "A-2", team1: userName, team2: "", score1: null, score2: null, round: "group", position: 1, group: "A", date: "", time: "", location: "" },
      { id: "A-3", team1: userName, team2: "", score1: null, score2: null, round: "group", position: 2, group: "A", date: "", time: "", location: "" },
    ]

    return {
      groupStage: userMatches,
      currentGroupMatch: 0,
      knockoutStages: []
    }
  })

  useEffect(() => {
    localStorage.setItem("tournament-data", JSON.stringify(tournament))
  }, [tournament])

  const updateGroupMatches = (updatedMatches: GroupStageMatch[], currentMatch: number) => {
    setTournament(prev => ({
      ...prev,
      groupStage: updatedMatches,
      currentGroupMatch: currentMatch
    }))
  }

  const completeGroupStage = (advanced: boolean) => {
    if (advanced) {
      // User advances, simulate other group results and create knockout stages
      const knockoutTeams = [userName, "Team B1", "Team C1", "Team D1", "Team A2", "Team B2", "Team C2", "Team D2"]

      const quarterFinals: KnockoutStage = {
        round: "Quarter-finals",
        matches: []
      }

      for (let i = 0; i < knockoutTeams.length; i += 2) {
        quarterFinals.matches.push({
          id: `qf-${i/2}`,
          team1: knockoutTeams[i],
          team2: knockoutTeams[i+1],
          score1: null,
          score2: null,
          round: "Quarter-finals",
          position: i/2
        })
      }

      setTournament(prev => ({
        ...prev,
        knockoutStages: [quarterFinals]
      }))
    } else {
      // User doesn't advance, end the tournament
      setTournament(prev => ({
        ...prev,
        knockoutStages: [{
          round: "Tournament End",
          matches: [{
            id: "end",
            team1: userName,
            team2: "Did not advance",
            score1: null,
            score2: null,
            round: "Tournament End",
            position: 0
          }]
        }]
      }))
    }
  }

  const updateKnockoutMatch = (stageIndex: number, matchId: string, field: string, value: string) => {
    setTournament(prev => {
      const updatedStages = [...prev.knockoutStages]
      const stage = updatedStages[stageIndex]
      const matchIndex = stage.matches.findIndex(m => m.id === matchId)
      const match = { ...stage.matches[matchIndex] }

      if (field === "score1" || field === "score2") {
        match[field as "score1" | "score2"] = value === "" ? null : parseInt(value, 10)
      } else {
        match[field as keyof Match] = value as never;
      }

      if (match.score1 !== null && match.score2 !== null) {
        match.winner = match.score1 > match.score2 ? match.team1 : match.team2
        
        // Update next stage if it exists
        if (stageIndex < updatedStages.length - 1) {
          const nextStage = updatedStages[stageIndex + 1]
          const nextMatchIndex = Math.floor(matchIndex / 2)
          const isFirstMatch = matchIndex % 2 === 0
          
          if (nextMatchIndex < nextStage.matches.length) {
            const nextMatch = { ...nextStage.matches[nextMatchIndex] }
            if (isFirstMatch) {
              nextMatch.team1 = match.winner
            } else {
              nextMatch.team2 = match.winner
            }
            nextStage.matches[nextMatchIndex] = nextMatch
          }
        }
        // If it's the final match of the current stage, create the next stage
        else if (matchIndex === stage.matches.length - 1 && stage.round !== "Final") {
          const nextStageName = getNextStageName(stage.round)
          if (nextStageName) {
            const nextStage: KnockoutStage = {
              round: nextStageName,
              matches: Array(stage.matches.length / 2).fill(null).map((_, i) => ({
                id: `${nextStageName.toLowerCase().replace(/\s+/g, '-')}-${i}`,
                team1: "",
                team2: "",
                score1: null,
                score2: null,
                round: nextStageName,
                position: i
              }))
            }
            updatedStages.push(nextStage)
          }
        }
      }

      stage.matches[matchIndex] = match
      return { ...prev, knockoutStages: updatedStages }
    })
  }

  const getNextStageName = (currentStage: string): string | null => {
    const stages = ["Quarter-finals", "Semi-finals", "Final"]
    const currentIndex = stages.indexOf(currentStage)
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null
  }

  const renderKnockoutMatch = (match: Match, stageIndex: number) => (
    <Card key={match.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold w-24 text-right">{match.team1}</span>
            <Input
              type="number"
              value={match.score1 ?? ""}
              onChange={(e) => updateKnockoutMatch(stageIndex, match.id, "score1", e.target.value)}
              className="w-16 text-center"
              aria-label={`${match.team1}'s score`}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold w-24 text-right">{match.team2}</span>
            <Input
              type="number"
              value={match.score2 ?? ""}
              onChange={(e) => updateKnockoutMatch(stageIndex, match.id, "score2", e.target.value)}
              className="w-16 text-center"
              aria-label={`${match.team2}'s score`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const resetToGroupStage = () => {
    setTournament(prev => ({
      ...prev,
      knockoutStages: []
    }))
  }

  return (
    <div className="space-y-8">
      {tournament.knockoutStages.length === 0 ? (
        <GroupStage
          userMatches={tournament.groupStage}
          currentMatch={tournament.currentGroupMatch}
          onUpdateMatches={updateGroupMatches}
          onCompleteGroupStage={completeGroupStage}
          userName={userName}
        />
      ) : (
        <>
          <Button onClick={resetToGroupStage}>Back to Group Stage</Button>
          <div className="flex flex-wrap gap-8 justify-center">
            {tournament.knockoutStages.map((stage, stageIndex) => (
              <Card key={stage.round} className="w-64">
                <CardHeader>
                  <CardTitle className="text-center">{stage.round}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {stage.matches.map(match => renderKnockoutMatch(match, stageIndex))}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

