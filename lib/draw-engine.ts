/**
 * GolfGives Draw Engine
 *
 * Two modes:
 *   MODE 1 (Random):       Generate 5 random numbers 1-45, match against users' scores
 *   MODE 2 (Algorithmic):  Weight draw numbers by least-frequent scores across all active users
 *
 * Prize pool = SUM(active_subscribers × plan_amount × 0.7)   [30% to charity/ops]
 *   5-match → 40%
 *   4-match → 35%
 *   3-match → 25%
 *
 * If no 5-match winner: that 40% rolls over as jackpot_rollover on the draw.
 */

import { createServiceClient } from '@/lib/supabase/service'

// ── Types ─────────────────────────────────────────────────
export interface DrawConfig {
  month: number
  year: number
  drawType: 'random' | 'algorithmic'
  /** If 'simulate', results are NOT committed to DB */
  mode: 'simulate' | 'publish'
}

export interface MatchResult {
  userId: string
  userName: string
  userEmail: string
  matchedNumbers: number[]
  matchCount: 3 | 4 | 5
  prizeAmount: number
}

export interface DrawPreview {
  drawNumbers: number[]
  prizePool: number
  charityContribution: number
  jackpotRollover: number
  previousRollover: number
  winners: {
    fiveMatch: MatchResult[]
    fourMatch: MatchResult[]
    threeMatch: MatchResult[]
  }
  totalPrizesPaid: number
  noFiveMatchWinner: boolean
}

// ── Helpers ───────────────────────────────────────────────
const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 9.99,
  yearly: 99 / 12, // spread yearly across months
}

function getServiceSupabase() {
  return createServiceClient()
}

/** Generate N unique random integers in [min, max] */
function randomNumbers(n: number, min: number, max: number): number[] {
  const nums = new Set<number>()
  while (nums.size < n) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return Array.from(nums).sort((a, b) => a - b)
}

// ── MODE 2: Algorithmic draw numbers ─────────────────────
/**
 * Weight draw numbers by LEAST-frequent scores across all active users.
 * Numbers that appear less often are MORE likely to be drawn, making it
 * harder to win and building bigger jackpots.
 */
function algorithmicNumbers(
  allScores: { score: number }[]
): number[] {
  const freq = new Map<number, number>()
  for (let i = 1; i <= 45; i++) freq.set(i, 0)
  for (const s of allScores) {
    freq.set(s.score, (freq.get(s.score) || 0) + 1)
  }

  // Invert frequencies → higher weight for less common scores
  const maxFreq = Math.max(...freq.values(), 1)
  const weighted: { num: number; weight: number }[] = []
  for (const [num, count] of freq) {
    weighted.push({ num, weight: maxFreq - count + 1 })
  }

  // Weighted random selection of 5 unique numbers
  const selected: number[] = []
  const pool = [...weighted]
  for (let i = 0; i < 5; i++) {
    const totalWeight = pool.reduce((s, w) => s + w.weight, 0)
    let rand = Math.random() * totalWeight
    for (let j = 0; j < pool.length; j++) {
      rand -= pool[j].weight
      if (rand <= 0) {
        selected.push(pool[j].num)
        pool.splice(j, 1)
        break
      }
    }
  }

  return selected.sort((a, b) => a - b)
}

