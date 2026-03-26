import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 9.99,
  yearly: 99 / 12,
}

export async function GET() {
  try {
    const supabase = createServiceClient()

    // 1. Active subscribers count
    const { count: activeSubscribers, error: activeSubscribersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    if (activeSubscribersError) {
      throw new Error(`Failed to fetch active subscribers: ${activeSubscribersError.message}`)
    }

    // 2. Total users count
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (totalUsersError) {
      throw new Error(`Failed to fetch total users: ${totalUsersError.message}`)
    }

    // 3. Active subscribers with plans for prize pool calc
    const { data: activePlans, error: activePlansError } = await supabase
      .from('users')
      .select('subscription_plan')
      .eq('subscription_status', 'active')

    if (activePlansError) {
      throw new Error(`Failed to fetch active plans: ${activePlansError.message}`)
    }

    const currentPrizePool = (activePlans || []).reduce((sum, u) => {
      return sum + (PLAN_AMOUNTS[u.subscription_plan || 'monthly'] || 9.99)
    }, 0) * 0.7

    // 4. Charity contributions totals
    const { data: contributions, error: contributionsError } = await supabase
      .from('charity_contributions')
      .select(`
        amount,
        charity:charities!charity_contributions_charity_id_fkey(name)
      `)

    if (contributionsError) {
      throw new Error(`Failed to fetch charity contributions: ${contributionsError.message}`)
    }

    const charityTotals: Record<string, number> = {}
    for (const c of contributions || []) {
      const charityName = (c.charity as { name?: string })?.name || 'Unknown'
      charityTotals[charityName] = (charityTotals[charityName] || 0) + Number(c.amount)
    }

    // 5. Draw history with win rates
    const { data: draws, error: drawsError } = await supabase
      .from('draws')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (drawsError) {
      throw new Error(`Failed to fetch draws: ${drawsError.message}`)
    }

    const { data: drawResults, error: drawResultsError } = await supabase
      .from('draw_results')
      .select('draw_id, match_type, prize_amount')

    if (drawResultsError) {
      throw new Error(`Failed to fetch draw results: ${drawResultsError.message}`)
    }

    const drawHistory = (draws || []).map((draw) => {
      const results = (drawResults || []).filter((r) => r.draw_id === draw.id)
      return {
        ...draw,
        totalWinners: results.length,
        totalPrizesPaid: results.reduce((s, r) => s + Number(r.prize_amount), 0),
        fiveMatchCount: results.filter((r) => r.match_type === '5').length,
        fourMatchCount: results.filter((r) => r.match_type === '4').length,
        threeMatchCount: results.filter((r) => r.match_type === '3').length,
      }
    })

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      currentPrizePool: Math.round(currentPrizePool * 100) / 100,
      charityTotals,
      drawHistory,
    })
  } catch (err: unknown) {
    console.error('Analytics error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
