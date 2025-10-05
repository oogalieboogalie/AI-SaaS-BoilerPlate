'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Key, Plus, Trash } from 'lucide-react'

const createKeySchema = z.object({
  name: z.string().min(3, 'Key name must be at least 3 characters'),
})

type ApiKey = {
  id: string
  name: string
  key_prefix: string
  created_at: string
}

export function ApiKeyManager({ teamId }: { teamId: string }) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKey, setNewKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createKeySchema),
  })

  const fetchKeys = async () => {
    if (!teamId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/keys`)
      if (!response.ok) {
        throw new Error('Failed to fetch API keys')
      }
      const data = await response.json()
      setKeys(data)
    } catch (error) {
      toast.error('Could not load your API keys.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

  const handleCreateKey = async (data: z.infer<typeof createKeySchema>) => {
    setIsCreating(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to create API key')
      }
      const result = await response.json()
      setNewKey(result.apiKey)
      toast.success('API Key created successfully!')
      reset()
      fetchKeys() // Refresh the list
    } catch (error) {
      toast.error('Could not create API key. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    setIsRevoking(keyId)
    try {
      const response = await fetch(`/api/teams/${teamId}/keys/${keyId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to revoke API key')
      }
      toast.success('API Key revoked successfully.')
      setKeys(keys.filter((key) => key.id !== keyId))
    } catch (error) {
      toast.error('Could not revoke API key. Please try again.')
    } finally {
      setIsRevoking(null)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      {newKey && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
          <CardHeader>
            <CardTitle>New API Key Generated</CardTitle>
            <CardDescription>
              Please copy your new API key. For your security, this is the only
              time it will be displayed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input readOnly value={newKey} className="font-mono" />
              <Button onClick={() => navigator.clipboard.writeText(newKey)}>
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Give your new key a descriptive name to help you identify it later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(handleCreateKey)}
            className="flex items-start space-x-2"
          >
            <div className="flex-grow">
              <Input
                {...register('name')}
                placeholder="e.g., My Production Server"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                'Creating...'
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Create Key
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>
            These are the keys currently active for your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keys.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No active API keys.
              </p>
            ) : (
              keys.map((key) => (
                <div
                  key={key.id}
                  className="bg-muted flex items-center justify-between rounded-md p-3"
                >
                  <div className="flex items-center space-x-4">
                    <Key className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="font-semibold">{key.name}</p>
                      <p className="text-muted-foreground font-mono text-sm">
                        {key.key_prefix}...
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeKey(key.id)}
                    disabled={isRevoking === key.id}
                  >
                    {isRevoking === key.id ? (
                      'Revoking...'
                    ) : (
                      <>
                        <Trash className="mr-2 h-4 w-4" /> Revoke
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
