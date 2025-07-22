import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'psa-agent-frontend',
    timestamp: new Date().toISOString(),
    version: '0.2.0'
  })
} 