'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// ---- Validation schema ----
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
    // Date must not be in the future (compare date-only, ignoring time)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return parsed <= today
  }, 'Date must not be in the future'),
})

export type AddScoreResult = {
  success: boolean
  error?: string
  data?: {
    id: string
    user_id: string
    score: number
    date: string
  }
}

/**
 * Server action: add a Stableford score for a user.
 *  - Validates score is between 1-45
 *  - Validates date is not in the future
 *  - The DB trigger automatically removes the oldest score if the user has > 5
 */
export async function addScore(
  userId: string,
  score: number,
  date: string
): Promise<AddScoreResult> {
  // Validate input
  const parsed = AddScoreSchema.safeParse({ userId, score, date })
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join('; '),

    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: parsed.data.userId,
      score: parsed.data.score,
      date: parsed.data.date,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
