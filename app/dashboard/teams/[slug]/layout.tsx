import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { User, Team } from '@/types'

async function getTeam(slug: string) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: team } = await supabase
    .from('teams')
    .select('*, team_members(role)')
    .eq('slug', slug)
    .eq('team_members.user_id', session.user.id)
    .single()

  if (!team) {
    notFound()
  }

  return team
}

const teamNavLinks = [
  { name: 'General Settings', href: '' },
  { name: 'API Keys', href: '/api-keys' },
  { name: 'Audit Logs', href: '/audit-logs' },
  { name: 'Members', href: '/members' },
]

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const team = await getTeam(params.slug)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{team.name}</h2>
        <p className="text-muted-foreground">
          Manage your team settings, members, and API keys.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {teamNavLinks.map((item) => (
              <Link
                key={item.name}
                href={`/dashboard/teams/${params.slug}${item.href}`}
                className="hover:bg-muted inline-flex items-center rounded-md px-3 py-2 text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  )
}
