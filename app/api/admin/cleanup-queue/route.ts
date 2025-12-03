import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Cleanup endpoint to fix queue positions
 * This clears queue positions from non-QUEUED projects and resequences remaining queue
 *
 * Usage: GET /api/admin/cleanup-queue
 */
export async function GET() {
  try {
    console.log('Starting queue position cleanup...')

    // Update all non-QUEUED projects to have null queue positions
    const result = await prisma.project.updateMany({
      where: {
        status: {
          not: 'QUEUED'
        },
        queuePosition: {
          not: null
        }
      },
      data: {
        queuePosition: null
      }
    })

    console.log(`✅ Successfully cleared queue positions from ${result.count} projects`)

    // Resequence queue positions for remaining QUEUED projects
    const queuedProjects = await prisma.project.findMany({
      where: {
        status: 'QUEUED',
        queuePosition: { not: null }
      },
      orderBy: {
        queuePosition: 'asc'
      }
    })

    // Update queue positions to be sequential (1, 2, 3...)
    if (queuedProjects.length > 0) {
      await prisma.$transaction(
        queuedProjects.map((project, index) =>
          prisma.project.update({
            where: { id: project.id },
            data: { queuePosition: index + 1 }
          })
        )
      )
      console.log(`✅ Resequenced ${queuedProjects.length} queued projects`)
    }

    // Get final queue state
    const finalQueue = await prisma.project.findMany({
      where: {
        status: 'QUEUED'
      },
      orderBy: {
        queuePosition: 'asc'
      },
      select: {
        id: true,
        customerName: true,
        eventName: true,
        queuePosition: true,
        status: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.count} projects and resequenced ${queuedProjects.length} queued projects`,
      queuedProjects: finalQueue.map(p => ({
        name: p.customerName,
        event: p.eventName,
        queuePosition: p.queuePosition
      }))
    })

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup queue positions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
