export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'
export type SubscriptionPlan = 'monthly' | 'yearly' | null
export type DrawStatus = 'pending' | 'simulated' | 'published'
export type DrawType = 'random' | 'algorithmic'
export type PaymentStatus = 'pending' | 'paid' | 'rejected'
export type MatchType = '3' | '4' | '5'

export interface User {
  id: string
  name: string
  email: string
  subscription_status: SubscriptionStatus
  subscription_plan: SubscriptionPlan
  charity_id: string | null
  charity_percentage: number
  stripe_customer_id: string | null
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  date: string
  created_at: string
}

export interface Draw {
  id: string
  month: number
  year: number
  status: DrawStatus
  draw_type: DrawType
  jackpot_rollover: number
  created_at: string
}

export interface DrawResult {
  id: string
  draw_id: string
  match_type: MatchType
  winner_user_id: string
  prize_amount: number
  payment_status: PaymentStatus
  winner?: User
  draw?: Draw
}

export interface Charity {
  id: string
  name: string
  description: string
  logo_url: string | null
  upcoming_event: string | null
  is_featured: boolean
  category: string
  created_at: string
}

export interface CharityContribution {
  id: string
  user_id: string
  charity_id: string
  amount: number
  date: string
}
