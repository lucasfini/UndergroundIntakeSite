interface ZendeskTicket {
  subject: string
  comment: {
    body: string
    uploads?: string[]
  }
  requester: {
    name: string
    email: string
  }
  custom_fields?: Array<{ id: number; value: string }>
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  tags?: string[]
}

interface ZendeskUploadResponse {
  upload: {
    token: string
    attachment: {
      id: number
      file_name: string
      content_url: string
      content_type: string
      size: number
    }
  }
}

async function uploadFileToZendesk(
  filePath: string,
  fileName: string,
  subdomain: string,
  auth: string
): Promise<string | null> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')

    // Read the file from the filesystem
    const fullPath = path.join(process.cwd(), 'public', filePath)
    const fileBuffer = await fs.readFile(fullPath)

    // Upload to Zendesk
    const uploadResponse = await fetch(
      `https://${subdomain}.zendesk.com/api/v2/uploads.json?filename=${encodeURIComponent(fileName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/binary',
          Authorization: `Basic ${auth}`,
        },
        body: fileBuffer,
      }
    )

    if (!uploadResponse.ok) {
      console.error(`Failed to upload ${fileName}:`, await uploadResponse.text())
      return null
    }

    const uploadData: ZendeskUploadResponse = await uploadResponse.json()
    return uploadData.upload.token
  } catch (error) {
    console.error(`Error uploading file ${fileName}:`, error)
    return null
  }
}

// Map form service values to Zendesk tag values
// Zendesk dropdown fields use TAGS, not display names
function getServiceZendeskTag(serviceValue: string): string {
  const serviceTagMap: { [key: string]: string } = {
    'avtek': 'avtek',
    'campus-events': 'campus_events',
    'cfmu': 'cfmu',
    'child-care-centre': 'child_care_centre',
    'diversity-equity-network': 'diversity___equity_network', // Note: triple underscore!
    'efrt': 'efrt',
    'food-collective-centre': 'food_collective_centre',
    'the-grind': 'the_grind',
    'hotspot': 'hotspot',
    'macademics': 'macademics',
    'maccess': 'maccess',
    'maroons': 'maroons',
    'ombuds': 'ombuds',
    'pride-community-centre': 'pride_community_centre',
    'shec': 'shec',
    'spark': 'spark',
    'swat': 'swat',
    'the-silhouette': 'the_silhouette',
    'twelve-eighty': 'twelve_eighty',
    'union-market': 'union_market',
    'wgen': 'wgen',
  }
  return serviceTagMap[serviceValue] || serviceValue
}

// Map form service values to display names (for ticket body readability)
function getServiceDisplayName(serviceValue: string): string {
  const serviceDisplayMap: { [key: string]: string } = {
    'avtek': 'Avtek',
    'campus-events': 'Campus Events',
    'cfmu': 'CFMU',
    'child-care-centre': 'Child Care Centre',
    'diversity-equity-network': 'Diversity + Equity Network',
    'efrt': 'EFRT',
    'food-collective-centre': 'Food Collective Centre',
    'the-grind': 'The Grind',
    'hotspot': 'HotSpot',
    'macademics': 'Macademics',
    'maccess': 'Maccess',
    'maroons': 'Maroons',
    'ombuds': 'Ombuds',
    'pride-community-centre': 'Pride Community Centre',
    'shec': 'SHEC',
    'spark': 'Spark',
    'swat': 'SWAT',
    'the-silhouette': 'The Silhouette',
    'twelve-eighty': 'Twelve Eighty',
    'union-market': 'Union Market',
    'wgen': 'WGEN',
  }
  return serviceDisplayMap[serviceValue] || serviceValue
}

export async function getZendeskTicketStatus(ticketId: string): Promise<string | null> {
  const subdomain = process.env.ZENDESK_SUBDOMAIN
  const email = process.env.ZENDESK_EMAIL
  const apiToken = process.env.ZENDESK_API_TOKEN

  if (!subdomain || !email || !apiToken) {
    console.error('Zendesk credentials not configured')
    return null
  }

  const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64')

  try {
    const response = await fetch(
      `https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}.json`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
      }
    )

    if (!response.ok) {
      // Ticket not found or deleted
      if (response.status === 404) {
        return 'deleted'
      }
      console.error(`Failed to fetch ticket ${ticketId}:`, response.status)
      return null
    }

    const data = await response.json()
    return data.ticket?.status || null
  } catch (error) {
    console.error(`Error fetching ticket ${ticketId}:`, error)
    return null
  }
}

export async function createZendeskTicket(data: any): Promise<any> {
  const subdomain = process.env.ZENDESK_SUBDOMAIN
  const email = process.env.ZENDESK_EMAIL
  const apiToken = process.env.ZENDESK_API_TOKEN

  if (!subdomain || !email || !apiToken) {
    throw new Error('Zendesk credentials not configured')
  }

  const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64')

  // Upload files to Zendesk if any exist
  const uploadTokens: string[] = []

  if (data.uploadedFiles) {
    const allFiles: Array<{ path: string; name: string }> = []

    // Collect logo files
    if (data.uploadedFiles.logos && Array.isArray(data.uploadedFiles.logos)) {
      data.uploadedFiles.logos.forEach((fileName: string) => {
        allFiles.push({
          path: `/uploads/${data.submissionId}/logo-${fileName}`,
          name: fileName,
        })
      })
    }

    // Collect attachment files
    if (data.uploadedFiles.attachments && Array.isArray(data.uploadedFiles.attachments)) {
      data.uploadedFiles.attachments.forEach((fileName: string) => {
        allFiles.push({
          path: `/uploads/${data.submissionId}/attachment-${fileName}`,
          name: fileName,
        })
      })
    }

    // Upload all files to Zendesk
    for (const file of allFiles) {
      const token = await uploadFileToZendesk(file.path, file.name, subdomain, auth)
      if (token) {
        uploadTokens.push(token)
      }
    }
  }

  // Format uploaded files section
  const totalFiles =
    (data.uploadedFiles?.logos?.length || 0) +
    (data.uploadedFiles?.attachments?.length || 0)

  const filesSection = totalFiles > 0 ? `

