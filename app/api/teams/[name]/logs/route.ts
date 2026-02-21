import { NextResponse } from 'next/server'
import { readTeamLogs } from '@/lib/log-reader'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const logs = await readTeamLogs(name)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error(`Error reading logs:`, error)
    return NextResponse.json(
      { error: 'Failed to read logs', details: String(error) },
      { status: 500 }
    )
  }
}
