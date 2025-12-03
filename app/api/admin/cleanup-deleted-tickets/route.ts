import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getZendeskTicketStatus } from '@/lib/zendesk'

/**
 * Cleanup endpoint to remove projects with deleted/closed/solved Zendesk tickets
 * This cleans up the database and resequences queue positions
 *
 * Usage: GET /api/admin/cleanup-deleted-tickets
 */
export async function GET() {
  try {
    console.log('Starting cleanup of deleted/closed/solved Zendesk tickets...')

    // Get all projects with Zendesk ticket IDs
    const allProjects = await prisma.project.findMany({
      where: {
        zendeskTicketId: {
          not: null
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`Found ${allProjects.length} projects with Zendesk tickets`)

    // Check each ticket's status in Zendesk
    const projectsToDelete: string[] = []
    const deletedTicketInfo: Array<{ name: string; event: string; ticketId: string; reason: string }> = []

    for (const project of allProjects) {
      if (!project.zendeskTicketId) continue

      const ticketStatus = await getZendeskTicketStatus(project.zendeskTicketId)

      // Mark for deletion if deleted, closed, or solved
      if (ticketStatus === 'deleted' || ticketStatus === 'closed' || ticketStatus === 'solved') {
        projectsToDelete.push(project.id)
        deletedTicketInfo.push({
          name: project.customerName,
          event: project.eventName,
          ticketId: project.zendeskTicketId,
          reason: ticketStatus || 'unknown'
        })
      }
    }

    console.log(`Found ${projectsToDelete.length} projects to delete`)

    // Delete marked projects from database
    if (projectsToDelete.length > 0) {
      await prisma.$transaction([
        // Delete status history first (foreign key constraint)
        prisma.statusHistory.deleteMany({
          where: {
            projectId: {
              in: projectsToDelete
            }
          }
        }),
        // Delete projects
        prisma.project.deleteMany({
          where: {
            id: {
              in: projectsToDelete
            }
          }
        })
      ])

      console.log(`✅ Deleted ${projectsToDelete.length} projects from database`)

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
    }

    // Get final queue state
    const finalQueuedProjects = await prisma.project.findMany({
      where: {
        status: 'QUEUED'
      },
      orderBy: {
        queuePosition: 'asc'
      },
      select: {
        customerName: true,
        eventName: true,
        queuePosition: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${projectsToDelete.length} projects with deleted/closed/solved Zendesk tickets`,
      deletedProjects: deletedTicketInfo,
      remainingQueue: finalQueuedProjects.map(p => ({
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
        error: 'Failed to cleanup deleted tickets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
