'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Team } from '@/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const teamSettingsSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
})

type TeamSettingsFormData = z.infer<typeof teamSettingsSchema>

interface TeamSettingsFormProps {
  team: Team
}

export function TeamSettingsForm({ team }: TeamSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const form = useForm<TeamSettingsFormData>({
    resolver: zodResolver(teamSettingsSchema),
    defaultValues: {
      name: team.name || '',
    },
  })

  const onSubmit = async (data: TeamSettingsFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update team settings.')
      }

      toast.success('Team settings updated successfully!')
      router.refresh() // Refresh the page to show updated data
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Update your team&apos;s name and other general settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Team Name
            </label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium leading-none">
              Team Slug
            </label>
            <Input id="slug" defaultValue={team.slug} disabled />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
