import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/admin/departments
 * Returns all allowed departments (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const departments = await prisma.allowedDepartment.findMany({
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ departments })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/departments
 * Creates a new allowed department
 * Body: { name: string, displayName?: string, createdBy?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, displayName, createdBy } = body

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      )
    }

    // Check for duplicates (case-insensitive)
    const existing = await prisma.allowedDepartment.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: `Department "${name}" already exists` },
        { status: 409 }
      )
    }

    // Create department
    const department = await prisma.allowedDepartment.create({
      data: {
        name: name.trim(),
        displayName: displayName?.trim() || null,
        createdBy: createdBy || null,
        isActive: true
      }
    })

    return NextResponse.json({ department }, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}
