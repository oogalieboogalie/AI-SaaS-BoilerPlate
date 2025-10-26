import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAuditLog } from '@/lib/audit/audit'
import { errorHandler } from '@/lib/errors/errorHandler'

const updateTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

async function checkUserRole(supabase: any, userId: string, teamId: string) {
  const { data: member, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .single()

  if (error || !member) {
    return null
  }
  return member.role
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userRole = await checkUserRole(supabase, session.user.id, teamId)
    if (userRole !== 'owner') {
      return new NextResponse(
        'Forbidden: Only team owners can update team settings.',
        { status: 403 },
      )
    }

    const body = await request.json()
    const validation = updateTeamSchema.safeParse(body)

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 })
    }

    const { name } = validation.data

    const { error } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', teamId)

    if (error) {
      console.error('Error updating team:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    await createAuditLog({
      teamId: teamId,
      userId: session.user.id,
      action: 'team.updated',
      details: {
        updatedFields: { name },
      },
    })

    return NextResponse.json({ message: 'Team updated successfully' })
  } catch (error) {
    console.error('[TEAM_UPDATE_ERROR]', error)
    return errorHandler(error)
  }
}
