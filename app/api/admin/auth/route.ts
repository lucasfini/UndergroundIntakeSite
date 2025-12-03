import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token required' },
        { status: 401 }
      )
    }

    // Verify the token by calling Microsoft Graph API
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!graphResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Invalid access token' },
        { status: 401 }
      )
    }

    const userData = await graphResponse.json()
    const userEmail = userData.mail || userData.userPrincipalName

    // Check if user email is in the admin list
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase())

    if (!userEmail || !adminEmails.includes(userEmail.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You do not have admin access' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        email: userEmail,
        name: userData.displayName,
      }
    })
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
