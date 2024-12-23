"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Match, GroupStageMatch, KnockoutStage, Tournament } from "@/types/tournament"
import { MatchRecorder } from "@/components/match-recorder"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CoinFlipPopup } from "@/components/coin-flip-popup"

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
  const [showKnockout, setShowKnockout] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showCoinFlipExplanation, setShowCoinFlipExplanation] = useState(false);
  const [showCoinFlipResult, setShowCoinFlipResult] = useState(false);
  const [coinFlipWon, setCoinFlipWon] = useState(false);

  useEffect(() => {
    localStorage.setItem("tournament-data", JSON.stringify(tournament))
  }, [tournament])

  const completeGroupStage = (advanced: boolean) => {
    console.log("Group stage completed with matches:", tournament.groupStage);
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
      setShowKnockout(true);
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

  const resetTournament = () => {
    console.log("Resetting tournament to initial state");
    setTournament(() => ({
      groupStage: [
        { id: "A-1", team1: userName, team2: "", score1: null, score2: null, round: "group", position: 0, group: "A", date: "", time: "", location: "" },
        { id: "A-2", team1: userName, team2: "", score1: null, score2: null, round: "group", position: 1, group: "A", date: "", time: "", location: "" },
        { id: "A-3", team1: userName, team2: "", score1: null, score2: null, round: "group", position: 2, group: "A", date: "", time: "", location: "" },
      ],
      currentGroupMatch: 0,
      knockoutStages: []
    }));
    setCurrentMatchIndex(0);
    setShowResults(false);
    setShowKnockout(false);
    setShowCoinFlip(false);
    setIsGroupStageComplete(false);
  }

  const calculateGroupStageResult = (matches: GroupStageMatch[]): { points: number, needsCoinFlip: boolean } => {
    console.log("Calculating result for matches:", matches);
    let wins = 0;
    let draws = 0;

    matches.forEach(match => {
      console.log(`Checking match ${match.id}:`, match);
      if (match.score1 !== null && match.score2 !== null && match.team2) {
        const score1 = Number(match.score1);
        const score2 = Number(match.score2);
        console.log(`Match ${match.id} scores: ${score1} - ${score2}`);
        
        if (score1 > score2) {
          wins++;
          console.log(`Match ${match.id}: Win (+3 points)`);
        } else if (score1 === score2) {
          draws++;
          console.log(`Match ${match.id}: Draw (+1 point)`);
        }
      }
    });

    const points = (wins * 3) + draws;
    console.log(`Final tally: ${wins} wins (${wins * 3} points) + ${draws} draws (${draws} points) = ${points} total points`);
    return {
      points,
      needsCoinFlip: points === 4
    };
  };

  const [isGroupStageComplete, setIsGroupStageComplete] = useState(false);

  const handleMatchUpdate = (updatedMatch: GroupStageMatch) => {
    console.log("Updating match:", updatedMatch);
    const matchWithWinner = {
      ...updatedMatch,
      winner: updatedMatch.score1 !== null && updatedMatch.score2 !== null && updatedMatch.team2
        ? Number(updatedMatch.score1) > Number(updatedMatch.score2) 
          ? updatedMatch.team1 
          : Number(updatedMatch.score2) > Number(updatedMatch.score1)
            ? updatedMatch.team2 
            : "draw"
        : ""
    };
    
    setTournament(prev => {
      const newGroupStage = prev.groupStage.map(match => 
        match.id === matchWithWinner.id ? matchWithWinner : match
      );

      // Move to next match if current match is completed
      if (matchWithWinner.team2 && matchWithWinner.score1 !== null && matchWithWinner.score2 !== null) {
        const nextIndex = currentMatchIndex + 1;
        if (nextIndex < newGroupStage.length) {
          setCurrentMatchIndex(nextIndex);
        }
      }

      return {
        ...prev,
        groupStage: newGroupStage
      };
    });
  };

  const handleGroupStageComplete = () => {
    const result = calculateGroupStageResult(tournament.groupStage);
    console.log("Group stage completion - Points:", result.points);
    setIsGroupStageComplete(true);
    
    if (result.points >= 7) {
      console.log("Advanced directly with 7+ points");
      setShowKnockout(true);
      completeGroupStage(true);
    } else if (result.points === 4) {
      console.log("Showing coin flip explanation for 4 points");
      setShowCoinFlipExplanation(true);
    } else {
      console.log(`Eliminated with ${result.points} points`);
      resetTournament();
      setShowKnockout(false);
      completeGroupStage(false);
    }
  };

  const handleNext = () => {
    const nextIndex = currentMatchIndex + 1;
    if (nextIndex < tournament.groupStage.length) {
      setCurrentMatchIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentMatchIndex - 1;
    if (prevIndex >= 0) {
      setCurrentMatchIndex(prevIndex);
    }
  };

  // Add safety check for currentMatchIndex
  const safeCurrentMatch = Math.min(Math.max(0, currentMatchIndex), tournament.groupStage.length - 1);
  const currentMatch = tournament.groupStage[safeCurrentMatch];

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Button onClick={resetTournament}>Reiniciar Torneo</Button>
        <Button 
          variant="outline" 
          onClick={() => setShowResults(true)}
        >
          Ver Resultados
        </Button>
      </div>
      {tournament.knockoutStages.length === 0 || !showKnockout ? (
        !isGroupStageComplete ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">Fase de Grupos</h2>
            <div className="text-center text-sm text-gray-500">
              Partido {currentMatchIndex + 1} de {tournament.groupStage.length}
            </div>
            <MatchRecorder
              key={currentMatch.id}
              match={currentMatch}
              onUpdateMatch={handleMatchUpdate}
              onComplete={() => {}}
              userName={userName}
              isEditable={!isGroupStageComplete}
            />
            <div className="flex justify-between mt-4">
              <Button 
                onClick={handlePrevious}
                disabled={currentMatchIndex === 0}
                variant="outline"
              >
                Partido Anterior
              </Button>
              <Button 
                onClick={handleNext}
                disabled={currentMatchIndex === tournament.groupStage.length - 1}
                variant="outline"
              >
                Siguiente Partido
              </Button>
            </div>
            {currentMatchIndex === tournament.groupStage.length - 1 && (
              <Button 
                onClick={handleGroupStageComplete}
                className="w-full mt-4"
              >
                Finalizar Fase de Grupos
              </Button>
            )}
          </div>
        ) : null
      ) : (
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
      )}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultados del Torneo</DialogTitle>
            <DialogDescription>
              {(() => {
                const result = calculateGroupStageResult(tournament.groupStage);
                const wins = Math.floor(result.points / 3);
                const draws = result.points % 3;
                return `Total Puntos: ${result.points} (${wins} victorias, ${draws} empates)`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {tournament.groupStage
              .filter(match => match.team2 && match.score1 !== null && match.score2 !== null)
              .map(match => (
                <div key={match.id} className="flex justify-between items-center p-2 border rounded">
                  <div className="font-semibold">{match.team1}</div>
                  <div className="text-lg">
                    {match.score1 ?? '-'} - {match.score2 ?? '-'}
                  </div>
                  <div className="font-semibold">{match.team2 || 'TBD'}</div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showCoinFlipExplanation} onOpenChange={setShowCoinFlipExplanation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flip de Moneda Requerido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Has terminado la fase de grupos con 4 puntos.</p>
            <p>Según las reglas del torneo, esto significa que necesitas ganar un flip de moneda para avanzar a la fase de eliminatorias.</p>
            <p>Haz clic en continuar para proceder con el flip de moneda.</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setShowCoinFlipExplanation(false);
              setShowCoinFlip(true);
            }}>
              Continuar al Flip de Moneda
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <CoinFlipPopup 
        isOpen={showCoinFlip} 
        onOpenChange={setShowCoinFlip}
        onResult={(won) => {
          console.log("Coin flip result:", won);
          setShowCoinFlip(false);
          setCoinFlipWon(won);
          setShowCoinFlipResult(true);
        }}
      />
      <Dialog open={showCoinFlipResult} onOpenChange={setShowCoinFlipResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado del Flip de Moneda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-lg font-semibold text-center">
              {coinFlipWon ? "¡Ganaste el flip de moneda!" : "¡Perdiste el flip de moneda."}
            </p>
            <p className="text-center">
              {coinFlipWon 
                ? "¡Felicidades! Avanzaste a la fase de eliminatorias." 
                : "¡Lo siento! Tu viaje en el torneo termina aquí."}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setShowCoinFlipResult(false);
              if (coinFlipWon) {
                setShowKnockout(true);
                completeGroupStage(true);
              } else {
                resetTournament();
                setShowKnockout(false);
                completeGroupStage(false);
              }
            }}>
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

