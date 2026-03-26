import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function readRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is missing in environment variables`)
  }
  return value
}

function validateServiceKey(key: string) {
  const normalizedKey = key.trim()
  const upperKey = normalizedKey.toUpperCase()

  if (
    normalizedKey === 'your_service_role_key' ||
    upperKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY' ||
    normalizedKey.includes('placeholder') ||
    upperKey.startsWith('YOUR_')
  ) {
    throw new Error('SUPABASE_SERVICE_KEY is still a placeholder; set your Supabase service_role key in Vercel')
  }

  if (
    normalizedKey.startsWith('sb_publishable_') ||
    normalizedKey.startsWith('sb_anon_')
  ) {
    throw new Error('SUPABASE_SERVICE_KEY is using a public/anon key; use the Supabase service_role key instead')
  }
}

export function createServiceClient() {
  const supabaseUrl = readRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = readRequiredEnv('SUPABASE_SERVICE_KEY')

  validateServiceKey(serviceKey)

  return createSupabaseClient(supabaseUrl, serviceKey)
}

