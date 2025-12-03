import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get Zendesk credentials
    const subdomain = process.env.ZENDESK_SUBDOMAIN
    const zendeskEmail = process.env.ZENDESK_EMAIL
    const apiToken = process.env.ZENDESK_API_TOKEN

    if (!subdomain || !zendeskEmail || !apiToken) {
      console.error('Zendesk credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const auth = Buffer.from(`${zendeskEmail}/token:${apiToken}`).toString('base64')

    // Create Zendesk ticket
    const ticketBody = `
Contact Form Submission

=== CONTACT INFORMATION ===
Name: ${firstName} ${lastName}
Email: ${email}

=== MESSAGE ===
${message}

---
Submitted via Underground Design Contact Form
    `.trim()

    const ticket = {
      subject: `Contact Form: ${firstName} ${lastName}`,
      comment: {
        body: ticketBody,
      },
      requester: {
        name: `${firstName} ${lastName}`,
        email: email,
      },
      priority: 'normal',
      tags: ['contact-form', 'inquiry'],
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
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      ticketId: data.ticket.id,
      message: 'Your message has been sent successfully!',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
