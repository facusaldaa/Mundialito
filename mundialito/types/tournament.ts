export interface Match {
  id: string
  team1: string
  team2: string
  score1: number | null
  score2: number | null
  winner?: string
  round: string
  position: number
}

export interface GroupStageMatch extends Match {
  group: string
  date: string
  time: string
  location: string
}

export interface KnockoutStage {
  round: string
  matches: Match[]
}

export interface Tournament {
  groupStage: GroupStageMatch[]
  currentGroupMatch: number
  knockoutStages: KnockoutStage[]
}

