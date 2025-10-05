import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function TeamsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams</CardTitle>
        <CardDescription>
          Select a team from the sidebar to view its settings, or create a new
          one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Please select a team from the navigation on the left.</p>
      </CardContent>
    </Card>
  )
}