=== UPLOADED FILES ===
${totalFiles} file(s) attached to this ticket
${uploadTokens.length > 0 ? '(See attachments below)' : '(Upload failed - files saved locally at /uploads/' + data.submissionId + '/)'}
` : ''

  // Format the ticket body
  const ticketBody = `
New Project Request from ${data.name}

=== CONTACT INFORMATION ===
Service: ${getServiceDisplayName(data.service)}
Name: ${data.name}
Position: ${data.position || 'N/A'}
Email: ${data.email}

=== EVENT DETAILS ===
Event Name: ${data.eventName}
Date: ${data.eventDate}
Time: ${data.time || 'N/A'}
Location: ${data.location || 'N/A'}
Link: ${data.link || 'N/A'}
Canva Link: ${data.canvaLink || 'N/A'}

=== PROJECT DETAILS ===
Call to Action: ${data.callToAction || 'N/A'}

Content:
${data.content}

Additional Information:
${data.additionalInfo || 'N/A'}
${filesSection}
=== PACKAGE & PRICING ===
Selected Package: ${data.selectedPackage?.name || 'None'}
Package Price: $${data.selectedPackage?.price || 0}

Selected Add-Ons:
${
  data.selectedAddOns && data.selectedAddOns.length > 0
    ? data.selectedAddOns.join(', ')
    : 'None'
}

TOTAL ESTIMATED COST: $${data.totalPrice || 0}

---
Submitted via Underground Design Intake Portal
  `.trim()

  // Build custom fields array
  const customFields: Array<{ id: number; value: string }> = []

  // Add custom fields if configured
  const addCustomField = (envVar: string | undefined, value: any) => {
    if (envVar && value !== undefined && value !== null && value !== '') {
      const fieldId = parseInt(envVar)
      if (!isNaN(fieldId)) {
        customFields.push({ id: fieldId, value: String(value) })
      }
    }
  }

  // Map essential form data to custom fields (for sidebar display)
  addCustomField(process.env.ZENDESK_FIELD_SERVICE_TYPE, getServiceZendeskTag(data.service))
  addCustomField(process.env.ZENDESK_FIELD_SELECTED_PACKAGE, data.selectedPackage?.name)
  addCustomField(
    process.env.ZENDESK_FIELD_SELECTED_ADDONS,
    data.selectedAddOns && data.selectedAddOns.length > 0
      ? data.selectedAddOns.join('\n')
      : 'None'
  )
  addCustomField(process.env.ZENDESK_FIELD_TOTAL_PRICE, data.totalPrice)
  // Set initial status to "queued" (uses tag value, not display name)
  addCustomField(process.env.ZENDESK_FIELD_STATUS, 'queued')

  // Add date fields (format as YYYY-MM-DD for Zendesk date fields)
  if (data.eventDate) {
    // Format event date as YYYY-MM-DD
    const eventDate = new Date(data.eventDate)
    const formattedEventDate = eventDate.toISOString().split('T')[0]
    addCustomField(process.env.ZENDESK_FIELD_EVENT_DATE, formattedEventDate)
  }

  // Add submission date (current date)
  const submissionDate = new Date()
  const formattedSubmissionDate = submissionDate.toISOString().split('T')[0]
  addCustomField(process.env.ZENDESK_FIELD_SUBMISSION_DATE, formattedSubmissionDate)

  const ticket: ZendeskTicket = {
    subject: `Project Request: ${data.eventName} - ${data.name}`,
    comment: {
      body: ticketBody,
      uploads: uploadTokens.length > 0 ? uploadTokens : undefined,
    },
    requester: {
      name: data.name,
      email: data.email,
    },
    priority: 'normal',
    tags: ['intake-portal', 'project-request', getServiceZendeskTag(data.service)],
    custom_fields: customFields.length > 0 ? customFields : undefined,
  }

  const response = await fetch(`https://${subdomain}.zendesk.com/api/v2/tickets.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ ticket }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Zendesk API Error:', errorText)
    throw new Error(`Failed to create Zendesk ticket: ${response.status}`)
  }

  return response.json()
}
