import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params

    // Find project by Zendesk ticket ID or submission ID
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { zendeskTicketId: ticketId },
          { submissionId: ticketId },
          { id: ticketId }
        ]
      },
      include: {
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Get last 10 status changes
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate queue info if in QUEUED status
    let queueInfo = null
    if (project.status === 'QUEUED') {
      const totalInQueue = await prisma.project.count({
        where: {
          status: 'QUEUED',
          queuePosition: {
            not: null
          }
        }
      })

      queueInfo = {
        position: project.queuePosition,
        totalInQueue
      }
    }

    // Return project data
    return NextResponse.json({
      project: {
        id: project.id,
        submissionId: project.submissionId,
        zendeskTicketId: project.zendeskTicketId,
        customerName: project.customerName,
        customerEmail: project.customerEmail,
        service: project.service,
        eventName: project.eventName,
        eventDate: project.eventDate,
        status: project.status,
        priority: project.priority,
        assignedTo: project.assignedTo,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        estimatedCompletionDate: project.estimatedCompletionDate,
        completedAt: project.completedAt,
        selectedPackageName: project.selectedPackageName,
        totalPrice: project.totalPrice
      },
      queueInfo,
      statusHistory: project.statusHistory
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
