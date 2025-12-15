import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const configPath = path.join(process.cwd(), 'data', 'siteConfig.json')

export async function GET() {
  try {
    const fileContents = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(fileContents)
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error reading site config:', error)
    return NextResponse.json(
      { bannerMessage: 'We are open Monday - Friday | 10am - 4pm' },
      { status: 200 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    fs.writeFileSync(configPath, JSON.stringify(body, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating site config:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