// ── Main Engine ──────────────────────────────────────────
export async function runDraw(config: DrawConfig): Promise<DrawPreview> {
  const supabase = getServiceSupabase()

  // 1. Get all active subscribers
  const { data: activeUsers, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, subscription_plan')
    .eq('subscription_status', 'active')

  if (usersError) throw new Error(`Failed to fetch users: ${usersError.message}`)
  if (!activeUsers || activeUsers.length === 0) {
    throw new Error('No active subscribers found')
  }

  // 2. Get all scores for active users
  const activeUserIds = activeUsers.map((u) => u.id)
  const { data: allScores, error: scoresError } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', activeUserIds)

  if (scoresError) throw new Error(`Failed to fetch scores: ${scoresError.message}`)

  // 3. Build per-user score arrays (only users with ≥3 scores are eligible)
  const userScoreMap = new Map<string, number[]>()
  for (const s of allScores || []) {
    const arr = userScoreMap.get(s.user_id) || []
    arr.push(s.score)
    userScoreMap.set(s.user_id, arr)
  }

  // 4. Generate draw numbers
  const drawNumbers =
    config.drawType === 'algorithmic'
      ? algorithmicNumbers(allScores || [])
      : randomNumbers(5, 1, 45)

  // 5. Calculate prize pool
  const totalMonthlyRevenue = activeUsers.reduce((sum, u) => {
    return sum + (PLAN_AMOUNTS[u.subscription_plan || 'monthly'] || 9.99)
  }, 0)

  const prizePool = totalMonthlyRevenue * 0.7
  const charityContribution = totalMonthlyRevenue * 0.3

  // 6. Get previous rollover from the draw record (if any)
  const { data: drawRecord } = await supabase
    .from('draws')
    .select('id, jackpot_rollover')
    .eq('month', config.month)
    .eq('year', config.year)
    .single()

  const previousRollover = drawRecord?.jackpot_rollover || 0

  // 7. Match users against draw numbers
  const fiveMatch: MatchResult[] = []
  const fourMatch: MatchResult[] = []
  const threeMatch: MatchResult[] = []

  for (const user of activeUsers) {
    const scores = userScoreMap.get(user.id)
    if (!scores || scores.length < 3) continue // Need at least 3 scores

    const uniqueScores = [...new Set(scores)]
    const matched = uniqueScores.filter((s) => drawNumbers.includes(s))

    if (matched.length >= 5) {
      fiveMatch.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        matchedNumbers: matched.slice(0, 5),
        matchCount: 5,
        prizeAmount: 0, // calculated below
      })
    } else if (matched.length === 4) {
      fourMatch.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        matchedNumbers: matched,
        matchCount: 4,
        prizeAmount: 0,
      })
    } else if (matched.length === 3) {
      threeMatch.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        matchedNumbers: matched,
        matchCount: 3,
        prizeAmount: 0,
      })
    }
  }

  // 8. Prize calculation
  const totalFivePool = prizePool * 0.4 + previousRollover
  const totalFourPool = prizePool * 0.35
  const totalThreePool = prizePool * 0.25

  let jackpotRollover = 0
  const noFiveMatchWinner = fiveMatch.length === 0

  if (fiveMatch.length > 0) {
    const perWinner = totalFivePool / fiveMatch.length
    fiveMatch.forEach((w) => (w.prizeAmount = Math.round(perWinner * 100) / 100))
  } else {
    // 40% + rollover rolls to next month
    jackpotRollover = totalFivePool
  }

  if (fourMatch.length > 0) {
    const perWinner = totalFourPool / fourMatch.length
    fourMatch.forEach((w) => (w.prizeAmount = Math.round(perWinner * 100) / 100))
  }

  if (threeMatch.length > 0) {
    const perWinner = totalThreePool / threeMatch.length
    threeMatch.forEach((w) => (w.prizeAmount = Math.round(perWinner * 100) / 100))
  }

  const totalPrizesPaid = [
    ...fiveMatch,
    ...fourMatch,
    ...threeMatch,
  ].reduce((s, w) => s + w.prizeAmount, 0)

  const preview: DrawPreview = {
    drawNumbers,
    prizePool,
    charityContribution,
    jackpotRollover,
    previousRollover,
    winners: { fiveMatch, fourMatch, threeMatch },
    totalPrizesPaid,
    noFiveMatchWinner,
  }

  // 9. If publishing, commit results to DB
  if (config.mode === 'publish') {
    await commitDraw(supabase, config, preview)
  }

  return preview
}

// ── Commit to DB ─────────────────────────────────────────
async function commitDraw(
  supabase: ReturnType<typeof getServiceSupabase>,
  config: DrawConfig,
  preview: DrawPreview
) {
  // Upsert the draw record
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .upsert(
      {
        month: config.month,
        year: config.year,
        status: 'published',
        draw_type: config.drawType,
        jackpot_rollover: 0, // reset after publish
      },
      { onConflict: 'month,year' }
    )
    .select()
    .single()

  if (drawError) throw new Error(`Failed to upsert draw: ${drawError.message}`)

  // Insert draw results for all winners
  const allWinners = [
    ...preview.winners.fiveMatch,
    ...preview.winners.fourMatch,
    ...preview.winners.threeMatch,
  ]

  if (allWinners.length > 0) {
    const { error: deleteExistingResultsError } = await supabase
      .from('draw_results')
      .delete()
      .eq('draw_id', draw.id)

    if (deleteExistingResultsError) {
      throw new Error(`Failed to clear existing results: ${deleteExistingResultsError.message}`)
    }

    const results = allWinners.map((w) => ({
      draw_id: draw.id,
      match_type: String(w.matchCount),
      winner_user_id: w.userId,
      prize_amount: w.prizeAmount,
      payment_status: 'pending',
    }))

    const { error: resultsError } = await supabase
      .from('draw_results')
      .insert(results)

    if (resultsError)
      throw new Error(`Failed to insert results: ${resultsError.message}`)
  }

  // If no 5-match winner, update NEXT month's draw with the rollover
  if (preview.noFiveMatchWinner && preview.jackpotRollover > 0) {
    const nextMonth = config.month === 12 ? 1 : config.month + 1
    const nextYear = config.month === 12 ? config.year + 1 : config.year

    await supabase
      .from('draws')
      .upsert(
        {
          month: nextMonth,
          year: nextYear,
          status: 'pending',
          draw_type: 'random',
          jackpot_rollover: preview.jackpotRollover,
        },
        { onConflict: 'month,year' }
      )
  }
}
