"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TimerComponent from "@/components/timer-component"
import TimerSettings from "@/components/timer-settings"
import ShellActionSettings from "@/components/shell-action-settings"
import TimerPresets from "@/components/timer-presets"
import AppToolbar from "@/components/app-toolbar"
import type { TimerSettings as TimerSettingsType } from "@/types/timer-types"
import type { ShellAction, TimerPreset } from "@/types/shell-types"

export default function Home() {
  const [timerSettings, setTimerSettings] = useState<TimerSettingsType>({
    duration: 25 * 60, // 25 minutes in seconds
    theme: {
      backgroundColor: "#1e293b",
      textColor: "#ffffff",
      accentColor: "#3b82f6",
      fontSize: "text-6xl",
      fontWeight: "font-bold",
      borderRadius: "rounded-xl",
      shadow: "shadow-lg",
    },
    showMilliseconds: true,
    playSound: true,
    soundUrl: "/notification.mp3",
  })

  const [shellActions, setShellActions] = useState<ShellAction[]>([
    { id: "1", name: "Notification", command: 'echo "Timer completed!"', enabled: true },
  ])

  const [initialSettings, setInitialSettings] = useState<TimerSettingsType>(timerSettings)
  const [initialActions, setInitialActions] = useState<ShellAction[]>(shellActions)
  const [hasChanges, setHasChanges] = useState(false)

  // Check for changes when settings or actions change
  useEffect(() => {
    const settingsChanged = JSON.stringify(timerSettings) !== JSON.stringify(initialSettings)
    const actionsChanged = JSON.stringify(shellActions) !== JSON.stringify(initialActions)

    setHasChanges(settingsChanged || actionsChanged)
  }, [timerSettings, shellActions, initialSettings, initialActions])

  // Handle loading a preset
  const handleLoadPreset = (preset: TimerPreset) => {
    setTimerSettings(preset.settings)
    setShellActions(preset.actions)

    // Update initial state to match the loaded preset
    setInitialSettings(preset.settings)
    setInitialActions(preset.actions)
    setHasChanges(false)
  }

  return (
    <main className="container mx-auto p-4">
      <AppToolbar
        currentSettings={timerSettings}
        currentActions={shellActions}
        hasChanges={hasChanges}
        onLoadPreset={handleLoadPreset}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2">
          <TimerComponent settings={timerSettings} shellActions={shellActions} />
        </div>

        <div className="bg-card rounded-lg shadow-md p-4">
          <Tabs defaultValue="appearance">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance">
              <TimerSettings settings={timerSettings} onSettingsChange={setTimerSettings} />
            </TabsContent>

            <TabsContent value="actions">
              <ShellActionSettings actions={shellActions} onActionsChange={setShellActions} />
            </TabsContent>

            <TabsContent value="presets">
              <TimerPresets
                currentSettings={timerSettings}
                currentActions={shellActions}
                onLoadPreset={handleLoadPreset}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

