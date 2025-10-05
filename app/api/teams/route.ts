import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database/supabase'
import { generateSlug } from '@/lib/utils/utils'
import { z } from 'zod'

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(50, 'Team name too long'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { name } = createTeamSchema.parse(body)

    // Generate a unique slug
    const baseSlug = generateSlug(name)
    let slug = baseSlug
    let counter = 1

    // Check if slug already exists and make it unique
    while (true) {
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existingTeam) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create the team
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name,
        slug,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating team:', error)
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data: team }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      )
    }

    console.error('Error in POST /api/teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's teams
    const { data: teamMemberships, error } = await supabase
      .from('team_members')
      .select(
        `
        id,
        role,
        teams:team_id (
          id,
          name,
          slug,
          plan,
          credits,
          max_credits,
          owner_id,
          created_at,
          updated_at
        )
      `,
      )
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 },
      )
    }

    const teams =
      teamMemberships?.map((membership) => ({
        ...membership.teams,
        userRole: membership.role,
      })) || []

    return NextResponse.json({ data: teams })
  } catch (error) {
    console.error('Error in GET /api/teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
