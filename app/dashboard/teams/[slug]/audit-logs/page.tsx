import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

async function getAuditLogs(teamId: string) {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, user:users(name, email)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch audit logs:', error)
    return []
  }
  return data
}

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

export default async function AuditLogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const team = await getTeam(slug)
  const logs = await getAuditLogs(team.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          A log of all important events that have happened in your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge>{log.action}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{log.user?.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {log.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(log.created_at), 'PPP p')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
