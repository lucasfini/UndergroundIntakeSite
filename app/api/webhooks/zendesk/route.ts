import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'

/**
 * Zendesk Webhook Endpoint
 *
 * This endpoint receives webhook notifications from Zendesk when custom Status field changes.
 *
 * To set up in Zendesk:
 * 1. Create custom field "Status" with dropdown values: Submitted, Queued, In Progress, Review, Complete
 * 2. Go to Admin > Apps and integrations > Webhooks
 * 3. Create a new webhook
 * 4. Set endpoint URL to: https://your-domain.com/api/webhooks/zendesk
 * 5. Set HTTP method to POST
 * 6. Add trigger for custom field "Status" changes
 *
 * Webhook payload example:
 * {
 *   "ticket_id": "123",
 *   "custom_status": "in_progress", // Custom field tag value
 *   "assignee_name": "John Doe",
 *   "updated_at": "2024-01-01T00:00:00Z"
 * }
 */

// Map Zendesk custom status field tags to our ProjectStatus enum
const mapZendeskStatusToProjectStatus = (zendeskStatus: string): ProjectStatus | null => {
  const statusMap: { [key: string]: ProjectStatus } = {
    'submitted': 'SUBMITTED',
    'queued': 'QUEUED',
    'in_progress': 'IN_PROGRESS',
    'review': 'REVIEW',
    'complete': 'COMPLETE'
  }

  return statusMap[zendeskStatus.toLowerCase().replace(/\s+/g, '_')] || null
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity (optional but recommended)
    // You can add authentication here using a secret token
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.ZENDESK_WEBHOOK_SECRET

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await request.json()
    const { ticket_id, custom_status, assignee_name, updated_at } = payload

    if (!ticket_id) {
      return NextResponse.json(
        { error: 'Missing ticket_id' },
        { status: 400 }
      )
    }

    // Find project by Zendesk ticket ID
    const project = await prisma.project.findFirst({
      where: {
        zendeskTicketId: ticket_id.toString()
      }
    })

    if (!project) {
      console.log(`Project not found for Zendesk ticket ID: ${ticket_id}`)
      return NextResponse.json(
        { message: 'Project not found, skipping update' },
        { status: 200 }
      )
    }

    // Map Zendesk custom status to our status
    const newStatus = custom_status ? mapZendeskStatusToProjectStatus(custom_status) : null

    if (!newStatus) {
      console.log(`Could not map Zendesk status "${custom_status}" to ProjectStatus`)
      return NextResponse.json(
        { message: 'Status not mapped, skipping update' },
        { status: 200 }
      )
    }

    // Only update if status has changed
    if (project.status === newStatus && project.assignedTo === assignee_name) {
      return NextResponse.json(
        { message: 'No changes detected' },
        { status: 200 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: updated_at ? new Date(updated_at) : new Date()
    }

    if (newStatus !== project.status) {
      updateData.status = newStatus

      // Handle queue position changes
      if (newStatus === 'QUEUED') {
        // Moving to QUEUED status - assign position
        if (project.status !== 'QUEUED') {
          const maxQueuePosition = await prisma.project.findFirst({
            where: {
              status: 'QUEUED',
              queuePosition: { not: null }
            },
            orderBy: {
              queuePosition: 'desc'
            }
          })
          updateData.queuePosition = (maxQueuePosition?.queuePosition || 0) + 1
        }
      } else {
        // Moving out of QUEUED status - clear position and shift others
        if (project.status === 'QUEUED' && project.queuePosition !== null) {
          await prisma.project.updateMany({
            where: {
              status: 'QUEUED',
              queuePosition: {
                gt: project.queuePosition
              }
            },
            data: {
              queuePosition: {
                decrement: 1
              }
            }
          })
        }
        updateData.queuePosition = null
      }

      // Set completion timestamp if moving to COMPLETE
      if (newStatus === 'COMPLETE' && project.status !== 'COMPLETE') {
        updateData.completedAt = new Date()
      }
    }

    if (assignee_name && assignee_name !== project.assignedTo) {
      updateData.assignedTo = assignee_name
    }

    // Update project with transaction
    await prisma.$transaction([
      prisma.project.update({
        where: { id: project.id },
        data: updateData
      }),
      // Create status history if status changed
      ...(newStatus !== project.status ? [
        prisma.statusHistory.create({
          data: {
            projectId: project.id,
            oldStatus: project.status,
            newStatus: newStatus,
            notes: 'Status updated via Zendesk webhook',
            changedBy: 'Zendesk Automation'
          }
        })
      ] : [])
    ])

    console.log(`Project ${project.id} updated from Zendesk webhook`)

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      projectId: project.id,
      newStatus
    })
  } catch (error) {
    console.error('Error processing Zendesk webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Zendesk webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
