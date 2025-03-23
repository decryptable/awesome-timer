"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TimerInput from "@/components/timer-input"
import { ColorPicker } from "@/components/ui/color-picker"
import type { TimerSettings } from "@/types/timer-types"

interface TimerSettingsProps {
  settings: TimerSettings
  onSettingsChange: (settings: TimerSettings) => void
}

export default function TimerSettings({ settings, onSettingsChange }: TimerSettingsProps) {
  const updateSettings = (partialSettings: Partial<TimerSettings>) => {
    onSettingsChange({ ...settings, ...partialSettings })
  }

  const updateTheme = (themeUpdate: Partial<TimerSettings["theme"]>) => {
    onSettingsChange({
      ...settings,
      theme: {
        ...settings.theme,
        ...themeUpdate,
      },
    })
  }

  return (
    <div className="space-y-6">
      <TimerInput duration={settings.duration} onChange={(newDuration) => updateSettings({ duration: newDuration })} />

      <div className="space-y-2">
        <Label htmlFor="backgroundColor">Background Color</Label>
        <ColorPicker
          value={settings.theme.backgroundColor}
          onChange={(value) => updateTheme({ backgroundColor: value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="textColor">Text Color</Label>
        <ColorPicker value={settings.theme.textColor} onChange={(value) => updateTheme({ textColor: value })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accentColor">Accent Color</Label>
        <ColorPicker value={settings.theme.accentColor} onChange={(value) => updateTheme({ accentColor: value })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fontSize">Font Size</Label>
        <Select value={settings.theme.fontSize} onValueChange={(value) => updateTheme({ fontSize: value })}>
          <SelectTrigger id="fontSize">
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text-4xl">Small</SelectItem>
            <SelectItem value="text-5xl">Medium</SelectItem>
            <SelectItem value="text-6xl">Large</SelectItem>
            <SelectItem value="text-7xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fontWeight">Font Weight</Label>
        <Select value={settings.theme.fontWeight} onValueChange={(value) => updateTheme({ fontWeight: value })}>
          <SelectTrigger id="fontWeight">
            <SelectValue placeholder="Select font weight" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="font-normal">Normal</SelectItem>
            <SelectItem value="font-medium">Medium</SelectItem>
            <SelectItem value="font-semibold">Semi Bold</SelectItem>
            <SelectItem value="font-bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="borderRadius">Border Radius</Label>
        <Select value={settings.theme.borderRadius} onValueChange={(value) => updateTheme({ borderRadius: value })}>
          <SelectTrigger id="borderRadius">
            <SelectValue placeholder="Select border radius" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rounded-none">None</SelectItem>
            <SelectItem value="rounded-sm">Small</SelectItem>
            <SelectItem value="rounded-md">Medium</SelectItem>
            <SelectItem value="rounded-lg">Large</SelectItem>
            <SelectItem value="rounded-xl">Extra Large</SelectItem>
            <SelectItem value="rounded-full">Full</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shadow">Shadow</Label>
        <Select value={settings.theme.shadow} onValueChange={(value) => updateTheme({ shadow: value })}>
          <SelectTrigger id="shadow">
            <SelectValue placeholder="Select shadow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shadow-none">None</SelectItem>
            <SelectItem value="shadow-sm">Small</SelectItem>
            <SelectItem value="shadow-md">Medium</SelectItem>
            <SelectItem value="shadow-lg">Large</SelectItem>
            <SelectItem value="shadow-xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showMilliseconds"
          checked={settings.showMilliseconds}
          onCheckedChange={(checked) => updateSettings({ showMilliseconds: checked })}
        />
        <Label htmlFor="showMilliseconds">Show Milliseconds</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="playSound"
          checked={settings.playSound}
          onCheckedChange={(checked) => updateSettings({ playSound: checked })}
        />
        <Label htmlFor="playSound">Play Sound on Completion</Label>
      </div>
    </div>
  )
}

