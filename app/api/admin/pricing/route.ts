import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
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

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate the data structure
    if (!data.packages || !data.addOns) {
      return NextResponse.json(
        { error: 'Invalid pricing data structure' },
        { status: 400 }
      )
    }

    // Write to file
    await writeFile(pricingFilePath, JSON.stringify(data, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating pricing data:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing data' },
      { status: 500 }
    )
  }
}
