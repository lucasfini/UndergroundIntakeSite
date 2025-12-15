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
    console.log(`Reading file from: ${fullPath}`)

    const fileBuffer = await fs.readFile(fullPath)
    console.log(`File read successfully, size: ${fileBuffer.length} bytes`)

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
      const errorText = await uploadResponse.text()
      console.error(`Failed to upload ${fileName} (${uploadResponse.status}):`, errorText)
      return null
    }

    const uploadData: ZendeskUploadResponse = await uploadResponse.json()
    console.log(`Upload successful, token: ${uploadData.upload.token}`)
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
    'first-year-council': 'first_year_council',
    'food-collective-centre': 'food_collective_centre',
    'the-grind': 'the_grind',
    'hotspot': 'hotspot',
    'macademics': 'macademics',
    'maccess': 'maccess',
    'maroons': 'maroons',
    'ombuds': 'ombuds',
    'pride': 'pride',
    'pride-community-centre': 'pride_community_centre',
    'shec': 'shec',
    'spark': 'spark',
    'swat': 'swat',
    'swhat': 'swhat',
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
    'first-year-council': 'First Year Council',
    'food-collective-centre': 'Food Collective Centre',
    'the-grind': 'The Grind',
    'hotspot': 'HotSpot',
    'macademics': 'Macademics',
    'maccess': 'Maccess',
    'maroons': 'Maroons',
    'ombuds': 'Ombuds',
    'pride': 'Pride',
    'pride-community-centre': 'Pride Community Centre',
    'shec': 'SHEC',
    'spark': 'Spark',
    'swat': 'SWAT',
    'swhat': 'SWHAT',
    'the-silhouette': 'The Silhouette',
    'twelve-eighty': 'Twelve Eighty',
    'union-market': 'Union Market',
    'wgen': 'WGEN',
  }
  return serviceDisplayMap[serviceValue] || serviceValue
}

