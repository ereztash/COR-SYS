import { NextResponse } from 'next/server'
import { getDiagnosticConfig } from '@/lib/data/diagnostic-config'

export async function GET() {
  try {
    const config = await getDiagnosticConfig()
    return NextResponse.json(config)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed to load diagnostic config' },
      { status: 500 }
    )
  }
}
