import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { requireAuth, getUserTeams } from '@/lib/auth/auth'

export default async function DashboardPage() {
  const user = await requireAuth()
  const teams = await getUserTeams(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {user.name}! Here&apos;s an overview of your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Your team memberships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Credits</CardTitle>
            <CardDescription>Total credits across all teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.reduce((sum, team) => sum + (team.credits || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Plans</CardTitle>
            <CardDescription>Subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.filter((team) => team.plan !== 'free').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest team activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            No recent activity to display.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