export async function addZendeskPublicComment(ticketId: string, comment: string): Promise<boolean> {
  const subdomain = process.env.ZENDESK_SUBDOMAIN
  const email = process.env.ZENDESK_EMAIL
  const apiToken = process.env.ZENDESK_API_TOKEN

  if (!subdomain || !email || !apiToken) {
    console.error('Zendesk credentials not configured')
    return false
  }

  const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64')

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
            comment: {
              body: comment,
              public: true // Public comment - will send email to requester
            }
          }
        })
      }
    )

    if (!response.ok) {
      console.error(`Failed to add public comment to ticket ${ticketId}:`, response.status)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error adding public comment to ticket ${ticketId}:`, error)
    return false
  }
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

  // Load pricing data for add-on details and turnaround times
  let pricingData: any = null
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const pricingPath = path.join(process.cwd(), 'data', 'pricing.json')
    pricingData = JSON.parse(await fs.readFile(pricingPath, 'utf-8'))
  } catch (error) {
    console.error('Error loading pricing data:', error)
  }

  // Calculate rave cards price based on quantity
  const calculateRaveCardsPrice = (quantity: number): number => {
    if (quantity <= 100) return 20
    const additionalCards = quantity - 100
    const increments = Math.ceil(additionalCards / 50)
    return 20 + (increments * 10)
  }

  // Upload files to Zendesk if any exist
  const uploadTokens: string[] = []

  if (data.uploadedFiles) {
    const allFiles: Array<{ path: string; name: string }> = []

    // Collect visual reference files
    if (data.uploadedFiles.visualReferences && Array.isArray(data.uploadedFiles.visualReferences)) {
      data.uploadedFiles.visualReferences.forEach((fileName: string) => {
        allFiles.push({
          path: `/uploads/${data.submissionId}/visual-${fileName}`,
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

    console.log('Files to upload to Zendesk:', {
      totalFiles: allFiles.length,
      visualReferences: data.uploadedFiles.visualReferences?.length || 0,
      attachments: data.uploadedFiles.attachments?.length || 0,
      files: allFiles
    })

    // Upload all files to Zendesk
    for (const file of allFiles) {
      console.log(`Uploading file to Zendesk: ${file.path}`)
      const token = await uploadFileToZendesk(file.path, file.name, subdomain, auth)
      if (token) {
        console.log(`Successfully uploaded: ${file.name}`)
        uploadTokens.push(token)
      } else {
        console.error(`Failed to upload: ${file.name}`)
      }
    }

    console.log(`Total upload tokens received: ${uploadTokens.length}`)
  }

  // Format uploaded files section
  const totalFiles =
    (data.uploadedFiles?.visualReferences?.length || 0) +
    (data.uploadedFiles?.attachments?.length || 0)

  const filesSection = totalFiles > 0 ? `

=== UPLOADED FILES ===
${totalFiles} file(s) attached to this ticket
${uploadTokens.length > 0 ? '(See attachments below)' : '(Upload failed - files saved locally at /uploads/' + data.submissionId + '/)'}
` : ''

  // Format add-ons with prices
  let addOnsSection = 'None'
  let addOnsTotal = 0

  if (data.selectedAddOns && data.selectedAddOns.length > 0 && pricingData) {
    const addOnDetails: string[] = []

    data.selectedAddOns.forEach((addOnName: string) => {
      const addOn = pricingData.addOns.find((a: any) => a.name === addOnName)
      if (addOn) {
        const quantity = data.addOnQuantities?.[addOn.id] || (addOn.id === 'rave-cards' ? 100 : 1)
        let price = 0

        if (addOn.id === 'rave-cards') {
          price = calculateRaveCardsPrice(quantity)
        } else if (typeof addOn.price === 'number') {
          price = addOn.price * quantity
        }

        addOnsTotal += price

        if (quantity > 1) {
          addOnDetails.push(`- ${addOnName} (×${quantity}): $${price.toFixed(2)}`)
        } else {
          addOnDetails.push(`- ${addOnName}: $${price.toFixed(2)}`)
        }
      } else {
        addOnDetails.push(`- ${addOnName}`)
      }
    })

    addOnsSection = addOnDetails.join('\n')
  }

  // Get turnaround time from package
  let turnaroundTime = 'N/A'
  if (data.selectedPackage?.id && pricingData) {
    const pkg = pricingData.packages.find((p: any) => p.id === data.selectedPackage.id)
    if (pkg?.turnaround) {
      turnaroundTime = pkg.turnaround
    }
  }

  // Format the ticket body
  const ticketBody = `
New Project Request from ${data.name}

TURNAROUND TIME: ${turnaroundTime}

=== CONTACT INFORMATION ===
Service: ${getServiceDisplayName(data.service)}
Name: ${data.name}
Position: ${data.position || 'N/A'}
Email: ${data.email}

=== EVENT DETAILS ===
Event Name: ${data.eventName}
Date: ${data.eventDate}
Start Time: ${data.startTime || 'N/A'}
End Time: ${data.endTime || 'N/A'}
Location: ${data.location || 'N/A'}
Link: ${data.link || 'N/A'}

Collaboration Details:
${data.collaborationDetails || 'N/A'}

=== VISUAL REFERENCES ===
Design Link (Canva/Figma): ${data.visualReferenceLink || 'N/A'}

=== PROJECT DETAILS ===
Call to Action: ${data.callToAction || 'N/A'}

Content:
${data.content}

Additional Information:
${data.additionalInfo || 'N/A'}
${filesSection}
=== PACKAGE & ADD-ONS ===
Selected Package: ${data.selectedPackage?.name || 'None'}
${
  data.selectedPackage?.id === 'one-time-event'
    ? `Posters (11x17): ${data.postersEnabled !== false ? 'Included (45 posters)' : 'Not included'}`
    : ''
}

Add-Ons Selected:
${addOnsSection}
${addOnsTotal > 0 ? `\nAdd-Ons Total: $${addOnsTotal.toFixed(2)}` : ''}

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
  const serviceTag = getServiceZendeskTag(data.service)
  console.log('Service Type Debugging:', {
    originalService: data.service,
    mappedTag: serviceTag,
    fieldId: process.env.ZENDESK_FIELD_SERVICE_TYPE
  })
  addCustomField(process.env.ZENDESK_FIELD_SERVICE_TYPE, serviceTag)
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

  console.log('Zendesk Custom Fields:', JSON.stringify(customFields, null, 2))

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
