import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createAuditLog } from '@/lib/audit/audit'
import { errorHandler } from '@/lib/errors/errorHandler'

const createKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

// Function to generate a secure API key and its hash
const generateApiKey = () => {
  const apiKey = `jules_${crypto.randomBytes(24).toString('hex')}`
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  const keyPrefix = apiKey.substring(0, 8)
  return { apiKey, keyHash, keyPrefix }
}

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

export async function GET(
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

    // RLS will enforce that the user is a member of the team, so we can directly query.
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, created_at, last_used_at, revoked_at')
      .eq('team_id', teamId)
      .is('revoked_at', null) // Only get active keys
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error('[API_KEYS_GET]', error)
    return errorHandler(error)
  }
}

export async function POST(
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

    // Check user role
    const userRole = await checkUserRole(supabase, session.user.id, teamId)
    if (userRole !== 'owner' && userRole !== 'admin') {
      return new NextResponse(
        'Forbidden: You do not have permission to create API keys.',
        { status: 403 },
      )
    }

    const body = await request.json()
    const validation = createKeySchema.safeParse(body)

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 })
    }

    const { name } = validation.data
    const { apiKey, keyHash, keyPrefix } = generateApiKey()

    const { data: newKey, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        team_id: teamId,
        user_id: session.user.id,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating API key:', error)
      // Check for unique constraint violation on key_prefix
      if (error.code === '23505') {
        // This is a rare collision, but we should handle it.
        // We could retry, but for now, returning an error is fine.
        return new NextResponse(
          'Could not create a unique API key. Please try again.',
          { status: 500 },
        )
      }
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    await createAuditLog({
      teamId: teamId,
      userId: session.user.id,
      action: 'api_key.created',
      details: {
        keyId: newKey.id,
        keyName: name,
      },
    })

    // Return the full key, but only this once.
    return NextResponse.json({ name, apiKey })
  } catch (error) {
    console.error('[API_KEYS_POST]', error)
    return errorHandler(error)
  }
}
