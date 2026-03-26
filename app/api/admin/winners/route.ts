import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set - emails will be skipped')
    return null
  }

  return new Resend(process.env.RESEND_API_KEY)
}

// GET - fetch all draw results with user info
export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('draw_results')
      .select(`
        *,
        winner:users!draw_results_winner_user_id_fkey(id, name, email),
        draw:draws!draw_results_draw_id_fkey(id, month, year, status)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH - approve or reject a winner
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { resultId, action } = body as {
    resultId: string
    action: 'approve' | 'reject'
  }

  if (!resultId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { error: 'resultId and action (approve/reject) are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createServiceClient()

    const { data: result, error: fetchError } = await supabase
      .from('draw_results')
      .select(`
        *,
        winner:users!draw_results_winner_user_id_fkey(id, name, email)
      `)
      .eq('id', resultId)
      .single()

    if (fetchError || !result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    const newStatus = action === 'approve' ? 'paid' : 'rejected'

    const { error: updateError } = await supabase
      .from('draw_results')
      .update({ payment_status: newStatus })
      .eq('id', resultId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const resend = getResend()
    const winner = result.winner as { name: string; email: string } | null

    if (resend && winner?.email) {
      try {
        if (action === 'approve') {
          await resend.emails.send({
            from: 'GolfGives <noreply@golfgives.co.uk>',
            to: winner.email,
            subject: 'Your GolfGives prize has been approved',
            html: `
              <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #c9a84c;">Congratulations, ${winner.name}!</h1>
                <p>Your prize of <strong>&pound;${result.prize_amount}</strong> has been approved and marked as paid.</p>
                <p>Thank you for being part of GolfGives.</p>
                <hr style="border-color: #243824;" />
                <p style="color: #a0b0a0; font-size: 12px;">GolfGives - Play Golf. Change Lives.</p>
              </div>
            `,
          })
        } else {
          await resend.emails.send({
            from: 'GolfGives <noreply@golfgives.co.uk>',
            to: winner.email,
            subject: 'GolfGives prize update',
            html: `
              <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #f5f0e8;">Prize Update</h1>
                <p>Hi ${winner.name},</p>
                <p>Unfortunately, your prize claim for &pound;${result.prize_amount} could not be verified at this time.</p>
                <p>If you believe this is an error, please contact our support team.</p>
                <hr style="border-color: #243824;" />
                <p style="color: #a0b0a0; font-size: 12px;">GolfGives - Play Golf. Change Lives.</p>
              </div>
            `,
          })
        }
      } catch (emailError) {
        console.error('Email send error:', emailError)
      }
    }

    return NextResponse.json({ success: true, payment_status: newStatus })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
