import { NextRequest, NextResponse } from 'next/server'
import { runDraw, DrawConfig } from '@/lib/draw-engine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { month, year, drawType, mode } = body as DrawConfig

    if (!month || !year || !drawType || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: month, year, drawType, mode' },
        { status: 400 }
      )
    }

    if (!['random', 'algorithmic'].includes(drawType)) {
      return NextResponse.json(
        { error: 'drawType must be "random" or "algorithmic"' },
        { status: 400 }
      )
    }

    if (!['simulate', 'publish'].includes(mode)) {
      return NextResponse.json(
        { error: 'mode must be "simulate" or "publish"' },
        { status: 400 }
      )
    }

    const result = await runDraw({ month, year, drawType, mode })

    return NextResponse.json({ success: true, data: result })
  } catch (err: unknown) {
    console.error('Draw engine error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
