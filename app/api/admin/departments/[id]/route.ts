import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * DELETE /api/admin/departments/[id]
 * Soft deletes a department (sets isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Soft delete by setting isActive to false
    const department = await prisma.allowedDepartment.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Department deactivated',
      department
    })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/departments/[id]
 * Updates department (reactivate or change names)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, displayName, isActive } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (displayName !== undefined) updateData.displayName = displayName?.trim() || null
    if (isActive !== undefined) updateData.isActive = isActive

    const department = await prisma.allowedDepartment.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ department })
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    )
  }
}
