import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'

// Map ProjectStatus to Zendesk tag values
const mapProjectStatusToZendeskTag = (status: ProjectStatus): string => {
  const statusMap: { [key in ProjectStatus]: string } = {
    'SUBMITTED': 'submitted',
    'QUEUED': 'queued',
    'IN_PROGRESS': 'in_progress',
    'REVIEW': 'review',
    'COMPLETE': 'complete'
  }
  return statusMap[status]
}

// Update Zendesk ticket status
async function updateZendeskStatus(ticketId: string, status: ProjectStatus) {
  const subdomain = process.env.ZENDESK_SUBDOMAIN
  const email = process.env.ZENDESK_EMAIL
  const apiToken = process.env.ZENDESK_API_TOKEN
  const statusFieldId = process.env.ZENDESK_FIELD_STATUS

  if (!subdomain || !email || !apiToken || !statusFieldId) {
    console.warn('Zendesk credentials not configured, skipping Zendesk update')
    return
  }

  const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64')
  const zendeskTag = mapProjectStatusToZendeskTag(status)

  try {
    const response = await fetch(
      `https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}.json`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          ticket: {
            custom_fields: [
              {
                id: parseInt(statusFieldId),
                value: zendeskTag
              }
            ]
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to update Zendesk ticket:', errorText)
    } else {
      console.log(`Successfully updated Zendesk ticket ${ticketId} to status: ${zendeskTag}`)
    }
  } catch (error) {
    console.error('Error updating Zendesk ticket:', error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, assignedTo, notes, estimatedCompletionDate } = body

    // Validate status
    if (!status || !Object.values(ProjectStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Get current project
    const currentProject = await prisma.project.findUnique({
      where: { id }
    })

    if (!currentProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo
    }

    if (estimatedCompletionDate !== undefined) {
      updateData.estimatedCompletionDate = estimatedCompletionDate ? new Date(estimatedCompletionDate) : null
    }

    // Set completedAt timestamp if moving to COMPLETE status
    if (status === 'COMPLETE' && currentProject.status !== 'COMPLETE') {
      updateData.completedAt = new Date()
    }

    // Handle queue position logic
    if (status === 'QUEUED') {
      // Assign queue position if moving to QUEUED status
      if (currentProject.status !== 'QUEUED') {
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
      // Clear queue position if moving out of QUEUED status
      if (currentProject.status === 'QUEUED' && currentProject.queuePosition !== null) {
        // Remove from queue and shift other positions down
        await prisma.project.updateMany({
          where: {
            status: 'QUEUED',
            queuePosition: {
              gt: currentProject.queuePosition
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

    // Update project with transaction to ensure consistency
    const [updatedProject] = await prisma.$transaction([
      prisma.project.update({
        where: { id },
        data: updateData
      }),
      // Create status history record
      prisma.statusHistory.create({
        data: {
          projectId: id,
          oldStatus: currentProject.status,
          newStatus: status,
          notes,
          createdAt: new Date()
        }
      })
    ])

    // Update Zendesk ticket if ticket ID exists
    // Zendesk will automatically send email to customer via trigger when status changes
    if (updatedProject.zendeskTicketId) {
      updateZendeskStatus(updatedProject.zendeskTicketId, status).catch(err => {
        console.error('Failed to sync status to Zendesk:', err)
      })
    }

    return NextResponse.json({
      success: true,
      project: updatedProject
    })
  } catch (error) {
    console.error('Error updating project status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
