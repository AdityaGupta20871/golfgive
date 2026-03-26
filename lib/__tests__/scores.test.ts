/**
 * Unit tests for score validation & rolling-window logic.
 * These test the validation layer and simulate the DB trigger behaviour.
 *
 * Run:  npx vitest run lib/__tests__/scores.test.ts
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { z } from 'zod'

// ── Re-create the validation schema here for unit-testing
//    (Same logic as lib/actions/scores.ts but without server-only imports)
const AddScoreSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  score: z
    .number()
    .int('Score must be a whole number')
    .min(1, 'Score must be at least 1')
    .max(45, 'Score must be at most 45'),
  date: z.string().refine((val) => {
    const parsed = new Date(val)
    if (isNaN(parsed.getTime())) return false
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return parsed <= today
  }, 'Date must not be in the future'),
})

// ── Simulate the DB trigger behaviour ──
interface SimScore {
  id: string
  user_id: string
  score: number
  date: string
  created_at: string
}

let idCounter = 0
function makeId() {
  return `score-${++idCounter}`
}

/**
 * Simulates inserting a score and enforcing the max-5 rolling window.
 * Returns the scores array after insertion.
 */
function simulateInsert(
  scores: SimScore[],
  userId: string,
  score: number,
  date: string
): SimScore[] {
  const newScore: SimScore = {
    id: makeId(),
    user_id: userId,
    score,
    date,
    created_at: new Date().toISOString(),
  }
  const result = [...scores, newScore]

  const userScores = result.filter((s) => s.user_id === userId)
  if (userScores.length > 5) {
    // Sort by date ASC, then created_at ASC → delete first
    userScores.sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })
    const oldest = userScores[0]
    return result.filter((s) => s.id !== oldest.id)
  }
  return result
}

// ================ TESTS ================

describe('AddScore Validation', () => {
  const validUserId = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts valid score (1)', () => {
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: 1,
      date: '2026-01-15',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid score (45)', () => {
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: 45,
      date: '2026-01-15',
    })
    expect(result.success).toBe(true)
  })

  it('rejects score of 0', () => {
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: 0,
      date: '2026-01-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejects score of 46', () => {
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: 46,
      date: '2026-01-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative score', () => {
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: -5,
      date: '2026-01-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejects float score', () => {
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: 35.5,
      date: '2026-01-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejects future date', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: 36,
      date: futureDate.toISOString().split('T')[0],
    })
    expect(result.success).toBe(false)
  })

  it('accepts today', () => {
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: 36,
      date: new Date().toISOString().split('T')[0],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = AddScoreSchema.safeParse({
      userId: 'not-a-uuid',
      score: 36,
      date: '2026-01-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid date string', () => {
    const result = AddScoreSchema.safeParse({
      userId: validUserId,
      score: 36,
      date: 'not-a-date',
    })
    expect(result.success).toBe(false)
  })
})

describe('Rolling Window Logic (simulated DB trigger)', () => {
  const uid = 'user-1'

  beforeEach(() => {
    idCounter = 0
  })

  it('allows exactly 5 scores without deleting', () => {
    let scores: SimScore[] = []
    scores = simulateInsert(scores, uid, 30, '2026-01-01')
    scores = simulateInsert(scores, uid, 31, '2026-01-02')
    scores = simulateInsert(scores, uid, 32, '2026-01-03')
    scores = simulateInsert(scores, uid, 33, '2026-01-04')
    scores = simulateInsert(scores, uid, 34, '2026-01-05')
    expect(scores.length).toBe(5)
  })

  it('on 6th insert, deletes the score with the oldest date', () => {
    let scores: SimScore[] = []
    scores = simulateInsert(scores, uid, 30, '2026-01-01') // oldest by date
    scores = simulateInsert(scores, uid, 31, '2026-01-02')
    scores = simulateInsert(scores, uid, 32, '2026-01-03')
    scores = simulateInsert(scores, uid, 33, '2026-01-04')
    scores = simulateInsert(scores, uid, 34, '2026-01-05')
    scores = simulateInsert(scores, uid, 35, '2026-01-06') // 6th
    expect(scores.length).toBe(5)
    // The score with date 2026-01-01 should be gone
    expect(scores.some((s) => s.date === '2026-01-01')).toBe(false)
    // The newest score should exist
    expect(scores.some((s) => s.date === '2026-01-06')).toBe(true)
  })

  it('handles duplicate dates — deletes the one with earliest created_at', () => {
    let scores: SimScore[] = []
    scores = simulateInsert(scores, uid, 30, '2026-01-01') // same date, created first
    scores = simulateInsert(scores, uid, 31, '2026-01-01') // same date, created second
    scores = simulateInsert(scores, uid, 32, '2026-01-02')
    scores = simulateInsert(scores, uid, 33, '2026-01-03')
    scores = simulateInsert(scores, uid, 34, '2026-01-04')
    // 6th insert
    scores = simulateInsert(scores, uid, 35, '2026-01-05')
    expect(scores.length).toBe(5)
    // The first inserted score (id: score-1) should be gone because it has earliest created_at for the oldest date
    expect(scores.some((s) => s.id === 'score-1')).toBe(false)
    // The second score with the same date should still be there
    expect(scores.some((s) => s.id === 'score-2')).toBe(true)
  })

  it('does not affect other users when one user exceeds 5', () => {
    const uid2 = 'user-2'
    let scores: SimScore[] = []
    // User 1: 5 scores
    scores = simulateInsert(scores, uid, 30, '2026-01-01')
    scores = simulateInsert(scores, uid, 31, '2026-01-02')
    scores = simulateInsert(scores, uid, 32, '2026-01-03')
    scores = simulateInsert(scores, uid, 33, '2026-01-04')
    scores = simulateInsert(scores, uid, 34, '2026-01-05')
    // User 2: 2 scores
    scores = simulateInsert(scores, uid2, 40, '2026-01-01')
    scores = simulateInsert(scores, uid2, 41, '2026-01-02')
    // User 1: 6th score
    scores = simulateInsert(scores, uid, 35, '2026-01-06')

    const user1Scores = scores.filter((s) => s.user_id === uid)
    const user2Scores = scores.filter((s) => s.user_id === uid2)
    expect(user1Scores.length).toBe(5)
    expect(user2Scores.length).toBe(2)
  })

  it('handles repeated inserts beyond 6, always keeping latest 5', () => {
    let scores: SimScore[] = []
    for (let i = 1; i <= 10; i++) {
      scores = simulateInsert(scores, uid, 20 + i, `2026-01-${String(i).padStart(2, '0')}`)
    }
    const userScores = scores.filter((s) => s.user_id === uid)
    expect(userScores.length).toBe(5)
    // Should have dates 06 through 10
    const dates = userScores.map((s) => s.date).sort()
    expect(dates).toEqual([
      '2026-01-06',
      '2026-01-07',
      '2026-01-08',
      '2026-01-09',
      '2026-01-10',
    ])
  })
})
