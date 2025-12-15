import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Generate a unique submission ID
    const submissionId = Date.now().toString()

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', submissionId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Handle file uploads
    const attachmentFiles = formData.getAll('attachments') as File[]
    const visualReferenceFiles = formData.getAll('visualReferences') as File[]

    const uploadedAttachments: string[] = []
    const uploadedVisualReferences: string[] = []

    // Save visual reference files
    for (const file of visualReferenceFiles) {
      if (file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filePath = join(uploadDir, `visual-${file.name}`)
        await writeFile(filePath, buffer)
        uploadedVisualReferences.push(`/uploads/${submissionId}/visual-${file.name}`)
      }
    }

    // Save attachment files
    for (const file of attachmentFiles) {
      if (file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filePath = join(uploadDir, `attachment-${file.name}`)
        await writeFile(filePath, buffer)
        uploadedAttachments.push(`/uploads/${submissionId}/attachment-${file.name}`)
      }
    }

    // Store form data temporarily (you could use a database here)
    const formDataObj = {
      service: formData.get('service'),
      name: formData.get('name'),
      position: formData.get('position'),
      email: formData.get('email'),
      eventName: formData.get('eventName'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      eventDate: formData.get('eventDate'),
      location: formData.get('location'),
      link: formData.get('link'),
      collaborationDetails: formData.get('collaborationDetails'),
      hasVisualReferences: formData.get('hasVisualReferences'),
      visualReferenceLink: formData.get('visualReferenceLink'),
      callToAction: formData.get('callToAction'),
      content: formData.get('content'),
      additionalInfo: formData.get('additionalInfo'),
      uploadedVisualReferences,
      uploadedAttachments,
      submissionId,
    }

    return NextResponse.json({
      success: true,
      id: submissionId,
      message: 'Form data saved successfully',
    })
  } catch (error) {
    console.error('Error processing form submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}
