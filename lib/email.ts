type ProjectStatus = 'SUBMITTED' | 'QUEUED' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETE'

interface StatusUpdateEmailData {
  to: string
  name: string
  eventName: string
  ticketId: string
  status: ProjectStatus
  queuePosition?: number | null
  totalInQueue?: number
  assignedTo?: string | null
  estimatedCompletionDate?: Date | null
}

export async function sendConfirmationEmail(
  to: string,
  name: string,
  eventName: string,
  ticketId?: string,
  addOnsTotal?: number,
  selectedAddOns?: string[]
): Promise<boolean> {
  const apiKey = process.env.EMAIL_API_KEY
  const from = process.env.EMAIL_FROM || 'noreply@undergrounddesign.ca'

  if (!apiKey) {
    console.warn('Email API key not configured. Skipping email confirmation.')
    return false
  }

  // This is a template for SendGrid or Resend
  // You can adapt this based on your email service provider

  const addOnsSection = addOnsTotal && addOnsTotal > 0 ? `

Add-ons Selected: ${selectedAddOns && selectedAddOns.length > 0 ? selectedAddOns.join(', ') : 'None'}
Total Add-ons Cost: $${addOnsTotal.toFixed(2)}
` : ''

  const emailBody = `
Hi ${name},

Thank you for submitting your project request for "${eventName}"!

We've received your request and our team will review it shortly. You should hear back from us within 1-2 business days.

${ticketId ? `Your reference number is: ${ticketId}` : ''}
${addOnsSection}
If you have any questions, please contact us at ugmanager@msu.mcmaster.ca.

Best regards,
Underground Design Team
McMaster Student Union

---
This is an automated message. Please do not reply to this email.
  `.trim()

  try {
    // Example for a generic email API
    // Adapt this to your specific email service (SendGrid, Resend, etc.)
    const response = await fetch('https://api.your-email-service.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Project Request Confirmation - ${eventName}`,
        text: emailBody,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    return false
  }
}

function getStatusDescription(status: ProjectStatus): { title: string; description: string; color: string } {
  switch (status) {
    case 'SUBMITTED':
      return {
        title: 'Submitted',
        description: 'Your project has been submitted and is awaiting review by our team.',
        color: '#9333ea'
      }
    case 'QUEUED':
      return {
        title: 'In Queue',
        description: 'Your project is in our queue and will be started soon.',
        color: '#eab308'
      }
    case 'IN_PROGRESS':
      return {
        title: 'In Progress',
        description: 'Great news! We are actively working on your project.',
        color: '#3b82f6'
      }
    case 'REVIEW':
      return {
        title: 'Under Review',
        description: 'Your project is being reviewed for quality assurance.',
        color: '#f97316'
      }
    case 'COMPLETE':
      return {
        title: 'Complete',
        description: 'Your project is complete! We will contact you shortly with the final deliverables.',
        color: '#16a34a'
      }
    default:
      return {
        title: status,
        description: 'Your project status has been updated.',
        color: '#6b7280'
      }
  }
}

export async function sendStatusUpdateEmail(data: StatusUpdateEmailData): Promise<boolean> {
  const apiKey = process.env.EMAIL_API_KEY
  const from = process.env.EMAIL_FROM || 'noreply@undergrounddesign.ca'

  if (!apiKey) {
    console.warn('Email API key not configured. Skipping status update email.')
    return false
  }

  const statusInfo = getStatusDescription(data.status)
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${data.ticketId}`

  // Create HTML email with Underground branding
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1C3450; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #0f243a; padding: 30px 20px; text-align: center; }
    .logo { max-width: 200px; height: auto; }
    .content { padding: 30px 20px; }
    .status-badge { display: inline-block; padding: 10px 20px; border-radius: 8px; color: white; font-weight: bold; margin: 20px 0; }
    .info-box { background-color: #f0f9ff; border-left: 4px solid #A6E7DE; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .queue-info { background-color: #fef9c3; border-left: 4px solid #eab308; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #1C3450; color: #A6E7DE; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background-color: #0f243a; color: #A6E7DE; padding: 20px; text-align: center; font-size: 12px; }
    .divider { height: 1px; background-color: #e5e7eb; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header with Logo -->
    <div class="header">
      <img src="cid:underground-logo" alt="Underground Design + Media" class="logo" />
    </div>

    <!-- Content -->
    <div class="content">
      <h1 style="color: #1C3450; margin-top: 0;">Project Status Update</h1>

      <p>Hi ${data.name},</p>

      <p>Your project <strong>"${data.eventName}"</strong> has been updated.</p>

      <!-- Status Badge -->
      <div style="text-align: center;">
        <span class="status-badge" style="background-color: ${statusInfo.color};">
          ${statusInfo.title}
        </span>
      </div>

      <!-- Status Description -->
      <div class="info-box">
        <p style="margin: 0;"><strong>${statusInfo.description}</strong></p>
      </div>

      ${data.status === 'QUEUED' && data.queuePosition ? `
      <!-- Queue Information -->
      <div class="queue-info">
        <p style="margin: 0;"><strong>Queue Status:</strong> Your project is currently in our queue and will be started soon.</p>
      </div>
      ` : ''}

      ${data.assignedTo ? `
      <p><strong>Assigned To:</strong> ${data.assignedTo}</p>
      ` : ''}

      ${data.estimatedCompletionDate ? `
      <p><strong>Estimated Completion:</strong> ${new Date(data.estimatedCompletionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ` : ''}

      <div class="divider"></div>

      <p><strong>Track ID:</strong> ${data.ticketId}</p>

      <!-- Track Project Button -->
      <div style="text-align: center;">
        <a href="${trackingUrl}" class="button">Track Your Project</a>
      </div>

      <div class="divider"></div>

      <p>If you have any questions about your project, please don't hesitate to contact us at <a href="mailto:ugmanager@msu.mcmaster.ca" style="color: #1C3450;">ugmanager@msu.mcmaster.ca</a>.</p>

      <p>Best regards,<br>
      <strong>Underground Design + Media Team</strong><br>
      McMaster Student Union</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 5px 0;">Underground Design + Media</p>
      <p style="margin: 5px 0;">McMaster University Student Centre, B117 Lower Level</p>
      <p style="margin: 5px 0;">Hamilton, ON L8S 4S4</p>
      <p style="margin: 15px 0 5px 0; font-size: 11px; opacity: 0.8;">This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  // Plain text version for email clients that don't support HTML
  const textBody = `
Hi ${data.name},

Your project "${data.eventName}" has been updated.

STATUS: ${statusInfo.title}
${statusInfo.description}

${data.status === 'QUEUED' && data.queuePosition ? `
QUEUE STATUS: Your project is currently in our queue and will be started soon.
` : ''}

${data.assignedTo ? `Assigned To: ${data.assignedTo}\n` : ''}
${data.estimatedCompletionDate ? `Estimated Completion: ${new Date(data.estimatedCompletionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n` : ''}

Track ID: ${data.ticketId}

Track your project: ${trackingUrl}

If you have any questions, please contact us at ugmanager@msu.mcmaster.ca.

Best regards,
Underground Design + Media Team
McMaster Student Union

---
This is an automated message. Please do not reply to this email.
  `.trim()

  try {
    // Example for Resend (https://resend.com)
    // If using SendGrid, adjust the API endpoint and payload structure
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: data.to,
        subject: `Project Update: ${data.eventName} - ${statusInfo.title}`,
        html: htmlBody,
        text: textBody,
        attachments: [
          {
            filename: 'underground-logo.png',
            path: '/images/UG_logo_White.png',
            cid: 'underground-logo'
          }
        ]
      }),
    })

    if (response.ok) {
      console.log(`Status update email sent to ${data.to}`)
      return true
    } else {
      const errorText = await response.text()
      console.error('Failed to send status update email:', errorText)
      return false
    }
  } catch (error) {
    console.error('Failed to send status update email:', error)
    return false
  }
}
