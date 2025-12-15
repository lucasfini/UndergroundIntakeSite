import { NextRequest, NextResponse } from 'next/server'
import { createZendeskTicket, addZendeskPublicComment } from '@/lib/zendesk'
import prisma from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Get the highest queue position to assign the next one
    const maxQueuePosition = await prisma.project.findFirst({
      where: {
        status: 'QUEUED',
        queuePosition: { not: null }
      },
      orderBy: {
        queuePosition: 'desc'
      }
    })

    const nextQueuePosition = (maxQueuePosition?.queuePosition || 0) + 1

    // Create project in database first
    const project = await prisma.project.create({
      data: {
        submissionId: data.submissionId || `${Date.now()}`,
        customerName: data.name,
        customerEmail: data.email,
        customerPosition: data.position || null,
        service: data.service,
        eventName: data.eventName,
        eventDate: new Date(data.eventDate),
        eventTime: data.startTime || null,
        eventStartTime: data.startTime || null,
        eventEndTime: data.endTime || null,
        eventLocation: data.location || null,
        eventLink: data.link || null,
        collaborationDetails: data.collaborationDetails || null,
        visualReferenceLink: data.visualReferenceLink || null,
        content: data.content || '',
        callToAction: data.callToAction || null,
        additionalInfo: data.additionalInfo || null,
        selectedPackage: data.selectedPackage?.id || null,
        selectedPackageName: data.selectedPackage?.name || null,
        selectedPackagePrice: data.selectedPackage?.price || null,
        selectedAddOns: data.selectedAddOns ? JSON.stringify(data.selectedAddOns) : null,
        addOnQuantities: data.addOnQuantities ? JSON.stringify(data.addOnQuantities) : null,
        postersEnabled: data.postersEnabled !== undefined ? data.postersEnabled : null,
        totalPrice: data.totalPrice || 0,
        uploadedFiles: data.uploadedFiles ? JSON.stringify(data.uploadedFiles) : null,
        status: 'QUEUED', // Start in QUEUED status
        queuePosition: nextQueuePosition,
        priority: 'NORMAL'
      }
    })

    // Create initial status history
    await prisma.statusHistory.create({
      data: {
        projectId: project.id,
        oldStatus: null,
        newStatus: 'QUEUED',
        notes: 'Project submitted and added to queue'
      }
    })

    // Create Zendesk ticket (this sends the first automatic email)
    let ticketId: string | undefined
    let selectedAddOnNames: string[] = []

    try {
      // Load pricing data to convert add-on IDs to names
      if (data.selectedAddOns && data.selectedAddOns.length > 0) {
        try {
          const pricingPath = join(process.cwd(), 'data', 'pricing.json')
          const pricingData = JSON.parse(await readFile(pricingPath, 'utf-8'))

          selectedAddOnNames = data.selectedAddOns.map((id: string) => {
            const addOn = pricingData.addOns.find((a: any) => a.id === id)
            return addOn ? addOn.name : id // Fallback to ID if not found
          })
        } catch (error) {
          console.error('Error loading add-on names:', error)
          selectedAddOnNames = data.selectedAddOns // Fallback to IDs
        }
      }

      // Create data object with converted add-on names for Zendesk
      const zendeskData = {
        ...data,
        selectedAddOns: selectedAddOnNames
      }

      const zendeskResponse = await createZendeskTicket(zendeskData)
      ticketId = zendeskResponse.ticket?.id?.toString()
      console.log('Zendesk ticket created:', ticketId)

      // Update project with Zendesk ticket ID
      if (ticketId) {
        await prisma.project.update({
          where: { id: project.id },
          data: { zendeskTicketId: ticketId }
        })

        // Send detailed confirmation via Zendesk public comment (triggers email to customer)
        try {
          // Calculate add-ons total
          const packagePrice = data.selectedPackage?.price || 0
          const totalPrice = data.totalPrice || 0
          const addOnsTotal = totalPrice - packagePrice

          // Get turnaround time
          let turnaroundTime = 'N/A'
          if (data.selectedPackage?.id) {
            const pricingPath = join(process.cwd(), 'data', 'pricing.json')
            const pricingData = JSON.parse(await readFile(pricingPath, 'utf-8'))
            const pkg = pricingData.packages.find((p: any) => p.id === data.selectedPackage.id)
            if (pkg?.turnaround) {
              turnaroundTime = pkg.turnaround
            }
          }

          const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${ticketId}`

          const confirmationMessage = `
Thank you for your submission! Here are your project details:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PROJECT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎫 Tracking ID: #${ticketId}
📅 Turnaround Time: ${turnaroundTime}

🔗 Track Your Project: ${trackingUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PACKAGE SELECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.selectedPackage?.name || 'None'}

${selectedAddOnNames.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ ADD-ONS SELECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${selectedAddOnNames.map(name => `• ${name}`).join('\n')}

💰 Add-Ons Total: $${addOnsTotal.toFixed(2)}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Our team will review your request and begin working on it shortly. You'll receive updates as your project progresses.

If you have any questions, please reply to this email or contact us at ugprint@msu.mcmaster.ca.

Best regards,
Underground Media + Design Team
McMaster Student Union
          `.trim()

          await addZendeskPublicComment(ticketId, confirmationMessage)
          console.log('Detailed confirmation sent via Zendesk')
        } catch (error) {
          console.error('Failed to send confirmation via Zendesk:', error)
          // Non-critical, continue
        }
      }
    } catch (error) {
      console.error('Failed to create Zendesk ticket:', error)
      // Continue even if Zendesk fails - we don't want to block the user
    }

    return NextResponse.json({
      success: true,
      ticketId: ticketId || project.submissionId,
      trackingUrl: `/track/${ticketId || project.submissionId}`,
      queuePosition: nextQueuePosition,
      message: 'Request submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
      { status: 500 }
    )
  }
}
