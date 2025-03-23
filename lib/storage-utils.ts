import type { TimerPreset } from "@/types/shell-types"
import type { TimerSettings } from "@/types/timer-types"

const PRESETS_STORAGE_KEY = "timer-presets"

// Save a preset to local storage
export const savePreset = (preset: TimerPreset): void => {
  const existingPresets = getPresets()
  const updatedPresets = existingPresets.filter((p) => p.id !== preset.id)
  updatedPresets.push(preset)

  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets))
}

// Get all presets from local storage
export const getPresets = (): TimerPreset[] => {
  if (typeof window === "undefined") return []

  const presetsJson = localStorage.getItem(PRESETS_STORAGE_KEY)
  if (!presetsJson) return []

  try {
    return JSON.parse(presetsJson)
  } catch (error) {
    console.error("Failed to parse presets from storage:", error)
    return []
  }
}

// Get a preset by ID
export const getPresetById = (id: string): TimerPreset | undefined => {
  return getPresets().find((preset) => preset.id === id)
}

// Delete a preset by ID
export const deletePreset = (id: string): void => {
  const existingPresets = getPresets()
  const updatedPresets = existingPresets.filter((p) => p.id !== id)
  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets))
}

// Create a new preset from current settings and actions
export const createPreset = (
  name: string,
  description: string,
  settings: TimerSettings,
  actions: TimerPreset["actions"],
): TimerPreset => {
  const now = Date.now()

  return {
    id: `preset-${now}`,
    name,
    description,
    createdAt: now,
    updatedAt: now,
    settings,
    actions,
  }
}

