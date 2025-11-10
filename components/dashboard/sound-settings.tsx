'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import soundManager from '@/lib/utils/soundManager'

export function SoundSettings() {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted)
  const [volume, setVolume] = useState(soundManager.volume)

  useEffect(() => {
    setIsMuted(soundManager.isMuted)
    setVolume(soundManager.volume)
  }, [])

  const handleToggle = () => {
    soundManager.toggleMute()
    setIsMuted(soundManager.isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    soundManager.setVolume(newVolume)
    setVolume(newVolume)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sound Settings</CardTitle>
        <CardDescription>Manage your sound preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="sound-toggle" checked={!isMuted} onCheckedChange={handleToggle} />
          <Label htmlFor="sound-toggle">Enable Sounds</Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="volume-slider">Volume</Label>
          <Slider
            id="volume-slider"
            min={0}
            max={1}
            step={0.1}
            value={[volume]}
            onValueChange={handleVolumeChange}
            disabled={isMuted}
          />
        </div>
      </CardContent>
    </Card>
  )
}
