import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ApiKeyManager } from '@/components/dashboard/api-key-manager'

async function getTeam(slug: string) {
  const supabase = createServerComponentClient({ cookies })
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!team) {
    notFound()
  }
  return team
}

export default async function ApiKeysPage({
  params,
}: {
  params: { slug: string }
}) {
  const team = await getTeam(params.slug)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API Keys</h3>
        <p className="text-muted-foreground text-sm">
          Manage your API keys to access the service programmatically.
        </p>
      </div>
      <ApiKeyManager teamId={team.id} />
    </div>
  )
}
