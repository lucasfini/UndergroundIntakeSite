import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getZendeskTicketStatus } from '@/lib/zendesk'

// GET all projects (with optional status filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { queuePosition: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    // Delete projects with deleted/closed/solved Zendesk tickets
    const projectsToDelete: string[] = []

    for (const project of projects) {
      // If project has a Zendesk ticket ID, check its status
      if (project.zendeskTicketId) {
        const ticketStatus = await getZendeskTicketStatus(project.zendeskTicketId)

        // Mark for deletion if deleted, closed, or solved
        if (ticketStatus === 'deleted' || ticketStatus === 'closed' || ticketStatus === 'solved') {
          projectsToDelete.push(project.id)
        }
      }
    }

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

      console.log(`Deleted ${projectsToDelete.length} projects with closed/solved/deleted Zendesk tickets`)

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
        console.log(`Resequenced ${queuedProjects.length} queued projects`)
      }
    }

    // Fetch updated projects list
    const updatedProjects = await prisma.project.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { queuePosition: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    return NextResponse.json({ projects: updatedProjects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Reorder queue positions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectIds } = body // Array of project IDs in desired order

    if (!Array.isArray(projectIds)) {
      return NextResponse.json(
        { error: 'projectIds must be an array' },
        { status: 400 }
      )
    }

    // Update queue positions in a transaction
    await prisma.$transaction(
      projectIds.map((projectId, index) =>
        prisma.project.update({
          where: { id: projectId },
          data: { queuePosition: index + 1 }
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Queue order updated'
    })
  } catch (error) {
    console.error('Error reordering queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
