import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAuditLog } from '@/lib/audit/audit'

// Helper to check user role in a team
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

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string; keyId: string } },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check user role for authorization
    const userRole = await checkUserRole(
      supabase,
      session.user.id,
      params.teamId,
    )
    if (userRole !== 'owner' && userRole !== 'admin') {
      return new NextResponse(
        'Forbidden: You do not have permission to revoke API keys.',
        { status: 403 },
      )
    }

    // "Soft delete" the key by setting the revoked_at timestamp.
    // RLS policies will also enforce that the key belongs to the correct team.
    const { error } = await supabase
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', params.keyId)
      .eq('team_id', params.teamId)

    if (error) {
      console.error('Error revoking API key:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    await createAuditLog({
      teamId: params.teamId,
      userId: session.user.id,
      action: 'api_key.revoked',
      details: {
        keyId: params.keyId,
      },
    })

    return new NextResponse(null, { status: 204 }) // 204 No Content for successful deletion
  } catch (error) {
    console.error('[API_KEY_DELETE]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
