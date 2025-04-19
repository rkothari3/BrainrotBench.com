/**
 * ELO Rating System Implementation
 *
 * The ELO rating system is a method for calculating the relative skill levels
 * of players in zero-sum games such as chess. Here we adapt it for AI model comparison.
 */

// K-factor determines how much ratings change after each match
// Higher K means more volatile ratings
const K_FACTOR = 32

/**
 * Calculate the expected score (win probability) for a player
 * @param ratingA - Rating of player A
 * @param ratingB - Rating of player B
 * @returns Expected score for player A (between 0 and 1)
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/**
 * Calculate new ELO rating
 * @param currentRating - Current rating of the player
 * @param expectedScore - Expected score for the player
 * @param actualScore - Actual score (1 for win, 0.5 for draw, 0 for loss)
 * @returns New rating
 */
export function calculateNewRating(currentRating: number, expectedScore: number, actualScore: number): number {
  return currentRating + K_FACTOR * (actualScore - expectedScore)
}

/**
 * Update ELO ratings for two players after a match
 * @param ratingA - Current rating of player A
 * @param ratingB - Current rating of player B
 * @param scoreA - Actual score for player A (1 for win, 0.5 for draw, 0 for loss)
 * @param scoreB - Actual score for player B (1 for win, 0.5 for draw, 0 for loss)
 * @returns Object containing new ratings for both players
 */
export function updateEloRatings(
  ratingA: number,
  ratingB: number,
  scoreA: number,
  scoreB: number,
): { newRatingA: number; newRatingB: number } {
  const expectedScoreA = calculateExpectedScore(ratingA, ratingB)
  const expectedScoreB = calculateExpectedScore(ratingB, ratingA)

  const newRatingA = calculateNewRating(ratingA, expectedScoreA, scoreA)
  const newRatingB = calculateNewRating(ratingB, expectedScoreB, scoreB)

  return { newRatingA, newRatingB }
}
