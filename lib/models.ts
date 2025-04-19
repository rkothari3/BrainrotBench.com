/**
 * Model data structure and utility functions
 */

export interface Model {
  id: string
  name: string
  eloRating: number
  wins: number
  losses: number
  ties: number
  totalVotes: number
}

// Initial models with ELO score of 1000
export const initialModels: Model[] = [
  { id: "gpt4o", name: "GPT-4o", eloRating: 1000, wins: 0, losses: 0, ties: 0, totalVotes: 0 },
  { id: "claude3", name: "Claude 3", eloRating: 1000, wins: 0, losses: 0, ties: 0, totalVotes: 0 },
  { id: "gemini", name: "Gemini Pro", eloRating: 1000, wins: 0, losses: 0, ties: 0, totalVotes: 0 },
  { id: "llama3", name: "Llama 3", eloRating: 1000, wins: 0, losses: 0, ties: 0, totalVotes: 0 },
  { id: "mistral", name: "Mistral Large", eloRating: 1000, wins: 0, losses: 0, ties: 0, totalVotes: 0 },
]

/**
 * Calculate win rate as a percentage
 */
export function calculateWinRate(model: Model): number {
  const totalMatches = model.wins + model.losses + model.ties
  if (totalMatches === 0) return 0

  // Count ties as half a win
  return ((model.wins + model.ties * 0.5) / totalMatches) * 100
}

/**
 * Get a descriptive rank based on ELO rating
 */
export function getRankFromRating(rating: number): string {
  if (rating < 800) return "Novice"
  if (rating < 1000) return "Beginner"
  if (rating < 1200) return "Intermediate"
  if (rating < 1400) return "Advanced"
  if (rating < 1600) return "Expert"
  if (rating < 1800) return "Master"
  return "Grandmaster"
}

/**
 * Select two random models for comparison
 */
export function selectRandomModels(models: Model[]): [Model, Model] {
  if (models.length < 2) {
    throw new Error("Not enough models for comparison")
  }

  const indexA = Math.floor(Math.random() * models.length)
  let indexB = Math.floor(Math.random() * (models.length - 1))
  if (indexB >= indexA) indexB++ // Ensure we don't select the same model twice

  return [models[indexA], models[indexB]]
}
