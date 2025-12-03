import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

const pricingFilePath = join(process.cwd(), 'data', 'pricing.json')

export async function GET() {
  try {
    const data = await readFile(pricingFilePath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error('Error reading pricing data:', error)
    return NextResponse.json(
      { error: 'Failed to load pricing data' },
      { status: 500 }
    )
  }
}
