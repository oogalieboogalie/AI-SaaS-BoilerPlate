import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { TeamSettingsForm } from '@/components/dashboard/team-settings-form'
import { Team } from '@/types'

async function getTeam(slug: string): Promise<Team> {
  const supabase = createServerComponentClient({ cookies })
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!team) {
    notFound()
  }
  return team
}

export default async function TeamSettingsPage({
  params,
}: {
  params: { slug: string }
}) {
  const team = await getTeam(params.slug)

  return <TeamSettingsForm team={team} />
}
