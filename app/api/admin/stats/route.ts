import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get total count
    const total = await prisma.project.count()

    // Get count by status
    const submitted = await prisma.project.count({
      where: { status: 'SUBMITTED' }
    })

    const queued = await prisma.project.count({
      where: { status: 'QUEUED' }
    })

    const inProgress = await prisma.project.count({
      where: { status: 'IN_PROGRESS' }
    })

    const review = await prisma.project.count({
      where: { status: 'REVIEW' }
    })

    const completed = await prisma.project.count({
      where: { status: 'COMPLETE' }
    })

    return NextResponse.json({
      total,
      submitted,
      queued,
      inProgress,
      review,
      completed,
    })
  } catch (error) {
    console.error('Error fetching project stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
