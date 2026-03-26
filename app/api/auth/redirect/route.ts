import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ redirectTo: '/login' }, { status: 401 })
  }

  const adminEmails = getAdminEmails()
  const userEmail = (user.email || '').toLowerCase()
  const redirectTo = adminEmails.length > 0 && adminEmails.includes(userEmail)
    ? '/admin'
    : '/dashboard'

  return NextResponse.json({ redirectTo })
}
