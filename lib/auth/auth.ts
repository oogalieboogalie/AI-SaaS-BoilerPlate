import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/database/supabase'
import { User, Team, TeamRole, Permission, ROLE_PERMISSIONS } from '@/types'

export async function getUser(): Promise<User | null> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  return user
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return user
}

export async function getUserTeams(
  userId: string,
): Promise<(Team & { userRole: string })[]> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: teamMemberships } = await supabase
    .from('team_members')
    .select(
      `
      id,
      role,
      team_id,
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
    .eq('user_id', userId)

  if (!teamMemberships) return []

  return teamMemberships
    .filter((membership) => membership.teams)
    .map((membership) => {
      const team = membership.teams as any
      return {
        id: team.id,
        name: team.name,
        slug: team.slug,
        plan: team.plan,
        credits: team.credits,
        max_credits: team.max_credits,
        owner_id: team.owner_id,
        created_at: team.created_at,
        updated_at: team.updated_at,
        userRole: membership.role,
      }
    })
}

export async function getUserTeamRole(
  userId: string,
  teamId: string,
): Promise<TeamRole | null> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .single()

  return (membership?.role as TeamRole) || null
}

export async function hasPermission(
  userId: string,
  teamId: string,
  permission: Permission,
): Promise<boolean> {
  const role = await getUserTeamRole(userId, teamId)

  if (!role) return false

  return ROLE_PERMISSIONS[role].includes(permission)
}

export async function requirePermission(
  userId: string,
  teamId: string,
  permission: Permission,
): Promise<void> {
  const hasAccess = await hasPermission(userId, teamId, permission)

  if (!hasAccess) {
    throw new Error('Insufficient permissions')
  }
}

export async function getTeamWithMembers(teamId: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: team } = await supabase
    .from('teams')
    .select(
      `
      *,
      team_members (
        id,
        role,
        created_at,
        users:user_id (
          id,
          name,
          email,
          avatar_url
        )
      )
    `,
    )
    .eq('id', teamId)
    .single()

  return team
}

export async function createTeam(userId: string, name: string, slug: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: team, error } = await supabase
    .from('teams')
    .insert({
      name,
      slug,
      owner_id: userId,
    })
    .select()
    .single()

  if (error) throw error

  return team
}

export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: TeamRole = TeamRole.MEMBER,
) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // First, check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!existingUser) {
    throw new Error('User not found. They need to sign up first.')
  }

  // Check if already a member
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', existingUser.id)
    .single()

  if (existingMembership) {
    throw new Error('User is already a team member')
  }

  // Add to team
  const { data: membership, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: existingUser.id,
      role,
    })
    .select()
    .single()

  if (error) throw error

  return membership
}

export async function removeTeamMember(teamId: string, userId: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  role: TeamRole,
) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) throw error
}
