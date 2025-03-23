export interface ShellAction {
  id: string
  name: string
  command: string
  enabled: boolean
  category?: string
  description?: string
  isCustom?: boolean
}

export interface TimerPreset {
  id: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
  settings: {
    duration: number
    theme: {
      backgroundColor: string
      textColor: string
      accentColor: string
      fontSize: string
      fontWeight: string
      borderRadius: string
      shadow: string
    }
    showMilliseconds: boolean
    playSound: boolean
    soundUrl: string
  }
  actions: ShellAction[]
}

