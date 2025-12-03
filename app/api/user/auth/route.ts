import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Microsoft Graph API endpoint for user profile
 */
const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName,surname,lastName,jobTitle,department'

/**
 * Fetches user profile data from Microsoft Graph API
 * @param accessToken - The access token from MSAL
 * @returns User profile data
 */
async function fetchUserProfile(accessToken: string) {
  const response = await fetch(GRAPH_API_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user profile from Microsoft Graph API')
  }

  return await response.json()
}

/**
 * Extracts full name from Microsoft lastName field
 * @param lastName - The lastName field from Microsoft profile
 * @returns Full name
 */
function extractFullName(lastName: string | undefined): string {
  if (!lastName || typeof lastName !== 'string') {
    return ''
  }

  return lastName.trim()
}

/**
 * POST /api/user/auth
 * Validates Microsoft access token and returns user data
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { accessToken } = body

    // Validate access token
    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    // Fetch user profile from Microsoft Graph API
    let profile
    try {
      profile = await fetchUserProfile(accessToken)
    } catch (error) {
      console.error('Graph API error:', error)
      return NextResponse.json(
        { error: 'Failed to validate access token. Please try logging in again.' },
        { status: 401 }
      )
    }

    // Extract user data from profile
    const email = profile.mail || profile.userPrincipalName
    const lastName = profile.surname || profile.lastName // Try both surname and lastName fields
    const jobTitle = profile.jobTitle || ''
    const department = profile.department || ''

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email address not found in Microsoft profile' },
        { status: 400 }
      )
    }

    // Extract full name from lastName field
    const fullName = extractFullName(lastName)
    if (!fullName) {
      return NextResponse.json(
        { error: 'Name not found in Microsoft profile' },
        { status: 400 }
      )
    }

    // Validate department exists
    if (!department) {
      return NextResponse.json(
        { error: 'Department information not found in your Microsoft profile. Please contact Underground Design to request access.' },
        { status: 403 }
      )
    }

    // Check if department is in allowlist (case-insensitive)
    const allowedDept = await prisma.allowedDepartment.findFirst({
      where: {
        name: {
          equals: department,
          mode: 'insensitive'
        },
        isActive: true
      }
    })

    if (!allowedDept) {
      return NextResponse.json(
        { error: `Your department "${department}" is not currently authorized to access this form. Please contact Underground Design to request access for your department.` },
        { status: 403 }
      )
    }

    const service = allowedDept.displayName || allowedDept.name

    // Return user data
    return NextResponse.json({
      email,
      name: fullName,
      position: jobTitle,
      service,
      department: allowedDept.name,
    })
  } catch (error) {
    console.error('User auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 }
    )
  }
}
